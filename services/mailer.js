
const nodemailer = require('nodemailer')
// const configemail={	user:'cryptobank00@gmail.com'	, pass: 'zmflqxh1!'} // ''ymBEK2nXd6 
const configemail={	user:'collectorplace37@gmail.com'	, pass: 'Fci^4g5YPgsSb#Y' } // ''ymBEK2nXd6 zmflqxh1!' 9t~Z(M]{&p'
const {generaterandomstr_charset,generaterandomstr,  gettimestr, LOGGER}=require('../utils/common')
const STR_SERVICE_NAME='Collector.Place'
const cliredisa=require('async-redis').createClient()
const KEYNAME_EMAILCODE='EMAILCODE' // require('../configs/configs')
const {findall , findone, updateorcreaterow }=require('../utils/db')
const {messages} = require('../configs/messages')
const {TIMESTRFORMAT}=require('../configs/configs')
const moment=require('moment')
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS=30
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI=30*1000
let transporter=nodemailer.createTransport({  service: 'gmail'  , auth: {		user: configemail.user		, pass: configemail.pass }  , tls: { rejectUnauthorized: false } //true
})
const CODELEN=6 // const toemailaddress='??@gmail.com'
/*** */
const sendemail_customcontents_withtimecheck=async (toemailaddress,typeusernameorpw)=>{return new Promise(async(resolve,reject)=>{let timenow=moment() // gettimestr()
  let respverifycode= await findone('tmppw',{emailaddress:toemailaddress}); let maxdelaysend
  if(respverifycode){ // let respdelayemailsend=await findone('settings',{keys_:'MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS'}) // MI LI // if(respdelayemailsend){maxdelaysend = +respdelayemailsend.value_} else {maxdelaysend = MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS }
    let respdelayemailsend=await findone('settings',{key_:'MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI'}) ; LOGGER('83TZG0d7i7',respdelayemailsend)// MI LI 
    if( respdelayemailsend){maxdelaysend = +respdelayemailsend.value_}
    else {maxdelaysend = MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI }
    let deltatime=timenow - moment(respverifycode.lastupdate); LOGGER('7gxgVmKwin',deltatime,maxdelaysend )
    if(deltatime < maxdelaysend ){resolve({status:0,reason:messages.MSG_MAX_EMAIL_SEND_DELAY_ERR }); return } 
    else {}
  } else {LOGGER('qL33TPBpBZ')
	}
	let mailoptions={},tmppw
	const respuser=await findone('users',{email:toemailaddress})
	if(respuser){} else {LOGGER('faVzCfDhqM@user-not-found');resolve(null);return}
	const {username}=respuser
	switch(typeusernameorpw){
		case 'username' : 
			mailoptions={    from: configemail.user    
				, to:  toemailaddress 
				, subject: `${STR_SERVICE_NAME} 아이디: ${username}`
				, text: `요청하신 사용자 아이디는 다음과 같습니다: ${username}` // 내용// '' // toemailaddress
  		}
		break
		case 'pw' : tmppw=generaterandomstr(6)
			mailoptions={    from: configemail.user    
				, to:  toemailaddress
				, subject: `${STR_SERVICE_NAME} 비밀번호`
				, text: `임시 비밀번호는 ${tmppw} 입니다` // 내용// '' // toemailaddress
			}
		break
	}
  transporter.sendMail( mailoptions , (error, info)=>{
    if (error) {	console.log(error);resolve({status:0,reason:messages.MSG_UNKNOWN_ERR });return false  }
		else {console.log(info)
			if(typeusernameorpw=='pw'){
				cliredisa.hset( 'TMPPW' , toemailaddress,tmppw )
				updateorcreaterow('tmppw' , {emailaddress:toemailaddress , code:tmppw} , {lastupdate:timenow.format(TIMESTRFORMAT)} )	
			}
      console.log('OK');resolve({status:1,reason:messages.MSG_OK })
      return false 
    }
  })
})
}
/*** */
const sendemail_withtimecheck=async toemailaddress=>{return new Promise(async(resolve,reject)=>{let timenow=moment() // gettimestr()
  let respverifycode= await findone('emailverifycode',{emailaddress:toemailaddress}); let maxdelaysend
  if(respverifycode){ // let respdelayemailsend=await findone('settings',{keys_:'MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS'}) // MI LI // if(respdelayemailsend){maxdelaysend = +respdelayemailsend.value_} else {maxdelaysend = MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS }
    let respdelayemailsend=await findone('settings',{key_:'MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI'}) ; LOGGER('83TZG0d7i7',respdelayemailsend)// MI LI 
    if( respdelayemailsend){maxdelaysend = +respdelayemailsend.value_}
    else {maxdelaysend = MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI }
    let deltatime=timenow - moment(respverifycode.lastupdate); LOGGER('7gxgVmKwin',deltatime,maxdelaysend )
    if(deltatime < maxdelaysend ){resolve({status:0,reason:messages.MSG_MAX_EMAIL_SEND_DELAY_ERR }); return } 
    else {}
  } else {LOGGER('zZk2RR955w')
  }  
  let token=generaterandomstr_charset(CODELEN, 'numbers') // base58
  const mailoptions={    from: configemail.user    , to:  toemailaddress , subject: `${STR_SERVICE_NAME} 이메일 인증코드: ${token}`    , text: `인증코드: ${token}` // 내용// '' // toemailaddress
  }
  transporter.sendMail( mailoptions , (error, info)=>{
    if (error) {	console.log(error);resolve({status:0,reason:messages.MSG_UNKNOWN_ERR });return false  }
    else {console.log(info); cliredisa.hset(KEYNAME_EMAILCODE,toemailaddress,token);      
      updateorcreaterow('emailverifycode' , {emailaddress:toemailaddress } , { code:token , lastupdate:timenow.format(TIMESTRFORMAT)} )
      console.log('OK');resolve({status:1,reason:messages.MSG_OK })
      return false  
    }
  })
})
}
const sendemail = sendemail_withtimecheck
const sendemail_notimecheck=toemailaddress=>{return new Promise((resolve,reject)=>{
  let token=generaterandomstr_charset(CODELEN,'numbers') // base58
  const mailoptions={    from: configemail.user    , to:  toemailaddress // '' // toemailaddress
    , subject: `${STR_SERVICE_NAME} 이메일 인증코드: ${token}`    , text: `인증코드: ${token}` // 내용
  }  
  transporter.sendMail( mailoptions , (error, info)=>{
    if (error) {	console.log(error);resolve(null);return false  }
    else {console.log(info); cliredisa.hset(KEYNAME_EMAILCODE,toemailaddress,token);      console.log('OK');resolve(1);      return false  }
  })
})
}
const PW_TMP_LEN = 10 
const KEYNAME_PWTMP='PWTMP'
const sendemail_recoverpw=(toemailaddress,username )=>{
  return new Promise ((resolve,reject)=>{let timenow=moment()
    let token = generaterandomstr_charset(PW_TMP_LEN ,'base58' )
    const mailoptions={    from: configemail.user    , to:  toemailaddress     , subject: `${STR_SERVICE_NAME} 임시비밀번호: ${token}`    , text: `임시비밀번호: ${token}` // 내용// '' // toemailaddress
    }
    transporter.sendMail( mailoptions , (error, info)=>{
      if (error) {	console.log(error);resolve({status:0,reason:messages.MSG_UNKNOWN_ERR });return false  }
      else {console.log(info); cliredisa.hset(KEYNAME_PWTMP,toemailaddress,token);
        updateorcreaterow('pwtmp' , {emailaddress:toemailaddress} , {pwtmp: token,username:username, lastupdate:timenow.format(TIMESTRFORMAT)} )
        console.log('OK');resolve({status:1,reason:messages.MSG_OK }) 
        return false  
      }
    })
  })
}
module.exports={sendemail , sendemail_recoverpw
, sendemail_customcontents_withtimecheck
 } 
/* 
const mailoptionsset0 = {
  address:              'smtp.gmail.com',
  port:                 587,
  domain:               'gmail.com',
  user_name:            'achievenote5@gmail.com',
  password:             'ymBEK2nXd6',
  authentication:       'plain'
  , subject: `${STR_SERVICE_NAME} 이메일 인증코드: ${token}`
  , text: `인증코드: ${token}`  // 내용
}
*/
