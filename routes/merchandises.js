var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria
	, ISFINITE
	, separatebycommas
	, KEYS 
 }=require('../utils/common')
const {findone,findall , createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow
	, countrows_scalar
	, logical_op
 }=require('../utils/db')
const {get_klay_usdt_ticker } =require('../utils/tickers')
const {createifnoneexistent:createifnoneexistent_dbmon , updaterow:updaterow_dbmon }=require('../utils/dbmon')
const {get_ipfsformatcid_file}=require('../utils/ipfscid')
const {getusernamefromsession}=require('../utils/session')
const dbmon=require('../modelsmongo')
const fs=require('fs')
const {messages}=require('../configs/messages')
const {respok,resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
const {CDN_PATH , PRICEUNIT_DEF , MAP_SALESTATUS_STR }=require('../configs/configs')
const {generateitemid}=require('../utils/items')
const shell = require('shelljs')
const db=require('../models')
const multer=require('multer')
const {MAP_ITEMTXTYPES}=require('../configs/map-itemtxtypes')
const {gettxandwritetodb}=require('../services/query-eth-chain')
const {storefiletoawss3}=require('../utils/repo-s3')
let {Op}=db.Sequelize
const {or,like}=db.Sequelize.Op // .Op.or
const URL_SELF_DEF='https://collector.place/repo'
const URL_SELF_DEF_BASE='https://collector.place'
const PATH_STORE_DEF='/var/www/html'
const PATH_STORE_DEF_BASE='/var/www/html'
const PATH_STORE_TMP='/tmp/repo'
const URL_IPFS_REPO='http://ipfs.casa'
const { MAP_ACTIONTYPE_CODE , MAP_CODE_ACTIONTYPE }=require('../configs/map-actiontypes')
const STRINGER=JSON.stringify
const PARSER=JSON.parse
const {hashfile}=require('../utils/largefilehash')
let { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
const { expand_fieldval_matches} =require('../utils/db-tentative' ) 
const MAP_FILTERKEY={all: 1 , single :1 , bundle : 1}
const MAP_ORDERKEY= {
	 popular :		['countfavors' ,'DESC'	] // items
	, mostseen :	['countviews',	'DESC'	] // items
	, oldest :		[ 'id' ,				'ASC'		] // items
	, latest :		[ 'id' ,				'DESC'	] // items
	, closefinish:['expiry' ,			'ASC'		] // sales
	, lowprice :	['pricefloat' , 'ASC'		] // sales 
	, highprice : ['pricefloat' , 'DESC'	] // sales
	, smallbid : 1
	, lotbid : 1
}
const convliker=str=>'%' + str + '%'
/** 
new 
has offers
buy now 
on auction */ 
router.get( '/:filterkey/:orderkey/:offset/:limit' ,async (req,res)=>{ LOGGER('',req.params,req.query)
	let { filterkey , orderkey , offset , limit } =req.params
	let { categorystr 
		, salestatusstr 
		, salestatus
		, searchkey
		, pricemin
		, pricemax
		, pricemin_usd
		, pricemax_usd
	 } =req.query
	let username=getusernamefromsession ( req)
	if ( MAP_FILTERKEY[ filterkey ] ){}
	else {resperr( res, messages.MSG_ARGINVALID ,null , {payload:{reason:'filter' } });return }
	if ( MAP_ORDERKEY[ orderkey ] ){}
	else {resperr( res, messages.MSG_ARGINVALID, null, { payload :{reason:'order'}}); return }
	offset= +offset
	limit = +limit
	if ( ISFINITE(offset )){}
	else {resperr( res, messages.MSG_ARGINVALID, null , {payload: {reason:'offset'}});return }
	if ( ISFINITE(limit )){}
	else {resperr( res, messages.MSG_ARGINVALID, null , {payload: {reason:'limit' }});return }
	let orderkeyval  
	switch ( orderkey ) {
		case 'expiry' : 
		case 'closefinish' :
		case 'lowprice' :
		case 'highprice' :
		case 'smallbid' :
		case 'lotbid' :   orderkeyval = [ 'id' , 'DESC' ] 
		break
		default : orderkeyval = MAP_ORDERKEY[ orderkey ]
	}
	let jfilter={}
	if ( categorystr && categorystr.length ) {
		if ( categorystr.match ( /all/i )){			
		}
		else {
			
			let arrfieldvalues = separatebycommas( categorystr )
			let found_all = arrfieldvalues.find( elem=>elem.match( /^all$/i ) )
			if ( found_all ) {}
			else { 
				jfilter = expand_fieldval_matches ( 'categorystr' , arrfieldvalues )
			}
		}
	}
	else {}
	if ( salestatusstr ){
		if ( MAP_SALESTATUS_STR[ salestatusstr ] ) {}
		else {resperr(res, messages.MSG_ARGINVALID,null , {payload:{reason : 'salestatusstr' }} ) ; return}
		jfilter[ 'salestatus' ]= MAP_SALESTATUS_STR[ salestatusstr ]  // data >> 2) & 8) | ((data >> 1) & 4) | (data & 3) FROM ...
	}
	else {}
	let jfilter_01={}
const MAP_SEARCH_FIELDS=['titlename','description','author']
	if ( searchkey ) {
		const liker=convliker ( searchkey )
/**	let arrfields=[]
		arrfields = MAP_SEARCH_FIELDS.map ( 
			elem=>{ let jdata={}; 
//			jdata[elem ] ={ [Op.like] : liker}; 
			jdata[ elem] = searchkey
			return jdata
		} )
		LOGGER(arrfields)
		jfilter={ ... jfilter, [Op.pr] : arrfields }
*/
		let jfilter_02 = { 	[ Op.or ] :[
          {itemid:      {[Op.like] : liker }}
        , {originator:  {[Op.like] : liker }}
        , {description: {[Op.like] : liker }}
      	, {titlename:		{[Op.like] : liker }}
				]
    }
		jfilter= { ... jfilter, ... jfilter_02 } 

}
	else {}
	if ( salestatus ) {
		salestatus = + salestatus
		let arrfields=[]
		for ( let idx =0; idx <4; idx ++) {
			let exponent= 2 ** idx
			if ( salestatus & exponent ){}
			else {continue}
//			arrfields.push (STRINGER( db.Sequelize.literal( `salestatus & ${exponent} = ${exponent}` ),null,0) )
			let jdata={}
//			jdata[ `salestatus${exponent}` ] =1 
			jdata[`salestatus${exponent}`] = { [Op.eq] : 1 }
//			arrfields.push ( jdata )
		}
		if ( arrfields.length){		// jfilter_01 [ [ Op.or] ] = arrfields
			jfilter= { ... jfilter , [Op.or] : arrfields }
		}
		else {}
	}
//	if ( KEYS(jfilter_01).length){ jfilter= { ... jfilter , ... jfilter_01 } } 
//	else {}
	if ( pricemin ) {pricemin = +pricemin
		if ( ISFINITE(pricemin)){}
		else {resperr( res, messages.MSG_ARGINVALID, null,{payload :{reason:'pricemin'}}) ;return }
		jfilter= { ... jfilter , ... {pricemin : {[Op.gte] : pricemin } } } 
	}
	if ( pricemax ) {pricemax = +pricemax
		if ( ISFINITE(pricemax)){}
		else {resperr( res, messages.MSG_ARGINVALID, null,{payload :{reason:'pricemax'}}) ;return }
		jfilter= { ... jfilter , ... {pricemax : {[Op.lte] : pricemax } } } 
	}
//	if ( ISFINITE( pricemin_usd ) || ISFINITE( pricemax_usd) ) {
	//	await get_klay_usdt_ticker(
//	}
	
	let respcount = countrows_scalar('items' , jfilter)
	db[ 'items' ].findAll ({ raw : true
		, where : jfilter
		, offset
		, limit
		, order :[ orderkeyval ] 
	}).then(async respitems =>{
		let aproms = []
		if ( username) {
			respitems.forEach ( elemitem=>{
				aproms[aproms.length ] = queryitemdata_user( elemitem.itemid , username )
			})
		}	else { 
			respitems.forEach ( elemitem=>{
				aproms[aproms.length ] = queryitemdata( elemitem.itemid  )
			})
		}
		let count=await respcount
		Promise.all ( aproms).then(list=>{
			respok ( res, null, null, { list , payload : { count} } )
		})
	})
})

module.exports = router;

// API.GET /getItemlist/:filter/:sortorder/:offset
// 필터 옵션 :  all , single, bundle
// 소팅 옵션 : latest, popular, closefinish,lowprice,highprice,smallbid,lotbid,mostseen,oldest
