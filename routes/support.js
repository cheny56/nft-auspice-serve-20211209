var express = require("express");
const shell = require('shelljs');
const moment = require('moment');
const fs = require('fs');
var router = express.Router();
const {
  findone,
  findall,
  createrow,
  updaterow,
  countrows_scalar,
  fieldexists,
} = require("../utils/db");
const {
  LOGGER,
  KEYS,
  generaterandomstr,
  generaterandomstr_charset,
  gettimestr,
} = require("../utils/common");
const {
  respok,
  respreqinvalid,
  resperr,
  resperrwithstatus,
} = require("../utils/rest");
const { messages } = require("../configs/messages");
const { getuseragent, getipaddress } = require("../utils/session");
const path=require('path')
const { validateemail } = require("../utils/validates");
const db = require("../models");
const dbmon = require("../modelsmongo");
const { getusernamefromsession } = require("../utils/session");
const {
  createrow: createrow_mon,
  updaterow: updaterow_mon,
  findone: findone_mon,
} = require("../utils/dbmon");
const TOKENLEN = 48;
let { v5: uuidv5 } = require("uuid");

/* GET users listing. */
// router.get('/', function(req, res, next) {  res.send('respond with a resource');});
const {
  MAP_ACTIONTYPE_CODE,
  MAP_CODE_ACTIONTYPE,
} = require("../configs/map-actiontypes");
const { getrandomwords } = require("../utils/common"); // STRINGER
const { generateSlug } = require("random-word-slugs");
const createnicks_3letter_ver = (_) => {
  //      // 3 letter ver
  const str = generateSlug(3, { format: "camel" }); //255**2 *301sentenc
  return { nickname: str, storename: `${str}Store` };
  //  let atkns=str.split(/ /g) //atkns.map((elem,idx)=>idx>0? elem
};
const WAValidator = require("multicoin-address-validator");
const STRINGER = JSON.stringify;

router.post('/sendticket', (req, res)=>{
    let {title, description, lang, username} = req.body;
    db['supporttickets'].create({
        title,
        description,
        username,
        lang,
        status: 1
    }).then((resp)=>{
      respok(res, null, null, {list:resp})
    })
})

router.put('/reply/ticket', (req, res)=>{
  let {id, pic, answer, status} = req.body;

  db['supporttickets'].update({
    pic,
    answer,
    status
  },{
    where:{id}
  }).then((resp)=>{
    respok(res, null, null, {list:resp});
  })

})

router.get('/ticket/:id', (req, res)=>{
  let {id} = req.params;
  
  db['supporttickets'].findOne({
      where:{id},
      include:[{
        model: db['users'],
        as: 'requester_info',
        attributes:[
          'nickname'
        ]
      }]
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
})
router.delete('/ticket/:id', (req, res)=>{
  let {id} = req.params;
  
  db['supporttickets'].destroy({
      where:{id},
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
})
router.put('/ticket/:id', (req, res)=>{
  let {id} = req.params;
  
  let {pic, answer, status} = req.body;

  db['supporttickets'].update({
    pic,
    answer,
    status
  },{
    where:{id}
  }).then((resp)=>{
    respok(res, null, null, {list:resp});
  })
})

router.get('/notice/:id', (req, res)=>{
  let {id} = req.params;
  
  db['announcements'].findOne({
      where:{id},
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
})

router.put('/notice/:id', (req, res)=>{
  let {id} = req.params;
  let{ isPopup,
  category,
  active,
  lang,
  title,
  contentbody,
  locked} = req.body;
  //let {pic, answer, status} = req.body;

  db['announcements'].update({
    isPopup,
    active,
    lang,
    title,
    contentbody,
    locked
  },{
    where:{id}
  }).then((resp)=>{
    respok(res, null, null, {list:resp});
  })
})

router.post('/notice',(req, res)=>{
  let{ isPopup,
    category,
    active,
    lang,
    title,
    contentbody,
    locked} = req.body;
db['announcements'].create({
  isPopup,
  active,
  lang,
  title,
  contentbody,
  locked
}).then((resp)=>{
  respok(res, null, null, {list:resp});
})

})

router.delete('/notice/:id',(req, res)=>{
  let {id} = req.params;
  db['announcements'].destroy({where:{id}}).then((resp)=>{respok(res, null, null, {list:resp})})
})

module.exports = router;
