
const nodemailer = require('nodemailer')
// const configemail={	user:'cryptobank00@gmail.com'	, pass: 'zmflqxh1!'} // ''ymBEK2nXd6 
//	const configemail={	user:'collectorplace37@gmail.com'	, pass: 'Fci^4g5YPgsSb#Y' } // ''ymBEK2nXd6 zmflqxh1!' 9t~Z(M]{&p'
// const configemail={	user:'itemverse1@gmail.com'	, pass: 'y7ebZegtdc' } // ''ymBEK2nXd6 zmflqxh1!' 9t~Z(M]{&p'

const configemail={ user:'fancynet161@gmail.com'  , pass: 'JPfiqS43!ht-C_Y' } // ''ymBEK2nXd6 zmflqxh1!' 9t~Z(M]{&p'
//const format = require('./itemverseEmail.html')
const { generaterandomstr_charset
	, generaterandomstr
	, gettimestr, LOGGER}=require('../utils/common')
const STR_SERVICE_NAME='Itemverse'
const cliredisa=require('async-redis').createClient()
const KEYNAME_EMAILCODE='EMAILCODE' // require('../configs/configs')
const {findall , findone, updateorcreaterow , createrow }=require('../utils/db')
const {messages} = require('../configs/messages')
const {TIMESTRFORMAT, USERSURL}=require('../configs/configs')
const moment=require('moment')
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS=30
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI=30*1000
let transporter=nodemailer.createTransport({  service: 'gmail'  , auth: {		user: configemail.user		, pass: configemail.pass }  , tls: { rejectUnauthorized: false } //true
})
const CODELEN=6 // const toemailaddress='??@gmail.com
/*** */
const sendemail_customcontents_withtimecheck=async (toemailaddress
	, typeusernameorpw
	, jdata
)=>{return new Promise(async(resolve,reject)=>{let timenow=moment() // gettimestr()
  let respverifycode= await findone( 'emailverifycode' , { emailaddress:toemailaddress}); let maxdelaysend
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
	let code = generaterandomstr_charset( 10 , 'base58' ) 
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
		case 'emailverifylink' :
			let { cryptoaddress} = jdata 
			mailoptions = { from : configemail.user
				, to : toemailaddress 
				, subject : `이메일 인증` 
//				, text : `이메일인증링크: http://users.itemverse1.net/#/bind_address_email/${cryptoaddress}/${toemailaddress}/${code}` 
//				, text : `이메일인증링크: http://localhost:3000/#/bind_address_email/${cryptoaddress}/${toemailaddress}/${code}` 
				, text : `이메일인증링크: http://itemverse1.net/#/verifyemail?address=${cryptoaddress}&email=${toemailaddress}&verifycode=${code}` 
			}
		break
	}
  transporter.sendMail( mailoptions , (error, info)=>{
    if (error) {	console.log(error);resolve({status:0,reason:messages.MSG_UNKNOWN_ERR });return false  }
		else {console.log(info)
/**			if(typeusernameorpw=='pw'){
				cliredisa.hset( 'TMPPW' , toemailaddress,tmppw )
				updateorcreaterow('tmppw' , {emailaddress:toemailaddress , code:tmppw} , {lastupdate:timenow.format(TIMESTRFORMAT)} )	
      	console.log('OK');resolve({status:1,reason:messages.MSG_OK })
			}
			else { */
				createrow ( 'emailverifycode' , {
					emailaddress : toemailaddress
					, lastupdate : gettimestr()
					, code
				} )
      	console.log('OK');resolve({status:1,reason:messages.MSG_OK , code })
//			}	
      return false 
    }
  })
})
}
/*** -----------Sending Mail ----------------------------*/
const sendemail_withtimecheck=async toemailaddress=>{return new Promise(async(resolve,reject)=>{
  let timenow=moment() // gettimestr()
  //let { cryptoaddress} = jdata 
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
  const mailoptions={    from: configemail.user    
		, to:  toemailaddress 
		, subject: `${STR_SERVICE_NAME} 이메일 인증코드: ${token}`    
		//, text: `인증코드: ${token} /n 이메일인증링크: http://localhost:3000/#/verifyemail?address=${cryptoaddress}&email=${toemailaddress}&verifycode=${code} ` // 내용// '' // toemailaddress
    , html: `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
      <div class="container">
          <div class="header" style="display: table;
          width: 600px;
          height: 48px;
          margin: 0 0 73px;
          background-color: #222;">
              <p class="itemverse" style="display: table-cell;
              font-family: 'Poppins', sans-serif;
              font-size: 16px;
              font-weight: normal;
              font-stretch: normal;
              font-style: normal;
              line-height: 1;
              letter-spacing: -0.19px;
              text-align: left;
              color: #fff;
              vertical-align: middle;
              padding-left:20px;">
                  ITEMVERSE</p>
              <p class="nftmarket" style="padding-right: 20px;
              display: table-cell;
              font-family: 'Poppins', sans-serif;
              font-size: 16px;
              font-weight: normal;
              font-stretch: normal;
              font-style: normal;
              line-height: 1;
              letter-spacing: -0.19px;
              text-align: right;
              color: #fff;
              vertical-align: middle;">NFT MARKET</p>
          </div>
          <div style="display: table;">
              <img src="cid:logoIMG" style="padding-left: 50px;
              display: table-cell;
              width: 196px;
              height: 55px;padding-left: 50px;">
              </div>
              <div style="display: table; margin-top: 70px;">
              <span class="heading" style="padding-left: 50px;
              width: 100%;
              display: table-cell;
              margin-top: 70px;
              font-family: 'Poppins', sans-serif;
              font-size: 30px;
              font-weight: 900;
              font-stretch: normal;
              font-style: normal;
              line-height: 2.33;
              letter-spacing: 0px;
              text-align: left;
              color: #222;padding-left: 50px;">
                  Sign up email verification
              </span>
              </div>
              <div style="display: table; margin-top:10px;">
              <span class="desc" style="padding-left: 50px;
              width: 100%;
              display: table-cell;
              font-family: 'Roboto', sans-serif;
              font-size: 18px;
              font-weight: 500;
              font-stretch: normal;
              font-style: normal;
              line-height: 1.56;
              letter-spacing: -0.22px;
              text-align: left;
              color: #222;padding-left: 50px;">
                  Hello, this is AUSPICE MARKET.<br>
                  Click the button below to check the member's account.<br>
                  This link in only valid for 24 hours.
              </span>
              </div>
              <div style="display: table; margin-top:10px">
              <span class="smoldesc" style="padding-left: 50px;
              display: table-cell;
              width: 100%;
              font-family: 'Roboto', sans-serif;
              font-size: 16px;
              font-weight: normal;
              font-stretch: normal;
              font-style: normal;
              line-height: 3.13;
              letter-spacing: -0.19px;
              text-align: left;
              color: #b2b2b2;padding-left: 50px;">
                  This e-mail will not be replied to for outgoing purposes.
              </span>
              </div>
              <div style="display: table; margin-top: 70px;">
              <a class="complete" href="${USERSURL}/#/verifyemail?email=${toemailaddress}&verifycode=${token}" style="
              display: table-cell;
              width: 100%;
              height: 28px;
              margin-top: 50px;
              font-family: 'Roboto', sans-serif;
              font-size: 24px;
              font-weight: bold;
              font-stretch: normal;
              font-style: normal;
              line-height: 2.63;
              letter-spacing: normal;
              text-align: left;
              color: #08f;padding-left: 50px;">
                  Complete signup
              </a>
              </div>
          <div class="footer" style="display: table;
          width: 600px;
          height: 64px;
          background-color: #222;
          margin-top: 80px;">
              <span class="closing" style="display: table-cell;
              font-family: 'Poppins', sans-serif;
              font-size: 16px;
              font-weight: normal;
              font-stretch: normal;
              font-style: normal;
              line-height: 1;
              letter-spacing: -0.19px;
              text-align: left;
              color: #fff;
              align-self: center;
              vertical-align: middle;padding-left:20px;"">Copyright @ 2021 AUSPICE. All rights reserved.</span>
          </div>
      </div></body></html>`,
      attachments: [{
        filename: 'logo.png',
        path:'services/logo.png',
        cid: 'logoIMG'
      }]
  
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
