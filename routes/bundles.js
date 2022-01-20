var express = require('express');
var router = express.Router();
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria }=require('../utils/common')
const {findone,findall , createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow 
	,	deleterow
}=require('../utils/db')
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
const {create_uuid_via_namespace }=require('../utils/common')
/* GET home page. */
/** desc bundles;
| name        | varchar(500)   
| description | varchar(1000)  
| uuid        | varchar(80)    
| username    | varchar(80)    
| active      | tinyint(4)     
*/
router.post ('/', (req,res)=>{
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let { name,description}=req.body ; LOGGER('' , req.body )
	let uuid = create_uuid_via_namespace( `${username}_${name}` ) 
	findone('bundles', { username , name } ).then(resp=>{
		if ( resp){resperr(res, messages.MSG_DATADUPLICATE) ; return }
		else {}
		createrow ( 'bundles' , { username, name }).then(resp=>{
			respok( res , null,null,{payload:{ uuid } } )
		})
	})
})
router.get('/', function(req, res, next) {
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	findall ( 'bundles', {
		username 
	}).then(list => {
		respok ( res, null , null , {list } )
	})	
//  res.render('index', { title: 'Express' });
})
const {move_across_columns }=require('../utils/db-balance' ) 
router.post ('/item/:bundleuuid/:itemid/:increasedecrease' , async(req,res)=>{	
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let { bundleuuid , itemid , increasedecrease } =req.params
	let { amount } = req.body
	let aproms = []
	let respbalance = await		findone ('itembalances', { username , itemid } )
	if (respbalance ){}
	else { resperr( res, messages.MSG_BALANCENOTENOUGH , null,{payload:{reason:'acct-not-found'}} ); return }
	amount = + amount
	if ( ISFINITE( amount ) && amount>0 ){}  
	else { resperr(res, messages.MSG_ARGINVALID) ; return }
	if(respbalance.avail >= +amount){}
	else {resperr( res , messages.MSG_BALANCENOTENOUGH , null,{payload:{reason:'balance-not-enough'}}); return }
	aproms[aproms.length] = findone( 'bundles' , {uuid : bundleuuid })
	aproms[aproms.length] =	findone( 'items' , { itemid } )
	Promise.all ( aproms ).then(async resp =>{ 
		if (resp[ 0 ] && resp[ 1 ] ){}
		else { resperr(res , messages.MSG_DATANOTFOUND); return		}

		if ( increasedecrease == 'increase' )	{
			let respmove = await move_across_columns (username,itemid , 'avail' ,'locked' ,  amount)
			if ( respmove){}
			else { resperr( res , messages.MSG_BALANCENOTENOUGH ) ; return }
			let uuid=uuidv4()
	    incrementroworcreate({ table:'bundlehasitems'
				, jfilter:{ bundleuuid , itemid }
				, fieldname:'countfavors'
				, incvalue: amount
								 
			})
			createrow ( 'logactions' , {
				username
				, itemid
				, bundleuuid
				, typestr : 'PUT-ITEM-TO-BUNDLE'
				, uuid
			})
			respok ( res , null, null , {payload : { uuid }} ) 
		}
		else if ( increasedecrease == 'decrease' ){ // need to decrease or delete row entirely
//			let respmove = await move_across_columns ( username , itemid , 'locked' , 'avail' , amount ) 
	//		if ( respmove) {}
		//	else { resperr( res , messages.MSG_BALANCENOTENOUGH) ; return }
			let uuid=uuidv4()
			let respbundleitem = await findone( 'bundlehasitems' , {bundleuuid , itemid } )
			if ( respbundleitem ) {}
			else {resperr( res, messages.MSG_DATANOTFOUND) ; return }
			let amountinbundle = 	respbundleitem.amount
			if ( amountinbundle  >= amount ){}
			else { resperr( res, messags.MSG_BALANCENOTENOUGH ) ; return }

			let respmove = await move_across_columns ( username , itemid , 'locked' , 'avail' , amount ) 
			if ( respmove) {}
			else { resperr( res , messages.MSG_BALANCENOTENOUGH) ; return }
			createrow ( 'logactions' , {
				username
				, itemid
				, bundleuuid
				, typestr : 'REMOVE-ITEM-FROM-BUNDLE'
				, uuid
			})
			respok ( res , null, null , {payload : { uuid }} ) 
								
			let delta=amountinbundle - amount
			switch ( Math.sign ){
				case +1 :
					incrementrow ( { table : 'bundlehasitems' 
						, jfilter : {bundleuuid , itemid } 
						, fieldname : 'amount' 
						, incvalue : - amount } 
					) 
				break 
				case 0 : deleterow ( 'bundlehasitems' , {
					bundleuuid , itemid
				}) 
				break 
			}
		}
	})
})
/**desc bundles;
| name        | varchar(500)     | YES  |     | NULL                |                               |
| description | varchar(1000)    | YES  |     | NULL                |                               |
| uuid        | varchar(80)      | YES  |     | NULL                |                               |
| username    | varchar(80)      | YES  |     | NULL                |                               |
*/
/**desc logactions;
| username       | varchar(80)         | YES  |     | NULL                |                               |
| typestr        | varchar(40)         | YES  |     | NULL                |                               |
| type           | tinyint(4)          | YES  |     | NULL                |                               |
| collectionuuid | varchar(80)         | YES  |     | NULL                |                               |
| itemid         | varchar(100)        | YES  |     | NULL                |                               |
| tokenid        | bigint(20) unsigned | YES  |     | NULL                |                               |
| bundleuuid       | varchar(80)         | YES  |     | NULL                |                               |
*/
/** desc bundlehasitems;
| bundleid   | int(10) unsigned    | YES  |     | NULL                |                               |
| itemid     | varchar(100)        | YES  |     | NULL                |                               |
| bundleuuid | varchar(80)         | YES  |     | NULL                |                               |
| amount     | bigint(20) unsigned | YES  |     | NULL                |                               |
*/
module.exports = router;

