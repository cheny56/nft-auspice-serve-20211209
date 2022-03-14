
var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria
	, generaterandomstr
	, create_uuid_via_namespace 
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
// const URL_SELF_DEF='https://collector.place/repo'
// const URL_SELF_DEF_BASE='https://collector.place'
const URL_SELF_DEF='http://itemverse1.net/repo'
const URL_SELF_DEF_BASE='http://itemverse1.net'
const PATH_STORE_DEF='/var/www/html'
const PATH_STORE_DEF_BASE='/var/www/html'
const PATH_STORE_TMP='/var/www/html' // /tmp' // '/tmp/repo'
// const PATH_ STORE_TMP='/tmp' // '/tmp/repo'
const URL_IPFS_REPO='http://ipfs.casa'
const {MAP_ACTIONTYPE_CODE , MAP_CODE_ACTIONTYPE}=require('../configs/map-actiontypes')
const STRINGER=JSON.stringify
const PARSER=JSON.parse
const {hashfile}=require('../utils/largefilehash')
const { v4: uuidv4 } = require('uuid')
const path=require('path')
const {get_ipfsformatcid_str}=require('../utils/ipfscid')
const moment=require('moment')
const geturlfromitemid=itemid=>`${URL_SELF_DEF}/${itemid}/metadata.json`
const cliredisa=require('async-redis').createClient()
const TIME_STR_FORMAT='YYYYMMDDTHHmmss'
const getfilename=file=>{
  const ext=path.extname(file.originalname);
	return `${moment().unix()}-${generaterandomstr(6)}${ext}`
} 
const getfilename_rawfilename=(file)=>{
  const ext=path.extname(file.originalname);
  return `${path.basename(file.originalname, ext)}-${moment().format(TIME_STR_FORMAT)}${ext}`
  // return `${path.basename(file.originalname, ext)}${ext}`
}
let {storefile_from_base64data
	, compose_filename
	, compose_url  
}=require('../utils/files')
const filehandler=multer({
	storage: multer.diskStorage({//		destination(req, file, cb) { cb(null, '../tmp/') },
		destination:'/var/www/html/tmp' // repo' // /tmp' // FILEPATH
		,filename(req,file,cb){ cb(null,getfilename(file) )					
} //		, filename(req, file, cb) {					const ext = path.extname(file.originalname);			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);		},

	}),
	limits: { fileSize: 45 * 1024 * 1024 },
}) 
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

router.post('/mint' ,async (req,res)=>{ // lazy mint
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN , 13974 ); return }
	let { itemid
		, countcopies
		, amount
		, decimals
		, expiry // 
		, categorystr
		, author
		, authorfee	 
	}=req.body
	if ( itemid && itemid.length ) {}
	else {resperr(res, messages.MSG_ARGMISSING );return }
/****** */
  let resp_deny_dup_itemid = await findone('settings' , { key_: 'DENY_DUPLICATE_ID_ON_STORE'} )
  if (resp_deny_dup_itemid && +resp_deny_dup_itemid.value_ > 0 ){
    let resp_item_hexid = await findone('items' , { itemid  , status : 1} )
    if ( resp_item_hexid ){
      resperr( res, messages.MSG_DUPLICATE_ITEMID ) ;return
    }  else {}
  }
  else {}
/****** */
	let uuid = create_uuid_via_namespace ( itemid ) // let uuid = uuidv4()
	let respcreateitem = await createrow ( 'items' , {
		itemid
		, categorystr : categorystr?.substr(0,20 )
		, author : username
		, authorfee	
		, uuid
		, amount
		, decimals
	})
//	.then(async resp=>{
		respok (res
			, null
			, null
			, { payload : {
				uuid
			}}
		)
		createrow ( 'itembalances' , {
			username
		, itemid  
		, amount  
		, avail : amount 
		, locked  : 0
		, tokenid : null 
		, hidden : 0  	
		, visible : 1
		})
		createrow( 'merchandises' , {
			uuid     
			, type : 1 
			, typestr : 'single' // item' 
			, username 
			, price    
			, isonsale : 1 
		})
		let create_collection_on_mint=1
		let respmycollection = await findone( 'collections' , { name : username })
		if ( respmycollection ) {}
		else {
			let respcreatecollection = await createrow ( 'collections' , {
				username
				, name : username
				,	countitems : 1
				, countsales: 0 
				, uuid : create_uuid_via_namespace ( username )  
			})
			respmycollection = respcreatecollection.dataValues
		}
		createrow ( 'colllectionhasitems' , {
			itemid 
			, collectionuuid : respmycollection.uuid 
			, uuid : create_uuid_via_namespace ( `${username}_${respmycollection.uuid}_${itemid}` )
		})
