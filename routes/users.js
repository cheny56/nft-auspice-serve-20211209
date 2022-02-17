
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
let { v5 }=require('uuid')

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

//UUID 해싱 키!!!!!!!!!!!!!!!!!!!!!
const NAMESPACE = Uint8Array.from([
  0xDE, 0x42, 0xF6, 0xFF,
  0x21, 0x0C,
  0xDA, 0x9C,
  0xA3, 0x0E,
  0x1A, 0x4A, 0xC2, 0x74, 0x36, 0x56,
]);

router.get('/user/info/:username',(req,res)=>{
//	let username=getusernamefromsession(req)
	// if ( username){}
//	else {resperr(res, messages.MSG_PLEASELOGIN); return }
	let { username }=req.params
	let aproms=[]
	aproms[aproms.length] = findone('users', { username } )  
	aproms[aproms.length] = findone_mon('users', { username } )
	aproms[aproms.length] = findone('users02', { username } )  
	 
	Promise.all ( aproms).then(resp=>{
		respok ( res, null,null, { payload : {
			maria: resp[0] 
			, mongo:resp[1]
			, stats: resp[2]
		}})
	}) 
})

router.get('/query-value-exists/:fieldname/:value' , (req,res)=>{
	let { fieldname , value } = req.params
	fieldexists('users' , fieldname).then(resp=>{
		if(resp){}
		else {resperr(res,messages.MSG_ARGINVALID); return }
		let jfilter={}
		jfilter[ fieldname ] =value
		findone('users' , jfilter).then(resp=>{
			if(resp){respok(res, null ,null , { payload : {exists : 1}} )}
			else		{respok(res , null,null, { payload : {exists : 0}})}
		})
	})
})

//-----CREATE ACCOUNT
router.post ('/join' , async(req,res)=>{
	let { profileimage
		, username
		, address
    , nickname
		, email
		, agreepromoinfo
	}=req.body
	if (username && email ){}
	else {resperr(res, messages.MSG_ARGMISSING); return }
	let aproms=[]
	aproms[aproms.length ] = findone('users', { address })
	aproms[aproms.length ] = findone('users' ,{ username })
	Promise.all(aproms).then(async resp=>{
		if( resp[ 0 ] ){			resperr(res,messages.MSG_DATADUPLICATE , null , {payload : {dupfield: 'address'} }); return
		} else {}
		if( resp[ 1 ] ){			resperr(res,messages.MSG_DATADUPLICATE , null , {payload : {dupfield: 'username'} }); return
		} else {} 
		let uuid = v5( nickname , NAMESPACE )
    console.log(uuid)
		createrow_mon ('users' , {... req.body , uuid } )
		delete req.body.profileimage
		let resp_create = await createrow ('users' , {... req.body , uuid } )
		respok ( res , null , null , { payload : { uuid }} )
	})
}) 
//----------------------------

//----- SEND AN ACCOUNT VERIFICATION MAIL
router.get('/email/verifycode/:emailaddress',(req,res)=>{
  const {emailaddress}=req.params
  if(validateemail(emailaddress)){} else {resperr(res,messages.MSG_ARGINVALID );return}
  sendemail(emailaddress).then(resp=>{
    if(resp.status){respok(res);return}
    else {resperr(res,resp.reason);return}
  })
})
//-----------------------------

//------ CHECKS THE VERIFICATION LINK
router.post('/email/verifycode/:emailaddress/:code',(req,res)=>{
  const {emailaddress , code }=req.params
  findone('emailverifycode' , {emailaddress : emailaddress}).then(resp=>{
    if(resp){} else {resperr(res,messages.MSG_DATANOTFOUND);return}
    if(resp['code']==code){} else {resperr(res,messages.MSG_VERIFYFAIL);return}
    updaterow('users' , {email:emailaddress } , { emailverified:true} )
    respok(res)
  })
})
//-----------------------------


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
  if(isaddressvalid){} else {   resperr(res , messages.MSG_ARGINVALID);return
  }
  const token=generaterandomstr(TOKENLEN)
  let username=address
  let ipaddress = getipaddress(req)
  createrow( 'sessionkeys', {
    username
    , token
    , useragent:getuseragent(req)
    , ipaddress
  }).then(async resp=>{
    let myinfo_mongo = await findone_mon('users' , {username} )
		let myinfo_maria = await findone ('users' , {username} )
    respok(res ,null,null,{respdata:token
      , payload : {
        myinfo_maria
				, myinfo_mongo
      }
     })
    let respfind =await findone('users', {username})
    if(respfind){return} else {}
    const myreferercode=generaterandomstr_charset ( 10 , 'notconfusing')
    const {nickname  , storename} = createnicks_3letter_ver () //255**2 *301sentence
LOGGER('a2NLDNt0o7',nickname,storename)
//    const nickname= generateSlug(3,{format:'camel'}) //255**2 *301sentence
    let randomdesc = getrandomwords(12) ; randomdesc=STRINGER(randomdesc)
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
