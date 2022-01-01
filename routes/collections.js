var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria
	, KEYS , ISFINITE
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
const { v4: uuidv4 } = require('uuid')
/* GET home page. */

router.post( '/item/:itemid/:amount/:collectionuuid' , async (req,res) => { // if already item assigned to collection
	let username = getusernamefromsession ( req )
	if ( username ) {}
	else { resperr( res, messages.MSG_PLEASELOGIN ); return }
	let { itemid , amount , collectionuuid }	= req.params
	amount = + amount
	if(ISFINITE(amount)){} 
	else {resperr(res, messages.MSG_ARGINVALID , 57770 ); return }
	if ( amount >0 ){}
	else {resperr( res, messages.MSG_ARGINVALID, 15514 ); return }
	findone( 'itembalances' , { username , itemid } ).then( async respitembalances => {
		if( respitembalances)	{}
		else { resperr(res , messages.MSG_DATANOTFOUND ) ; return }
		if ( respitembalances.avail > 0 ){					}
		else {resperr( res, messages.MSG_BALANCE_NOT_ENOUGH );return }
// for the time being, make collection - item binding simple such that check only user item balance 
		let resp_chasi = await findone ( 'collectionhasitems' , { collectionuuid } ) // need to validate amount 
		let ACTION_TYPESTR_DEF_LOCAL = 'PUT-ITEM-TO-COLLECTION'
		if ( resp_chasi ) {				
		}
		else {
			createrow ( 'collectionhasitems' , { collectionid 
				, itemid
				, collectionuuid
			} )
		}
		respok ( res ) 
		createrow ( 'logactions' , {
				username
			, collectionuuid
			, itemid
			, typestr : ACTION_TYPESTR_DEF_LOCAL
		})
		createrow ( 'logcollections' , {
				username
			, collectionuuid
			, itemid
			, typestr : ACTION_TYPESTR_DEF_LOCAL
		} )
//		if ( + resp.avail >= amount ){} // here we should not check on balance , user may want to put limited avail balance in different collections
	//	else {resperr( res, messages.MSG_BALANCE_NOT_ENOUGH );return }
//		upda
	})
})
/**desc logcollections;
| username       | varchar(80)         | YES  |     | NULL                |                               |
| collectionuuid | varchar(100)        | YES  |     | NULL                |                               |
| itemid         | varchar(100)        | YES  |     | NULL                |                               |
| type           | int(10) unsigned    | YES  |     | NULL                |                               |
| typestr        | varchar(40)         | Y
*/
/**logactions;
| username       | varchar(80)         | YES  |     | NULL                |                               |
| typestr        | varchar(20)         | YES  |     | NULL                |                               |
| type           | tinyint(4)          | YES  |     | NULL                |                               |
| collectionuuid | varchar(80)         | YES  |     | NULL                |                               |
| itemid         | varchar(100)        | YES  |     | NULL                |                               |
| tokenid        | bigint(20) unsigned | YES  | 
*/
/**	collections
	username     | varchar(80)      | YES  |     | NULL                |                               |
| name         | varchar(500)     | YES  |     | NULL                |                               |
| description  | varchar(1000)    | YES  |     | NULL                |                               |
| iconimageurl | varchar(1000)    | YES  |     | NULL                |                               |
| count        | int(10) unsigned | YES  |     | NULL                |                               |
| uuid         | varc
*/
/**  collectionhasitems
		 collectionid| int(10) unsigned | YES  |     | NULL                |                               |
| itemid         | varchar(100)     | YES  |     | NULL                |                               |
| collectionuuid | varchar(80)      | YES  |     | NUL
*/
/** itembalances
	 username | varchar(80)         | YES  |     | NULL                |                               |
| itemid    | varchar(100)        | YES  |     | NULL                |                               |
| amount    | bigint(20)          | YES  |     | 0                   |                               |
| avail     | bigint(20)          | YES  |     | 0                   |                               |
| locked    | bigint(20)          | YES  |     | 0                   |                               |
| tokenid   | bigint(20) unsigned | YES  |     | NU
*/
router.put ( '/collection' , (req,res)=>{
	let username = getusernamefromsession ( req )
	if (username) {}
	else { resperr( res, messages.MSG_PLEASELOGIN ); return }
	let { name , description , iconimageurl , uuid } = req.body // , count
	findone ( 'collections' , { username , uuid } ).then(resp => {
		if ( resp ){}
		else { resperr( res , messages.MSG_DATANOTFOUND ); return }
		let jreqbody = req.body
		delete jreqbody.uuid
		KEYS( jreqbody ).forEach ( elem => {
			if (jreqbody [ elem ]){			}
			else {	delete jreqbody [ elem ]	}
		} )
		updaterow ('collections' , { uuid } , { ... jreqbody }).then(resp=>{
			respok ( res )
		})
	})
})

router.post ( '/collection', (req,res)=>{	
	let username = getusernamefromsession ( req )
	if (username) {}
	else { resperr( res, messages.MSG_PLEASELOGIN ); return }
	let { name , description , iconimageurl } = req.body // , count 
	let ACTION_TYPESTR_DEF='CREATE-COLLECTION'
	findone ( 'collections' , { username , name } ).then(resp=>{
		if (resp) {resperr( res , messages.MSG_DATADUPLICATE ) ; return }
		createrow( 'collections' , {... req.body }).then( resp => { 
			respok ( res, null , null , { payload : {
				uuid
			}})
			createrow ( 'logcollections' , {
				username
				, collectionuuid
				, itemid
				, typestr : ACTION_TYPESTR_DEF
			} )
		})
	} )
} )
router.get( '/', (req, res) => {
	let username = getusernamefromsession ( req )
	if (username) {}
	else { resperr( res, messages.MSG_PLEASELOGIN ); return }
	findall ( 'collections' , { username } ).then (resp=>{
		respok ( res, null,null , { list : resp } )
	} )
  // res.render('index', { title: 'Express' });
})

module.exports = router;