//		findone('settings', {key_:'CREATE_COLLECTION_ON_FIRST_MINT'}).then(resp=>{
	//		if (resp){create_collection_on_mint = + resp.value_}
		//	else {}
//			if ( create_collection_on_mint ){
		//	} else {}

//		})
//	})
})
/** | collectionid   | int(10) unsigned | YES  |     | NULL                |                               |
| itemid         | varchar(100)     | YES  |     | NULL                |                               |
| collectionuuid | varchar(80)      | YES  |     | NULL                |                               |
| uuid           | varchar(5
*/
/**  desc collections;
| username     | varchar(80)         | YES  |     | NULL                |                               |
| value_       | varchar(40)         | YES  |     | NULL                |                               |
| countitems   | int(10) unsigned    | YES  |     | 0                   |                               |
| countholders | bigint(20) unsigned | YES  |     | NULL                |                               |
| countsales   | bigint(20) unsigned | YES  |     | NULL                |                               |
uuid
*/
/** merchandises; 
| uuid      | varchar(50) 
| type      | tinyint(4)  
| typestr   | varchar(20) 
| username  | varchar(80) 
| price     | varchar(20) 
| isonsale  | tinyint(4)  
*/
/** itembalances
| username  | varchar(80)         | YES  |     | NULL
| itemid    | varchar(100)        | YES  |     | NULL
| amount    | bigint(20)          | YES  |     | 0   
| avail     | bigint(20)          | YES  |     | 0   
| locked    | bigint(20)          | YES  |     | 0   
| tokenid   | bigint(20) unsigned | YES  |     | NULL
| hidden    | bigint(20) unsigned | YES  |     | NULL
| visible   | bigint(20) unsigned | YES  | 
*/
/**  itemid        | varchar(100)        | YES  |     | NULL                |                               |
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
router.post('/metadata/:itemid',(req,res)=>{ LOGGER('vg1rGp4uVL',req.body)
	let {
		unlockcontent
		, unlockedcontent
		, countcopies 
		, feezemetadata
		, activeorlazymint
	}=req.body
	const username=getusernamefromsession( req) 
	if ( username ) {}
	else {resperr( res, messages.MSG_PLEASELOGIN );return }
	let {itemid}=req.params
//	LOGGER(req.body)
	let fullpathnamedest=`${PATH_STORE_DEF_BASE}/metadata/${itemid}`
  if (! fs.existsSync( fullpathnamedest )) {   shell.mkdir('-p' , fullpathnamedest ) }
	let timestamp=gettimestr()
	req.body['timestamp'] =timestamp 
	req.body['unixtime']=moment( timestamp ).unix()
	fs.writeFile( `${fullpathnamedest}/meta.json` , STRINGER(req.body), err=>{
		if(err){LOGGER(err) ; resperr(res,messages.MSG_INTERNALERR); return }
		let url = geturlfromitemid(itemid)
		respok(res , null, null , {respdata: url ,
			payload : {
				url
				, storage_s3: ''
				, storage_ipfs : ''
			}	
		})
	})
})

router.post('/store/base64', async(req,res)=>{
	const username = getusernamefromsession ( req ) 
	 if(username){} else {resperr(res,messages.MSG_ARGMISSING);return}
  const {datainbase64,filename  }=req.body// address, 
  LOGGER('tz2e15eKg0' ,filename , datainbase64.substr(0,500 ))
  if(datainbase64 && filename && username){} else {resperr (res,messages.MSG_ARGMISSING);return}
  let hexid =get_ipfsformatcid_str(datainbase64) ;   LOGGER('UeMP2Xvo5a',hexid)
  let resstore = await storefile_from_base64data(datainbase64 , filename, hexid , 'temp') //  type_perm_temp'perm' 
  if(resstore){} else {resperr(res,messages.MSG_INTERNALERR);return }
  LOGGER('My9otEb4Ey' , resstore)
  if(1){  hexid = await get_ipfsformatcid_file(resstore) }
	
  let resp_deny_dup_itemid = await findone('settings' , { key_: 'DENY_DUPLICATE_ID_ON_STORE'} )
  if (resp_deny_dup_itemid && +resp_deny_dup_itemid.value_ > 0 ){
    let resp_item_hexid = await findone('items' , { itemid : hexid , status : 1} )
    if ( resp_item_hexid ){
      resperr( res, messages.MSG_DUPLICATE_ITEMID ) ;return
    }  else {}
  }
  else {}

  let filename01 = compose_filename(hexid , filename ) ; // `http://itemverse1.net`  
	LOGGER('NNi0SPLRqf' , filename01 )
  let url=compose_url( hexid , filename )
  shell.mkdir( '-p' , path.dirname(filename01) )
  fs.rename ( resstore , filename01 ,async err=>{
    if(err){ LOGGER(err)
      resperr(res,messages.MSG_INTERNALERR);return
    }
    respok(res,null,null,{respdata:hexid , payload : {
      url
			, storage_s3:''
			, storage_ipfs : ''
    }})
    var stats = fs.statSync( filename01 ) // resstore 
    let imagedim = await sizeOf( filename01 )
    createifnoneexistent('itemsdatacache',{
      username:username
      , url // :`${URL_SELF_DEF}/${hexid}/${filename}` 
      , datahash:hexid
      , itemid:hexid
      , filesize : stats.size
      , imagewidth : imagedim.width
      , imageheight : imagedim.height
    })
  })
})
router.post('/store/file' , filehandler.single('file' ),async(req,res)=>{ // /:type0
//	res.status(200).send( req )
//	respok ( res, null, null,{reqcontent:req}) 
//	return 
//	let {username}=req.body; 
	const username=getusernamefromsession(req)
	if(username){}
	else {resperr (res,messages.MSG_PLEASELOGIN);return}
//	if(username) {} else {res.status(403).send({status:'ERR', message:messages.MSG_PLEASELOGIN}); return}
//	if(username){} else {respreqinvalid(res,messages.MSG_ARGMISSING);return}
	const filename=req.file.filename
	const fulltmpname=`/var/www/html/tmp/${filename}` // ${PATH_STORE_TMP}/${filename}`
//	const itemid = await hashfile( fulltmpname )
	const itemid = await get_ipfsformatcid_file ( fulltmpname ) 

//	const fullpathname=`${PATH_STORE_DEF}/repo/${itemid}`
	const fullpathname=`/var/www/html/repo/${itemid}`
	const fullpathandfilename=`/var/www/html/repo/${itemid}/${filename}`
	if (! fs.existsSync( fullpathname ) )	{		shell.mkdir('-p' , fullpathname)	}
	fs.rename( fulltmpname , fullpathandfilename , (err)=>{
		if(err){LOGGER(err); resperr(res,messages.MSG_INTERNALERR); return}
		respok(res,null,null,{
			respdata:itemid
			, payload : {url:`${URL_SELF_DEF}/${itemid}/${filename}` 
				, storage_s3:''
				, storage_ipfs : ''
			}
		})
		createifnoneexistent( 'itemsdatacache' , {
			username:username
			, url:`${URL_SELF_DEF}/${itemid}/${filename}` 
			, datahash:itemid
			, itemid
		})
	})
})

router.get('/bykeyvalue/:fieldname/:value',(req,res)=>{
	const {fieldname,value}=req.params
	let jfilter={ }; jfilter[fieldname]= value
	findall('items',{ ... jfilter}).then(resp=>{
		respok(res,null,null,{list:resp})
	})
})
let B_ENFORCE_NO_DUPLICATE_ITEMID=true
router.post( '/report/mint/:hexid/:txhash/:address',async(req,res)=>{
	const username = getusernamefromsession(req)	
	if(username){} else {resperr(res,messages.MSG_PLEASELOGIN , 403);return}
	let {hexid,txhash,address}=req.params ; let itemid=hexid 
	let {url
		, price
		, tokenid 
		, titlename
		, description
		, keywords 
		, priceunit 
		, metadataurl 
		, contract
		, nettype
		, paymeans
		, expiry
		, expirychar
		, categorystr
		, originatorfeeinbp
 }=req.body ; LOGGER(hexid,txhash,price,tokenid)
//	let userdata=getuserdatafromsession(req) ; LOGGER('Tm7uu64bqE' , userdata)
	if( B_ENFORCE_NO_DUPLICATE_ITEMID){
		let respfinditemid = await findone( 'items' , { itemid })
		if(respfinditemid){
			resperr(res,messages.MSG_DATADUPLICATE);return
		} else {}
	}
	findone('users' , {username}).then(userdata=>{
		updaterow('users' , {id:userdata.id} , {
			countcreated: 1 + userdata.countcreated
			, iscreator : 1 // isoriginator : 1
			, countowned : 1 + userdata.countowned //  countowners : 1 + userdata.countowners  
		}).then(resp=>{
			updaterow_dbmon('users' , {id:userdata.id} , {
				countcreated: 1 + userdata.countcreated
				, iscreator : 1 //isoriginator : 1
				, countowned : 1 + userdata.countowned //  countowners : 1 + userdata.countowners  
			})
		})
	})
/**	let respfind =await findone('itemsdatacache',{itemid:hexid})
	if(respfind){} else {resperr(res,messages.MSG_DATANOTFOUND , 412 );return}
	const {filepath:filepathsrc}=respfind
	let filepathdest=filepathsrc; filepathdest = filepathdest.replace(/\/tmp\//, '/repo/') ; LOGGER(filepathdest)
	const pathnamedest=path.dirname(filepathdest); LOGGER(pathnamedest)
	shell.mkdir('-p' , pathnamedest ) ;  LOGGER('yksnf3Nvi6',filepathsrc , filepathdest)
	fs.rename( filepathsrc , filepathdest,_=>{} )
	url=respfind.url.replace(/\/tmp\// , '/repo/')
*/
	let uuid = uuidv4()
	respok(res,null,null, {
		payload : { uuid
		}
// url:url
	})
	description=STRINGER(description)
	const timestr_now=gettimestr()
