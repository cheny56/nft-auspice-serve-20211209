
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
const {TIMESTRFORMAT}=require('../configs/configs')
const moment=require('moment')
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_SECONDS=30
let MAX_DELAY_CONSECUTIVE_EMAIL_SEND_IN_MILI=30*1000
let transporter=nodemailer.createTransport({  service: 'gmail'  , auth: {		user: configemail.user		, pass: configemail.pass }  , tls: { rejectUnauthorized: false } //true
})
const CODELEN=6 // const toemailaddress='??@gmail.com'
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
				, text : `이메일인증링크: http://localhost:3000/#/verifyemail?address=${cryptoaddress}&email=${toemailaddress}&verifycode=${code}` 
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
/*** -----------이거임!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
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
      <title>Document</title>
  
      <style>
        .contBox {
          width: 800px;
        }
  
        * {
          padding: 0;
          margin: 0;
        }
  
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          padding: 0 20px;
          font-weight: 600;
          color: #fff;
          background: rgb(59, 60, 62);
        }
  
        .sumnailBox {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 120px;
          margin: 10px 0;
          font-size: 24px;
          font-weight: 700;
          border: 6px solid rgb(82, 174, 234);
        }
  
        .actionBox {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 4px 10px 40px 10px;
          border-top: 1px solid rgb(165, 165, 165);
          border-bottom: 1px solid rgb(165, 165, 165);
        }
  
        .actionBox .textBox {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
  
        .actionBox .endBtn {
          width: 200px;
          height: 50px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: rgb(82, 174, 234);
          border: none;
          border-radius: 10px;
        }
  
        .explainBox {
          display: flex;
          align-items: center;
          height: 160px;
          padding: 0 10px;
          font-size: 16px;
          border-bottom: 2px solid rgb(165, 165, 165);
        }
  
        .copyrightBox {
          padding: 4px 10px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <header>
        <p class="logo">AUSPICE</p>
        <p class="market">NFT MARKET</p>
      </header>
  
      <section class="contBox">
        <article class="sumnailBox">
          <p>가입 이메일 인증</p>
        </article>
  
        <article class="actionBox">
          <div class="textBox">
            <p>안녕하세요. ITEMVERSE MARKET 입니다.</p>
            <p>회원의 계정을 확인하기 위해 아래 버튼을 클릭해 주세요.</p>
            <p>이 링크는 24시간 동안만 유효합니다.</p>
          </div>
  
          <a class="endBtn" style="cursor:pointer" href='http://localhost:3000/#/verifyemail?&email=${toemailaddress}&verifycode=${token}'>가입 완료 하기</a>
        </article>
  
        <article class="explainBox">
          <p>&#183; 본 메일은 발신전용으로 회신되지 않습니다.</p>
        </article>
  
        <article class="copyrightBox">
          <p>Copyright &copy; 2021 ITEMVERSE All rights reserved.</p>
        </article>
      </section>
    </body>`
  
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
