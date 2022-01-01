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

router.post('/report/didbuy/:itemid/:txhash' , async (req,res)=>{
	let { itemid , txhash } = req.params
	let { price , units , amount } = req.body
	const username = getusernamefromsession ( req )
 	if ( username) {}
	else { resperr( res , messages.MSG_PLEASELOGIN ); return }

	const buyer = username
	const timestr_now = gettimestr()
	let respitem = await findone ( 'items' , { itemid } )
	if ( resp ) {
		let seller = respitem.currentowner 
		updaterow ( 'items' , {	itemid		} , { lastprice : price 
//			, currentowner : buyer -> not relevant
		} )
		updaterow_mon ( 'items' , {itemid} , {	lastprice : price
//			, currentowner : buyer
		}	).then( resp => {	respok ( res ) }	 )
		incrementroworcreate ( { table : 'itemholders' 
			, jfilter : { itemid , username }
			, fieldname : 'amount'
			, incvalue : units 
		})
		createorupdaterow ( 'itemhistory' , {txhash } , {
			itemid 
			, price
			, buyer : username
			, seller
			, txtype : MAP_ITEMTXTYPES [ 'CHANGE_OWNERSHIP' ]
		}).then ( respcreate =>{
			dbmon.itemhistory.create ( {
				id : respcreate.dataValues.id
				, txhash
				, itemid
				, price
				, buyer 
				, seller
				, txtype : MAP_ITEMTXTYPES [ 'CHANGE_OWNERSHIP' ]
				, createdat : timestr_now
			})				
		})
		createrow ( 'logactions' , {
			username
			, actiontype : MAP_ACTIONTYPE_CODE [ 'TX_BUY' ]
			, actionname : 'TX_BUY'
			, seller
			, buyer
			, price
			, units
		})
	}
})
router.post('/item' , (req,res)=>{ // ie lazy mint	
})
const filehandler=multer({
	storage: multer.diskStorage({//		destination(req, file, cb) { cb(null, '../tmp/') },
		destination:'/var/www/html/tmp' // /tmp' // FILEPATH
		,filename(req,file,cb){ cb(null,getfilename(file) )					} //		, filename(req, file, cb) {					const ext = path.extname(file.originalname);			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);		},
	}),
	limits: { fileSize: 5 * 1024 * 1024 },
}) 

router.get('/bykeyvalue/:fieldname/:value',(req,res)=>{
	const {fieldname,value}=req.params
	let jfilter={ }; jfilter[fieldname]= value
	findall('items',{ ... jfilter}).then(resp=>{
		respok(res,null,null,{list:resp})
	})
})

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
	} )
})

router.post( '/store/file' , filehandler.single('file' ),async(req,res)=>{ // /:type0
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

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;