//	let itemid=hexid
//	let userdata = getuserdatafromsession(req)
	if( categorystr ){} 
	else {
		categorystr = 'etc' // await getrandomrowfield('itemcategories' , 'categorystr' )
	}
	let status=-1 
//	let respcreateitem = await createifnoneexistent			('items',{txhash:txhash},		{url:url 
	let respcreateitem = await createifnoneexistent			('items',{ itemid },		{url:url 
		,price:price
		, uploader:address
		,isminted:1
		,price:price
		,	priceunit: priceunit? priceunit:PRICEUNIT_DEF 
		, itemid 
		, titlename:titlename 
		, description:description 
		, keywords:keywords
//		, currentowner:username
		, originator:username
		, metadataurl , contract
		,	owner : username
		, tokenid
		, categorystr
		, nettype
		, uuid
	// txhash
		, status
		, authorfee : originatorfeeinbp 
		, originatorfeeinbp
		, author : username 
 })
//	.then(resp=>{
/*		createifnoneexistent_dbmon('items',{id:respcreateitem.dataValues.id } , 	{txhash:txhash , url:url 
			,price:price, uploader:address,isminted:1,price:price
		, priceunit:priceunit?priceunit : PRICEUNIT_DEF 
		, itemid:hexid , titlename:titlename , description:description , keywords:keywords , createdat:gettimestr() 
		, description:description
		, currentowner:username
		, originator:username
		, metadataurl , contract
		,	owner : username
		, tokenid 
		, categorystr
		, nettype
		, uuid
		, status
	// txhash
		, originatorfeeinbp
		}) */
