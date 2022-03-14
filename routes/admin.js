
var express = require('express');
var router = express.Router();
const {findone,findall,createrow , updaterow
	, countrows_scalar
	, fieldexists
}=require('../utils/db')
const {LOGGER,
KEYS ,
generaterandomstr , generaterandomstr_charset , gettimestr }=require('../utils/common')
const {respok,respreqinvalid,resperr , resperrwithstatus } =require('../utils/rest')
const {messages}=require('../configs/messages')
const {getuseragent , getipaddress}=require('../utils/session')
const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const {validateemail}=require('../utils/validates')
const db=require('../models')
const dbmon=require('../modelsmongo')
const {getusernamefromsession}=require('../utils/session')
const { createrow : createrow_mon
  , updaterow : updaterow_mon
  , findone : findone_mon
 }=require('../utils/dbmon')
const TOKENLEN=48
let { v5 : uuidv5 }=require('uuid')

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
const { getrandomwords , }=require('../utils/common' ) // STRINGER 
const { generateSlug } =require( 'random-word-slugs' )
const createnicks_3letter_ver =_=>{ //      // 3 letter ver
  const str = generateSlug(3,{format:'camel'}) //255**2 *301sentenc
  return {nickname: str , storename: `${str}Store`}
  //  let atkns=str.split(/ /g) //atkns.map((elem,idx)=>idx>0? elem
}
const WAValidator=require('multicoin-address-validator')
const STRINGER=JSON.stringify 

router.post('/login' , (req,res)=>{
  const { account, hashpassword } = req.body
  let lvl =0;
  LOGGER('ADMIN_LOGIN', req.body)
  if(account && hashpassword){}else{resperr(res,messages.MSG_ARGMISSING); return}
  fieldexists ( 'adminusers' , 'username').then(resp=>{
    if (resp){}
    else { resperr( res, messages.MSG_DATANOTFOUND); return }
    //let  jfitler = {}
    //jfilter [ fieldnamn ]  = fieldval
    
    findone ( 'adminusers' , {username: account} ).then(resp=>{
      if ( resp ) {}
      else {resperr( res, messages.MSG_DATANOTFOUND ) ; return }
      console.log(resp)
    const ddata = resp?.level
      const token=generaterandomstr(TOKENLEN)
      let ipaddress= getipaddress(req)
      createrow('sessionkeys', {
        account
        , token
        , useragent: getuseragent(req)
        , ipaddress
      })
      .then(async resp=>{
        respok(res, null, null, {payload: token, data: ddata})
      })
    })
  })
})

module.exports = router;
