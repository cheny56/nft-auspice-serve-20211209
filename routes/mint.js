var express = require('express')
var router = express.Router()
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
const { v4: uuidv4 } = require('uuid')

const filehandler=multer({
	storage: multer.diskStorage({//		destination(req, file, cb) { cb(null, '../tmp/') },
		destination:'/var/www/html/tmp' // /tmp' // FILEPATH
		,filename(req,file,cb){ cb(null,getfilename(file) )					} //		, filename(req, file, cb) {					const ext = path.extname(file.originalname);			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);		},
	}),
	limits: { fileSize: 5 * 1024 * 1024 },
}) 

router.post('/mint' , (req,res)=>{ // lazy mint
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }
	let { itemid
		, countcopies
		, decimals
		, expiry // 
		, categorystr
		, author
		, authorfee	 
	}=req.body
	if ( itemid && itemid.length ) {}
	else {resperr(res, messages.MSG_ARGMISSING );return }
	let uuid = uuidv4()
	createrow ( 'items' , {
		itemid
		, categorystr
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
	let {itemid}=req.params
	let fullpathnamedest=`${PATH_STORE_DEF_BASE}/metadata/${itemid}`
  if (! fs.existsSync( fullpathnamedest )) {   shell.mkdir('-p' , fullpathnamedest ) }
	let timestamp=gettimestr()
	req.body['timestamp'] =timestamp 
	req.body['unixtime']=moment( timestamp ).unix()
	fs.writeFile( `${fullpathnamedest}/meta.json` , STRINGER(req.body), err=>{
		if(err){LOGGER(err) ; resperr(res,messages.MSG_INTERNALERR); return }
		respok(res , null, null , {respdata:geturlfromitemid(itemid)})
	})
})

router.post('/store/base64', async(req,res)=>{
	const username = getusernamefromsession ( req ) 
	 if(username){} else {resperr(res,messages.MSG_ARGMISSING);return}
  const {datainbase64,filename  }=req.body// address, 
  LOGGER('tz2e15eKg0' ,filename )
  if(datainbase64 && filename && username){} else {resperr (res,messages.MSG_ARGMISSING);return}
  let hexid // =get_ipfsformatcid_str(datainbase64) ;   LOGGER('UeMP2Xvo5a',hexid)
  let resstore = await storefile_from_base64data(datainbase64 , filename, hexid , 'temp' ) //  type_perm_temp
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

  let filename01 = compose_filename(hexid , filename )
  let url=compose_url( hexid , filename )
  shell.mkdir( '-p' , path.dirname(filename01) )
  fs.rename ( resstore , filename01 ,async err=>{
    if(err){ LOGGER(err)
      resperr(res,messages.MSG_INTERNALERR);return
    }
    respok(res,null,null,{respdata:hexid , payload : {
      url
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
	let {username}=req.body; 
//	username=getusernamefromsession(req)
//	if(username) {} else {res.status(403).send({status:'ERR', message:messages.MSG_PLEASELOGIN}); return}
//	if(username){} else {respreqinvalid(res,messages.MSG_ARGMISSING);return}
	const filename=req.file.filename
	const fulltmpname=`${PATH_STORE_TMP}/${filename}`
	const itemid = await hashfile( fulltmpname )
	const fullpathname=`${PATH_STORE_DEF}/repo/${itemid}`
	const fullpathandfilename=`${PATH_STORE_DEF}/repo/${itemid}/${filename}`
	if (! fs.existsSync( fullpathname ) )	{		shell.mkdir('-p' , fullpathname)	}
	fs.rename( fulltmpname , fullpathandfilename , (err)=>{
		if(err){LOGGER(err); resperr(res,messages.MSG_INTERNALERR); return}
		respok(res,null,null,{respdata:itemid})
		createifnoneexistent( 'itemsdatacache' , {
			username:username
			, url:`${URL_SELF_DEF}/${itemid}/${filename}` 
			, datahash:itemid
			, itemid:itemid
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

module.exports = router;


