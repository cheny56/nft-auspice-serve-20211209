var express = require('express');
var router = express.Router();
const {gettimestr}=require('../utils/common')
const {respok,resperr , resperrwithstatus}=require('../utils/rest')
const {getusernamefromsession}=require('../utils/session')
const {messages}=require('../configs/messages')
const {createrow , updaterow , incrementroworcreate , incrementrow }=require('../utils/db')
const {findone,findall}=require('../utils/db')
/* GET home page. */
const MAP_FAVOR_OBJECT_TYPES={
	ITEM:0
	, USER:1
}
router.post('/toggle/:objectid',(req,res)=>{
	const username=getusernamefromsession(req)
	if(username){} else {resperr(res,messages.MSG_PLEASELOGIN , );return}
	let {objectid}=req.params ; let itemid = objectid
	findone('logbookmarks',{username , objectid}).then(resp=>{
		if(resp){
			const status01=1^resp.status,incvalue=resp.status?-1:+1 // , status00=resp.status
			updaterow('logbookmarks', {username:username , objectid},{status:status01})
			respok(res,null,null,{respdata:status01 })
			incrementroworcreate({table:'bookmarks',jfilter:{objectid},fieldname:'countfavors',incvalue: incvalue })
			incrementrow({table:'items' , jfilter:{itemid:objectid  } , fieldname:'countbookmarks',incvalue: incvalue	})	
		} else {			
			createrow('logbookmarks',{objectid , itemid , username:username,status:1})
			respok(res,null,null,{respdata:1})
			incrementroworcreate({table:'bookmarks',jfilter:{ objectid},fieldname:'countfavors',incvalue: +1 })
			incrementrow({table:'items' , jfilter:{itemid:objectid  } , fieldname:'countbookmarks',incvalue: +1})	
			;return
		}
	})
})
/** create table bookmarks (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT primary key,
  `createdat` DATETIME NULL DEFAULT current_timestamp(),
	`updatedat` DATETIME NULL DEFAULT NULL ON UPDATE current_timestamp()
	, objectclass tinyint 
	, object varchar(200)
	, countfa vors int default 0
);*/

module.exports = router;
