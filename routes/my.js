
var express = require('express');
var router = express.Router();
const {findone,findall,createrow , updaterow
, countrows_scalar
}=require('../utils/db')
const {LOGGER,generaterandomstr , generaterandomstr_charset , gettimestr 
	, create_uuid_via_namespace 
}=require('../utils/common')
const {respok,respreqinvalid,resperr , resperrwithstatus } =require('../utils/rest')
const {messages}=require('../configs/messages')
const {getuseragent , getipaddress}=require('../utils/session')
const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const {validateemail , // isaddressvalid 
	}=require('../utils/validates')
const db=require('../models')
let { Op}=db.Sequelize
const dbmon=require('../modelsmongo')
const {getusernamefromsession}=require('../utils/session')
const { createrow : createrow_mon
  , updaterow : updaterow_mon
  , findone : findone_mon
 }=require('../utils/dbmon')
const TOKENLEN=48
/* GET users listing. */
// router.get('/', function(req, res, next) {  res.send('respond with a resource');});
const MAP_FIELDS_ALLOWED_TO_CHANGE={email:1
	, pw:1
	,	profileimage:1
	,	coverimage:1
	, nickname:1
	, description:1
	, storename:1
}
const { MAP_ACTIONTYPE_CODE , MAP_CODE_ACTIONTYPE }=require('../configs/map-actiontypes')
const { getrandomwords , STRINGER }=require('../utils/common')
const WAValidator=require('multicoin-address-validator');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const MIN_LEN_DEF = 5
// INT	4	-2147483648	0	2147483647	42_9496_7295
// BIGINT	8	-263	0	263-1	264-1
// unixtime 16_4201_1832

router.get('/info',(req,res)=>{
	let username=getusernamefromsession(req)
	if ( username){}
	else {resperr(res, messages.MSG_PLEASELOGIN); return }
	let aproms=[]
	aproms[aproms.length] = findone('users', { username } )  
	aproms[aproms.length] = findone_mon('users', { username } ) 
	Promise.all ( aproms).then(resp=>{
		respok ( res, null,null, { payload : {
			maria: resp[0] 
			, mongo:resp[1]
		}})
	}) 
})

router.get('/:type' , async (req,res)=>{ ///:tablename/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval
	let {type} =req.params
	let username=getusernamefromsession(req)
	jfilter={}
	let bids=[]
	if (type=='bids'){
		jfilter['bidder'] = username
	}
	else if (type=='proposals'){
		jfilter['seller'] = username
	}

	db['bids'].findAll({
		where: {
			...jfilter
		}
	})
	.then(results=>{
		let aaproms =[]
		results.map(async(ress)=>{
			let aproms=[]
			if(ress.itemid){}else{return;}
			aaproms[aaproms.length] = new Promise((resolve, reject)=>{
					aproms[aproms.length] = findone('items', {itemid: ress.itemid})
					aproms[aproms.length] = findone('users', {username: ress.seller}, ['pw', 'pwhash', 'emailverified', 'emailverifiedtimeunix', 'icanmint', 'agreereceivepromo'])
					
					Promise.all(aproms)
					.then((aresps)=>{
						//console.log()
						resolve({
							ress,
							item: aresps[0],
							sellerInfo: aresps[1],
						})
					})
				

			})
		})

		Promise.all(aaproms)
		.then((list)=>{
			respok(res, null, null, {payload: [...list]})
		})
		
	})
	
// 	let { tablename , fieldname , fieldval , offset , limit , orderkey , orderval}=req.params
// 	let { itemdetail, userdetail , filterkey , filterval}=req.query
// 	console.log("STATUS ::::::::::::::::::"+salestatusstr)
// 	const username=getusernamefromsession( req ) 
// 	fieldexists(tablename, fieldname ).then(async resp=>{
// 		if(resp){}
// 		else {resperr( res, messages.MSG_DATANOTFOUND); return }
// 		offset = +offset
// 		limit = +limit
// 		if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
// 		else {resperr( res, messages.MSG_ARGINVALID , null , {payload: {reason : 'offset-or-limit-invalid'}} ); return }
// 		if ( MAP_ORDER_BY_VALUES[orderval]){}
// 		else {resperr( res , messages.MSG_ARGINVALID , null , {payload: {reason : 'orderby-value-invalid'}})  ; return }
// 		let respfield_orderkey = await fieldexists ( tablename , orderkey )
// 		if ( respfield_orderkey){}
// 		else {resperr( res, messages.MSG_ARGINVALID, null , {payload : {reason : 'orderkey-invalid'}}); return }
// 		let jfilter={}
// 		jfilter[ fieldname ]	=fieldval
// 		if ( filterkey && filterval ){
// 			let respfieldexists = await fieldexists (tablename , filterkey )
// 			if ( respfieldexists){}
// 			else {resperr( res, messages.MSG_DATANOTFOUND); return }
// 			jfilter[ filterkey ]=filterval
// 		}
// 		else {}
// 		let jfilters ={}
// 		console.log(jfilter)
// 		db[tablename].findAll ({raw:true
// 			, where : {... jfilter} 
// 			, offset
// 			, limit
// 			,	order : [[ orderkey , orderval ]]
// 		}).then( list_00 =>{
// //		if (tablename=='items'){
			
// 			let aproms=[]
// 			if ( username) {
// 				list_00.forEach ( elem=>{
// 					aproms[aproms.length] = queryitemdata_user ( elem.itemid , username )
// 				})
// 			}
// 			Promise.all ( aproms).then(list=>{
// 				list= list.map ( (elem,idx ) => {return { ... list_00[idx] , ... elem ,}} ) 
// 				respok ( res ,null, null , {list } )
// 			})
		
// 		})		
// 	})
})







module.exports = router;