//	})
/*	createifnoneexistent('collections' , {itemid:hexid},{
		username:address
		, datahash:hexid // , txhash:txhash
		, originator:address
		, seller:username // address
		, url:url
	}) */
	createifnoneexistent( 'itemhistory',{itemid:hexid , txhash } , { // txhash:txhash	}, {
		itemid: hexid
		, datahash:hexid
		, tokenid:tokenid
//		, seller:username // address
	//	, buyer:username // null
		, price
		, priceunit
		, txtype: MAP_ITEMTXTYPES['MINT_SELL']
		, isonchain : 1 // :nettype=='BNB'? 1:0
//		, chai ntype : nettype // =='BNB'? 'ETH':null
		, type : MAP_ITEMTXTYPES['MINT_SELL']
		, typestr: 'MINT_SELL'
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		, status
	}).then( resp_23 => {
/*		dbmon.itemhistory.create({
			id : resp_23.dataValues.id
				,	itemid: hexid
				, datahash:hexid
				, tokenid:tokenid
				, seller: username // address
				, buyer: username // null
				, price
				, priceunit
				, txtype: MAP_ITEMTXTYPES['MINT_SELL']
				, createdat: timestr_now 
	, isonchain:priceunit=='ETH'? 1:0
//	, chain type:priceunit=='ETH'? 'ETH':null 
		, type : MAP_ITEMTXTYPES['MINT_SELL']
		, typestr: 'MINT_SELL' 
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		, txhash:txhash	
		, status
		}).then(respmoncreate=>{LOGGER('IAiiGQxdnw' ,respmoncreate )}).catch(err=>{LOGGER('LelKcN2LbB',err )}) */
	})
	createrow('logactions' , {
//	    createdat: timestr_now	
     username :	username
    , actiontype: MAP_ACTIONTYPE_CODE['TX_MINT_SELL'] // MAP_ITEMTXTYPES['MINT_SELL']
    , actionname : 'TX_MINT_SELL'
//    , seller : username
  //  , buyer : username
    , amount  : price
    , note : null
		, itemid :  hexid 
		, price
	 ,	priceunit // : ''
		, typestr: 'MINT_SELL'
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		,txhash
		, status
	})
	.then(resp=>{
/*		dbmon.logactions.create({
			id: resp.dataValues.id	
 ,		createdat: timestr_now	
    , username :	username
    , actiontype: MAP_ACTIONTYPE_CODE['TX_MINT_SELL'] // MAP_ITEMTXTYPES['MINT_SELL']
    , actionname : 'TX_MINT_SELL'
    , seller : username
    , buyer : username
    , amount  : price
    , note : null	
		, itemid :  hexid 
		, price
	 ,	priceunit // : ''
		, typestr: 'MINT_SELL'
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		, txhash
		, status
		}) */
	})
	createrow('transactions', {
		username   :username
		,	itemid:hexid 
		, type      : MAP_ITEMTXTYPES['MINT_SELL']
		, value     : null
		, price     :price
 //   , seller : username
   // , buyer : username
		, originator: username
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		, txhash
		, status
	}).then(resp=>{
/*		dbmon.transactions.create({
		id:resp.dataValues.id
		,		username   :username
		,	itemid:hexid 
		, type      : MAP_ITEMTXTYPES['MINT_SELL']
    , seller : username
    , buyer : username
//	, value     : null
		, price     :price
		, originator: username
		, from_:username
		, to_:username  //		, txhash
		, nettype
		, uuid
		, txhash
		, status
		}) */
	})
	findone('itemsdatacache' , {itemid} ).then(resp=>{
		if(resp){} else {return }
		let { filesize , imagewidth , imageheight }=resp
		createifnoneexistent ('items02', {		itemid	} 
		, {	filesize , imagewidth , imageheight 
		} )
	})
	 true && findone( 'paymeans' , {address : paymeans }).then(resp=>{
		let market = resp.isprimary ? MAP_MARKETTYPE_ID['primary'] : MAP_MARKETTYPE_ID['secondary']
		respcreateitem.update ( {market} ) 
/**		createrow ( 'sales' , {
			itemid
		, username
		, paymeans
		, paymeansname : resp.name
		, ispaymeanstoken : resp.istoken
		, market //   1 : 0 //  MAP_TOKEN_ADDRESS_MARKET_TYPE[paym eans]? MAP_TOKEN_ADDRESS_MARKET_TYPE[payme ans] : 0
		, offerpricechar : price // ''
		, offerpricefloat : price // ''  
		, price
		, priceunit
		, typestr : 'COMMON'
		, expiry
		, expirychar
		, seller : username
		, nettype
		, uuid
		, txhash
		, status
		}) */
	})
	cliredisa.hset('TX-TABLES' ,txhash , STRINGER(
		{type:'MINT'
			,tables:{
				items: 1
				, itemhistory:1
				, logactions:1
				, transactions:1 
				, sales: 1 
			}
			, itemid
		})).then(resp=>{
//		enqueue_tx_toclose( txhash , uuid )		
	})
/** false &&	gettxandwritetodb(txhash).then(resp=>{		LOGGER('JXe01bxqMP',resp)	})	.catch(err=>{LOGGER('vR55t5oZMa',err)})
	const filebasename = path.parse( url ).base // path.basename(filepathdest)
	let filepathdest = compose_filename( hexid , filebasename ) // 'rawdata' 
	storefiletoawss3(filepathdest , hexid )	.then(async resp=>{LOGGER('mW6q6I9odP',resp)
		let urls3 = `${URL_IPFS_REPO}/${hexid}/${filebasename}`
		await updaterow('items' , {itemid:hexid} , {url01: urls3 } )
		updateorcreaterow('filestorages', { itemid } , { urls3 } )
	})	.catch(err=>{LOGGER('vlY2Ni2YFI',err)})
*/
})


module.exports = router;



