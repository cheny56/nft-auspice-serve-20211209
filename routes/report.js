var express = require("express");
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
const {
  sendemail,
  sendemail_customcontents_withtimecheck,
} = require("../services/mailer");
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
// router.get('/', function(req, res, next) {  res.send('respond with a resource');}
const MAP_FIELDS_ALLOWED_TO_CHANGE = {
  email: 1,
  pw: 1,
  profileimage: 1,
  coverimage: 1,
  nickname: 1,
  description: 1,
  storename: 1,
};
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

router.post("/featured/swap/:code/:base/:target", async (req, res) => {                         ///UPDATE
  let { code, base, target } = req.params;
  console.log(code + ":" + base + ":" + target);
  const base_id = await db["mainitemss"].findOne({
    raw: true,
    where: { id: base },
    attributes: ["displayorder"],
  });
  const target_id = await db["mainitemss"].findOne({
    raw: true,
    where: { id: target },
    attributes: ["displayorder"],
  });
  const base_do = parseInt(base_id.displayorder);
  const target_do = parseInt(target_id.displayorder);

  console.log(base_id.displayorder + "::::::::::::::" + target_id.displayorder);
  await db["mainitemss"].update(
    { displayorder: target_do },
    {
      where: { id: base, code },
    }
  );
  await db["mainitemss"].update(
    { displayorder: base_do },
    {
      where: { id: target, code },
    }
  );
  respok(res, null, null, null);
});

router.post("/featured/delete/:code", async (req, res) => {                 ////DELETE
  let{code} = req.params;
  let { selectedItems, id } = req.query;

  if(code=="category"){
    db['maincategory'].destroy({where:{id}})
    .then((resp)=>{respok(res, null, null, {list:resp})})
  }else{


  console.log("=====" + JSON.stringify(req.params));
  console.log("=====" + JSON.stringify(req.query));
  await selectedItems.map(async (v, i) => {
    await db["mainitemss"].destroy({ where: { id: parseInt(v) } });
  });
}
});

router.post("/send/:category/:username/:itemid", async (req, res) => {       ////INSERT INTO
  let { category, username, itemid } = req.params;
  let { description } = req.query;
  let seshUsername = getusernamefromsession(req)

  if (seshUsername == username){
    if(description){
      db["items"].findOne({
        where:{itemid},
        attributes:['author']
      }).then((resp)=>{
        db["reports"]
        .create({
          reporter: username,
          reportee: resp.author,
          itemid,
          description,
          status: 0,
        })
        .then((rresp) => {
          respok(res, null, null, { rresp });
        });
      })


    }else{
      resperr(res, "DESCRIPTION IS EMPTY");
    return;
    }
    
  }else{
    resperr(res, "USERNAME DOESNT MATCH");
    return;
  }
  // await selectedItems.map(async(v,i)=>{
  //   await db['mainitemss'].destroy({where:{id: parseInt(v)}})
});

router.get('/rows', async (req, res)=>{
  db['reports'].findAll({
    raw:false,
    nested: true,
    include:[{
      model: db['users'],
      as: 'reporter_info',
      attributes: [
        "username",
        "nickname",
        "description",
        "profileimageurl",
      ],
      nested: true,
    }, {
      model: db['users'],
      as: 'reportee_info',
      attributes: [
        "username",
        "nickname",
        "description",
        "profileimageurl",
      ],
      nested: true,
    },{
      model: db['items'],
      as: 'item_info',
      nested: true,
    }]
  }).then((resp)=>{
    respok(res, null, null, { list: resp });
  })
});


router.get("/search/:tablename", async (req, res) => {              /////////////SELECT
  let { tablename } = req.params;
  let { filterval, searchKey } = req.query;

  if (tablename == "items") {
    db[tablename]
      .findAll({
        where: {},
        attributes: [
          "createdat",
          "itemid",
          "author",
          "titlename",
          "description",
          "url",
          "countfavors",
          "createdat",
          "typestr",
          "priceunit",
        ],
        include: [
          {
            model: db["users"],
            as: "author_info",
            attributes: [
              "username",
              "nickname",
              "description",
              "profileimageurl",
            ],
          },
        ],
        order: [["id", "DESC"]],
      })
      .then((resp) => {
        respok(res, null, null, { list: resp });
      });
  } else if (tablename == "users") {
    db[tablename]
      .findAll({
        where: {},
        attributes: ["createdat", "nickname", "username", "profileimageurl"],
        order: [["id", "DESC"]],
      })
      .then((resp) => {
        respok(res, null, null, { list: resp });
      });
  }
});

router.get('/search/item/:id', (req,res)=>{
  let {id} = req.params;
  db['reports'].findAll({
    where:{id},
    raw:false,
    nested: true,
    include:[{
      model: db['users'],
      as: 'reporter_info',
      attributes: [
        "username",
        "nickname",
        "description",
        "profileimageurl",
      ],
      nested: true,
    }, {
      model: db['users'],
      as: 'reportee_info',
      attributes: [
        "username",
        "nickname",
        "description",
        "profileimageurl",
      ],
      nested: true,
    },{
      model: db['items'],
      as: 'item_info',
      nested: true,
    }]
  }).then((resp)=>{
    respok(res, null, null, { list: resp });
  })
})

module.exports = router;
