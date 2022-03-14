var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw 
	, ISFINITE
	, filter_json_by_nonnull_criteria }=require('../utils/common')
const {findone,findall , createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow 
	, countrows_scalar
	, logical_op
	, update_min_or_max 
}=require('../utils/db')
const {createifnoneexistent:createifnoneexistent_dbmon , updaterow:updaterow_dbmon }=require('../utils/dbmon')
const {get_ipfsformatcid_file}=require('../utils/ipfscid')
const {getusernamefromsession}=require('../utils/session')
const dbmon=require('../modelsmongo')
const fs=require('fs')
const {messages}=require('../configs/messages')
const {respok,resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
const {CDN_PATH , PRICEUNIT_DEF , NAMESPACE_FOR_HASH , TIMESTRFORMAT
	, MAP_SALESTATUS_STR 
 }=require('../configs/configs')
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
const { v4: uuidv4 } = require('uuid')
const { sha256, } =require('js-sha256')
const { v5: uuidv5 } = require('uuid')
const moment=require('moment')
const { NETTYPE } =require('../configs/net')

// bigint <=2^64-1 == 1.84467441e19
// unix 1894047165 == 2030-01-08...
const MAP_SALE_TYPESTR={
		SPOT_SINGLE :1
	, ENGLISH:2
	, DUTCH : 3
	, BUNDLE : 4
}
///////////////////
const MAP_SELL_TYPESTR={
	COMMON: 1
	, 'AUCTION_ENGLISH' : 2
	, 'AUCTION_DUTCH' : 3
}
const MIN_DURATION_TO_EXPIRY_UNIX=24*3600
const validate_order=jreqbody=>{
	let { expiry , startingtime}=jreqbody
	if ( expiry ) {
		if ( moment.unix(+expiry) - moment.unix(startingtime) >= MIN_DURATION_TO_EXPIRY_UNIX ){}
		else {return {status : false, reason:'expiry'} }
	}
	else {}
	return {status : true}
}
router.post('/maker/seller',async (req, res, next) => { // 
	LOGGER('' , req.body)
	const username=getusernamefromsession( req )
  if(username) {} 
	else {resperr(res , messages.MSG_PLEASELOGIN  , 403);return}
	let { itemid 
		, amount 
		, buyorsell
		, tokenid
		, price
		, priceunit
		, startingtime
		, expiry
		, typestr
	 }=req.body //	respok ( res ); return
	amount = + amount
	if ( itemid && amount ){}
	else {resperr( res, messages.MSG_ARGMISSING, ); return } 
	if ( MAP_SELL_TYPESTR[ typestr ] ) {}
	else {resperr(res , messages.MSG_ARGINVALID, null, {payload: {reason: 'typestr'}}) ; return }

	let respvalidate= validate_order(req.body)
	if ( respvalidate.status  ){}
	else {resperr(res,messages.MSG_ARGINVALID ,null, {payload: {reason : respvalidate.reason }} ) ; return }
	switch( typestr ){
		case 'COMMON' :  
		break
		case 'AUCTION_ENGLISH' : 
		break
		case 'AUCTION_DUTCH' :
		break 
	}
  findone( 'itembalances' , { 
		username 
		, itemid }).then(async resp => {
		if(resp){}
		else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 40320 );  return }
		let {avail}=resp
		avail = + avail
		let uuid = uuidv4()
		if( ISFINITE( avail ) ){
			if( avail >= amount ){}
			else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 79175 );return }
//			let uuid = uuidv4()
			createrow( 'orders' , {
				... req.body
				, username
//				, asset_contract_offer : ADDRESSES.matcher
				, asset_id_bid       : tokenid // ''
				, asset_amount_bid : amount
				, asset_amount_ask : price 
				, makerortaker : 0 //  'maker'
				, uuid
				, supertype : 1
				, supertypestr : 'SELL'
				, expiry
				, expirychar : moment.unix ( expiry).format( TIMESTRFORMAT )
				, typestr
				, price
			}).then(async respcreate =>{
				respok(res , null , null , {payload : {
					uuid
				}})
				updaterow ('itembalances' , { // db['itembalances'].
					username , itemid
				} , {
					avail : resp.avail - amount
				, locked : resp.locked + amount
				} )	// table,jfilter,fieldname,incvalue				// table,jfilter,jupdates
				createrow ( 'logactions' , {
					username
					, typestr : ''
					, itemid
					, tokenid
					, amount
					, nettype : NETTYPE
					, uuid
					, status : 1 
				} )
				switch( typestr ){
					case 'COMMON' : 
					break
					case 'AUCTION_ENGLISH' :  
					break
					case 'AUCTION_DUTCH' :
					break 
				}
			})
			await logical_op( 'items' , {itemid} , 'salestatus' , MAP_SALESTATUS_STR[typestr] , 'or' )
		await update_min_or_max ( 'items' , {itemid} , 'pricemin' , price , 0 ) // oper_min_or_max 
		await update_min_or_max ( 'items' , {itemid} , 'pricemax' , price , 1 ) 
		await createrow ( 'itemhistory' , {
			itemid
			, from_ : username
			, to_: username
			, price
			, priceunit
			, typestr
			, tokenid : (tokenid ? tokenid: null)
//			, txtype : 
			, isonchain : 0
			, nettype : NETTYPE
			, uuid
//			, txhash 	
		})
	
		} else {
			resperr(res, messages.MSG_DATA_NOT_FOUND);return
		}
		
	})
})
/**	 desc itemhistory;
| itemid         | varchar(100)     | YES  |     | NULL                |                               |
| iteminstanceid | int(10) unsigned | YES  |     | NULL                |                               |
| from_          | varchar(80)      | YES  |     | NULL                |                               |
| to_            | varchar(80)      | YES  |     | NULL                |                               |
| price          | varchar(20)      | YES  |     | NULL                |                               |
| priceunit      | varchar(20)      | YES  |     | NULL                |                               |
| typestr        | varchar(20)      | YES  |     | NULL                |                               |
| type           | tinyint(4)       | YES  |     | NULL                |                               |
| datahash       | varchar(100)     | YES  |     | NULL                |                               |
| tokenid        | varchar(20)      | YES  |     | NULL                |                               |
| txtype         | tinyint(4)       | YES  |     | NULL                |                               |
| isonchain      | tinyint(4)       | YES  |     | NULL                |                               |
| nettype        | varchar(20)      | YES  |     | NULL                |                               |
| uuid           | varchar(50)      | YES  |     | NULL                |                               |
| status         | tinyint(4)       | YES  |     | NULL                |                               |
| txhash         | varchar(80)      | YES 
*/
///////////////////
router.get('/',(req,res)=>{
	findall ( 'sales' ,{}).then(list =>{
		let count = countrows_scalar ( 'sales' , {} )
		respok (res,null,null , {list ,
			payload : {count}
		})
	})	
})
router.post('/sale/bundle/:uuid' , async(req,res)=>{
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let {		uuid	}=req.params
	let bundle_uuid = uuid
	let {
		 type
		, typestr //
		, amount
		, expiry
		, expirystr
		, price
		, priceunit
	}=req.body
	if ( uuid ){}
	else {resperr( res, messages.MSG_ARGMISSING );return }
	let resp_bundle = await findone( 'bundles' , { uuid , username } )
	if (resp_bundle){}
	else {resperr( res, messages.MSG_DATANOTFOUND ); return}
	let sale_uuid = uuidv5( uuid , NAMESPACE_FOR_HASH )
	findone( 'sales' , {
		uuid : sale_uuid	
	}).then(resp=>{
		if(resp){resperr(res,messages.MSG_DATADUPLICATE ) ; return} 
		else {}
		createrow( 'sales', {
			username
			, amount : 1
			, author : null // possibly many
			, authorfee : null
			, uuid : sale_uuid   
		}).then(resp=>{
			respok ( res )
		})	
	})
})
/**  bundles
    	name    | varchar(500)     | YES  |     | NULL                |                               |
| description | varchar(1000)    | YES  |     | NULL                |                               |
| uuid        | varchar(80)      | YES  |     | NULL                |                               |
| username    | varch
*/
const MAP_SUPERTYPESTR ={
	BUY:2
, buy : 2
, SELL : 1
, sell : 1
}
router.post('/sale/single-kind/signature/:itemid' , async(req,res)=>{
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return } ; LOGGER('' , req.body)
	let { itemid } =req.params
	let { // itemid		, 
		type
		, typestr
		, amount
		, expiry
		, expirystr
		, price
		, priceunit
		, rawdata_to_sign
     , sig_r
     , sig_s
     , sig_v
     , signature
     , datahash
		, supertypestr
	}=req.body
	if ( itemid && itemid.length ) {}
	else {	resperr(res, messages.MSG_ARGMISSING );return }
	amount = + amount
	if ( ISFINITE(amount) && amount>0 ){}
	else {resperr(res,messages.MSG_ARGINVALID) ; return }
//	let respbalance = await findone( 'itembalances' , {itemid , username } )
	//if ( respbalance && respbalance.amount >= amount){}
//	else {resperr( res, messages.MSG_BALANCE_NOT_ENOUGH ); return }
	let uuid = uuidv4()
	let respitem = await findone ('items' , { itemid } ) 
	if ( respitem ){}
	else {resperr( res, messages.MSG_DATANOTFOUND ); return }
	createrow ( 'sales' , {
			username
		, seller : username
		,	itemid
		, amount
		, author : respitem.author
		, authorfee : respitem.authorfee
		, uuid
		, type
		, typestr
	}).then(resp=>{
		respok (res
			, null
			, null
			, { payload : {
				uuid
			}}
		)
		createrow ( 'orders' , {
			username
			, uuid
			, makerortaker : 1
			, sig_r
			, sig_s
			, sig_v
			, signature
			, datahash
			, itemid
			, rawdata_to_sign : typeof rawdata_to_sign=='string'? rawdata_to_sign : STRINGER(rawdata_to_sign) 
		, type
		, typestr
		, type
		, typestr
		, supertypestr
		, supertype : MAP_SUPERTYPESTR [ supertypestr]
		})
	})
})
/**	orders ;
| matcher_contract     | varchar(80)         | YES  |     | NULL                |                               |
| username             | varchar(80)         | YES  |     | NULL                |                               |
| asset_contract_offer | varchar(80)         | YES  |     | NULL                |                               |
| asset_id_offer       | bigint(20)          | YES  |     | NULL                |                               |
| asset_amount_offer   | varchar(20)         | YES  |     | NULL                |                               |
| asset_contract_ask   | varchar(80)         | YES  |     | NULL                |                               |
| asset_id_ask         | bigint(20)          | YES  |     | NULL                |                               |
| asset_amount_ask     | varchar(20)         | YES  |     | NULL                |                               |
| makerortaker         | tinyint(4)          | YES  |     | NULL                |                               |
| uuid                 | varchar(80)         | YES  |     | NULL                |                               |
| sig_r                | varchar(60)         | YES  |     | NULL                |                               |
| sig_s                | varchar(60)         | YES  |     | NULL                |                               |
| sig_v                | varchar(10)         | YES  |     | NULL                |                               |
| signature            | varchar(100)        | YES  |     | NULL                |                               |
+----------------------+---------------------+------+-----+---------------------+----------------
*/
router.post('/sale/single-kind/no-sig' , async(req,res)=>{ //
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let { itemid
		, type
		, typestr //
		, amount
		, expiry
		, expirystr
		, price
		, priceunit
		,
	} = req.body
	if ( itemid && itemid.length ) {}
	else {	resperr(res, messages.MSG_ARGMISSING );return }
	amount = + amount
	if ( ISFINITE(amount) && amount>0 ){}
	else {resperr(res,messages.MSG_ARGINVALID) ; return }
	
	let respbalance = await findone( 'itembalances' , {itemid , username } )
	if ( respbalance && respbalance.amount >= amount){}
	else {resperr( res, messages.MSG_BALANCE_NOT_ENOUGH ); return }
	let uuid = uuidv4()
	createrow ( 'sales' , {
			username
		, seller
		,	itemid
		, amount
		, author
		, authorfee
		, uuid
	}).then(resp=>{
		respok (res
			, null
			, null
			, { payload : {
				uuid
			}}
		)
	})
})
/** itembalances ;
| username  | varchar(80)         | YES  |     | NULL                |                               |
| itemid    | varchar(100)        | YES  |     | NULL                |                               |
| amount    | bigint(20)          | YES  |     | 0                   |                               |
| avail     | bigint(20)          | YES  |     | 0                   |                               |
| locked    | bigint(20)          | YES  |     | 0                   |                               |
| tokenid   | bigint(20) unsigned | YE
*/
/** itemholders
itemid  | varchar(100)        | YES  |     | NULL                |                               |
| tokenid   | bigint(20) unsigned | YES  |     | NULL                |                               |
| username  | varchar(80)         | YES  |     | NULL                |                               |
| amount    | bigint(20) unsigned | YES  |  
*/
/** sales 
| username       | varchar(80)      | YES  |     | NULL                |                               |
| seller         | varchar(80)      | YES  |     | NULL                |                               |
| itemid         | varchar(100)     | YES  |     | NULL                |                               |
| iteminstanceid | int(10) unsigned | YES  |     | NULL                |                               |
| expiryunix     | bigint(20)       | YES  |     | NULL                |                               |
| expiry         | varchar(30)      | YES  |     | NULL                |                               |
| typestr        | varchar(20)      | YES  |     | NULL                |                               |
| type           | tinyint(4)       | YES  |     | NULL                |                               |
| price          | varchar(20)      | YES  |     | NULL                |                               |
| offerprice     | varchar(20)      | YES  |     | NULL                |                               |
| priceunit      | varchar(20)      | YES  |     | NULL                |                         
*/
/** item 
 itemid        | varchar(100)        | YES  |     | NULL                |                               |
| is1copyonly      | tinyint(4)          | YES  |     | 1                   |                               |
| countcopies      | int(10) unsigned    | YES  |     | NULL                |                               |
| countsplitshares | bigint(20) unsigned | YES  |     | NULL                |                               |
| owner            | varchar(80)         | YES  |     | NULL                |                               |
| author           | varchar(80)         | YES  |     | NULL                |                               |
| authorfee        | int(10) unsigned    | YES  |     | NULL                |                               |
| countfavors      | bigint(20) unsigned | YES  |     | 0                   |                               |
| type             | int(10) unsigned    | YES  |     | NULL                |                               |
| typestr          | varchar(20)         | YES  |     | NULL                |                               |
| tokenid          | bigint(20) unsigned | YES  |     | NULL                |                               |
| decimals         | int(11)             | YES  |     | 0                   |                               |
| totalsupply      | bigint(20) unsigned | YES  |     | NULL                |                               |
| uuid             | varchar(80)         
*/

module.exports = router;


