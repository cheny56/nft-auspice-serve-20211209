var express = require('express');
var router = express.Router();
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria }=require('../utils/common')
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
/* GET home page. */
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

router.post ('/item/:bundleuuid/:itemid/:increasedecrease' , (req,res)=>{	
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let { bundleuuid , itemid , increasedecrease } =req.params
	let { amount } = req.body
	let aproms = []
	aproms[aproms.length] = findone( 'bundles' , {uuid : bundleuuid })
	aproms[aproms.length] =	findone( 'items' , { itemid } )
	Promise.all ( aproms ).then(resp =>{ 
		if (resp[ 0 ] && resp[ 1 ] ){}
		else { resperr(res , messages.MSG_DATANOTFOUND); return		}

		if ( increasedecrease == 'increase' )	{
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
			})
		}
		else if ( increasedecrease == 'decrease' ){ // need to decrease or delete row entirely
			
		}
		respok ( res )	
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

