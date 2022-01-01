
var express = require('express');
var router = express.Router();
const {findone,findall,createrow , updaterow
, countrows_scalar
}=require('../utils/db')
const {LOGGER,generaterandomstr , generaterandomstr_charset , gettimestr }=require('../utils/common')
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

router.get('/email/verifycode/:emailaddress',(req,res)=>{
  const {emailaddress}=req.params
  if(validateemail(emailaddress)){} else {resperr(res,messages.MSG_ARGINVALID );return}
  sendemail(emailaddress).then(resp=>{
    if(resp.status){respok(res);return}
    else {resperr(res,resp.reason);return}
  })
})
router.post('/email/verifycode/:emailaddress/:code',(req,res)=>{
  const {emailaddress , code }=req.params
  findone('emailverifycode' , {emailaddress : emailaddress}).then(resp=>{
    if(resp){} else {resperr(res,messages.MSG_DATANOTFOUND);return}
    if(resp['code']==code){} else {resperr(res,messages.MSG_VERIFYFAIL);return}
    respok(res)
  })
})
router.put('/user/myinfo',(req,res)=>{
  const username=getusernamefromsession(req);
	if(username){} else{resperr (res,messages.MSG_PLEASELOGIN);return}	
  LOGGER('8t6dIUoLNx',req.body)
  let jreqbody={... req.body}
  let akeys=KEYS(jreqbody)
  akeys.forEach(elem=>{
    if(jreqbody[elem]){}
    else {delete jreqbody[elem]}
    if (MAP_FIELDS_ALLOWED_TO_CHANGE[ elem] ){}
    else { delete jreqbody[elem] }
  })
  if(KEYS(jreqbody).length>0){}
  else {resperr(res,messages.MSG_ARGINVALID);return}
  updaterow('users', {username} , {... jreqbody})
  updaterow_mon('users' , { username} , {... jreqbody} ).then(resp=>{
    respok(res)
  }).catch(err=>{
    resperr(res,messages.MSG_INTERNALERR)
  })
})

router.post('/login/crypto', async(req,res)=>{
  const {address , cryptotype }=req.body
  LOGGER('m9m9hptxoA',req.body) //  respok(res);return
  if(address && cryptotype){} else {resperr(res,messages.MSG_ARGMISSING);return}
  let isaddressvalid = WAValidator.validate(address , cryptotype.toLowerCase() )
  if(isaddressvalid){} else {   resperr(res , messaegs.MSG_ARGINVALID);return
  }
  const token=generaterandomstr(TOKENLEN)
  let username=address
  let ipaddress = getipaddress(req)
  createrow('sessionkeys', {
    username
    , token
    , useragent:getuseragent(req)
    , ipaddress
  }).then(async resp=>{
    let myinfo = await findone_mon('users' , {username} )
    respok(res ,null,null,{respdata:token
      , payload : {
        myinfo
      }
     })
    let respfind =await findone('users', {username})
    if(respfind){return} else {}
    const myreferercode=generaterandomstr_charset ( 8 , 'notconfusing')
    const {nickname,storename} = createnicks() //255**2 *301sentence
LOGGER('a2NLDNt0o7',nickname,storename)
//    const nickname= generateSlug(3,{format:'camel'}) //255**2 *301sentence
    let randomdesc=getrandomwords(12) ; randomdesc=STRINGER(randomdesc)
    createrow( 'users', {
      username
      , type: 0
      , typestr: 'CRYPTO'
      , myreferercode
      , basecrypto:cryptotype
      , nickname
      , storename
      , description : randomdesc
      , ip: ipaddress
    }).then(respcreate=>{
      createrow_mon('users',{
        id:respcreate.dataValues.id
        , username
        , type: 0
        , typestr: 'CRYPTO'
        , myreferercode
        , basecrypto:cryptotype
        , nickname
        , storename
        , createdat: gettimestr()
        , description : randomdesc
        , ip: ipaddress
      })
    })
  })
})

router.post('/logout',(req,res)=>{  LOGGER('/logout' ,req.headers.token )
  if(req.headers.token){} else {resperrwithstatus(res,403,messages.MSG_PLEASELOGIN , 36632);return}
  db.sessionkeys.findOne({where:{token:req.headers.token}}).then(respfind=>{
    if(respfind && respfind.dataValues){} else {resperrwithstatus(res,403,messages.MSG_PLEASELOGIN);return}
    if(respfind.dataValues.active){} else {resperrwithstatus(res,412,messages.MSG_SESSIONEXPIRED);return }
    respfind.update({active:0}).then(respupdate=>{      respok(res)
/**       let {dataValues}=respfind ;      if(dataValues.isoauth){} else {return}
      db.oauthsessions.findOne({where:{id:dataValues.idtooauthtable}}).then(respoauth=>{
        respupdate.update({active:0})
      }).catch(err=>{LOGGER('PCXENcujpp' ,err) ; resperr(res) })
*/
    }).catch(err=>{LOGGER('sHw1wZpAZ4',err);resperr(res) })
  }).catch(err=>{LOGGER('Cf9NiZEEY7',err);resperr(res) })
})



module.exports = router;
