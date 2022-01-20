var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria
	, ISFINITE
 }=require('../utils/common')
const {findone,findall , createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow }=require('../utils/db')
const {createifnoneexistent:createifnoneexistent_dbmon , updaterow:updaterow_dbmon }=require('../utils/dbmon')
const {get_ipfsformatcid_file}=require('../utils/ipfscid')
const {getusernamefromsession}=require('../utils/session')
const dbmon=require('../modelsmongo')
const fs=require('fs')
const {messages}=require('../configs/messages')
const {respok,resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
const {CDN_PATH , PRICEUNIT_DEF }=require('../configs/configs')
const {generateitemid}=require('../utils/items')
const shell = require('shelljs')
const db=require('../models')
const multer=require('multer')
const {MAP_ITEMTXTYPES}=require('../configs/map-itemtxtypes')
const {gettxandwritetodb}=require('../services/query-eth-chain')
const {storefiletoawss3}=require('../utils/repo-s3')
const {or,like}=db.Sequelize.Op // .Op.or
const URL_SELF_DEF='https://collector.place/repo'
const URL_SELF_DEF_BASE='https://collector.place'
const PATH_STORE_DEF='/var/www/html'
const PATH_STORE_DEF_BASE='/var/www/html'
const PATH_STORE_TMP='/tmp/repo'
const URL_IPFS_REPO='http://ipfs.casa'
const {MAP_ACTIONTYPE_CODE , MAP_CODE_ACTIONTYPE}=require('../configs/map-actiontypes')
const STRINGER=JSON.stringify
const PARSER=JSON.parse
const {hashfile}=require('../utils/largefilehash')
let { queryitemdata , queryitemdata_user }=require('../utils/db-custom')

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
router.get( '/:filterkey/:orderkey/:offset/:limit' , (req,res)=>{
	let { filterkey , orderkey , offset , limit } =req.params
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
	switch ( orderkey ){
		case 'expiry' : 
		case 'closefinish' :
		case 'lowprice' :
		case 'highprice' :
		case 'smallbid' :
		case 'lotbid' :   orderkeyval = [ 'id' , 'DESC' ] 
		break
		default : orderkeyval = MAP_ORDERKEY[ orderkey ]
	}
	db['items'].findAll ({raw:true
		, offset
		, limit
		, order :[ orderkeyval ] 
	}).then( respitems =>{
		let aproms=[]
		respitems.forEach ( elemitem=>{
			aproms[aproms.length ] = queryitemdata( elemitem.itemid )
		})
		Promise.all ( aproms).then(list=>{
			respok ( res, null, null, { list } )
		})
	})
})

module.exports = router;

// API.GET /getItemlist/:filter/:sortorder/:offset

 
// 필터 옵션 :  all , single, bundle
// 소팅 옵션 : latest, popular, closefinish,lowprice,highprice,smallbid,lotbid,mostseen,oldest
