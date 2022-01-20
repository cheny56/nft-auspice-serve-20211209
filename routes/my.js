
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
const WAValidator=require('multicoin-address-validator')
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
module.exports = router;
