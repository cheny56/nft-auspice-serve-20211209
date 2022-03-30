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
// router.get('/', function(req, res, next) {  res.send('respond with a resource');});
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

//FILEUPLOAD
const fs = require('fs');
const multer = require('multer')
const getfilename=file=>{
  const ext=path.extname(file.originalname);
	return `${moment().unix()}-${generaterandomstr(6)}${ext}`
} 
const filehandler=multer({
	storage: multer.diskStorage({//		destination(req, file, cb) { cb(null, '../tmp/') },
		destination:'/var/www/html/tmp' // repo' // /tmp' // FILEPATH
		,filename(req,file,cb){ cb(null,getfilename(file) )					
} //		, filename(req, file, cb) {					const ext = path.extname(file.originalname);			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);		},

	}),
	limits: { fileSize: 45 * 1024 * 1024 },
})

//router.
//FILEUPLOAD

router.post("/login", (req, res) => {
  const { account, hashpassword } = req.body;
  let lvl = 0;
  LOGGER("ADMIN_LOGIN", req.body);
  if (account && hashpassword) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  fieldexists("adminusers", "username").then((resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    //let  jfitler = {}
    //jfilter [ fieldnamn ]  = fieldval

    findone("adminusers", { username: account }).then((resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      const ddata = resp?.level;
      const token = generaterandomstr(TOKENLEN);
      let ipaddress = getipaddress(req);
      createrow("sessionkeys", {
        account,
        token,
        useragent: getuseragent(req),
        ipaddress,
      }).then(async (resp) => {
        respok(res, null, null, { payload: token, data: ddata });
      });
    });
  });
});

router.post("/curation/create/:type", (req, res) => {
  let { type } = req.params;
});
router.post("/featured/swap/:code/:base/:target", async (req, res) => {
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

router.post("/featured/delete/:code", async (req, res) => {
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

router.post("/featured/add/:type/:code/:itemid", async (req, res) => {
  let { type, code, itemid } = req.params;
  let { title, url, description, id } = req.query;

  if (type == 0) {
    db["mainitemss"].count({ where: { code, itemid } }).then((count) => {
      if (count == 0) {
        db["mainitemss"]
          .max("displayorder", { where: { code } })
          .then((resp) => {
            console.log(resp);
            if(!resp){resp=0}
            db["mainitemss"]
              .create({
                code,
                itemid,
                displayorder: resp + 1,
              })
              .then((rresp) => {
                respok(res, null, null, { rresp });
              });
          });
      } else {
        resperr(res, "item-exists");
      }
    });
  }
  if (type == 1) {
    db["mainitemss"].count({ where: { code, itemid } }).then((count) => {
      if (count == 0) {
        db["mainitemss"]
          .max("displayorder", { where: { code } })
          .then((resp) => {
            console.log(resp);
            db["mainitemss"]
              .create({
                code,
                itemid,
                displayorder: resp + 1,
              })
              .then((rresp) => {
                respok(res, null, null, { rresp });
              });
          });
      } else {
        resperr(res, "item-exists");
      }
    });
  }
  if (type == 2) {
    db["mainitemss"]
      .count({ where: { code, username: itemid } })
      .then((count) => {
        if (count === 0) {
          db["mainitemss"]
            .max("displayorder", { where: { code } })
            .then((resp) => {
              console.log(resp);
              db["mainitemss"]
                .create({
                  code,
                  username: itemid,
                  displayorder: resp + 1,
                })
                .then((rresp) => {
                  respok(res, null, null, { rresp });
                });
            });
        } else {
          resperr(res, "user-exists");
        }
      });
  }
  if (type == 3) {
    console.log("ID OF LINK"+id)
    if (id) {
      db["mainitemss"]
        .update(
          {
            title,
            url,
            description,
          },
          { where: { id } }
        )
        .then((rresp) => {
          respok(res, null, null, { rresp });
        });
    } else {
      db["mainitemss"].max("displayorder", { where: { code } }).then((resp) => {
        db["mainitemss"]
          .create({
            code,
            title,
            url,
            description,
            displayorder: resp + 1,
          })
          .then((rresp) => {
            respok(res, null, null, { rresp });
          });
      });
    }
  }
  // await selectedItems.map(async(v,i)=>{
  //   await db['mainitemss'].destroy({where:{id: parseInt(v)}})
});

//Add Category
router.post("/featured/add/category", async (req, res) => {
  let {name, type, visible, id} = req.query;
  console.log(id)
  if (id){
    db['maincategory'].findOne({where:{id}})
    .then((resp)=>{
      if(resp){
      db['maincategory'].update({
        name,
        visible,
      },{where:{
        id
      }}).then((resp)=>{
        respok(res,null, null, resp)
      })
    }else{
      resperr(res, 'item-doesnt-exists')
    }
    })
  }else{
  let aa = await db['maincategory'].count()
      db["maincategory"]
        .create({
          name,
          type,
          visible,
          code: aa+1,
          displayorder: aa,
        })
        .then((rresp) => {
          respok(res, null, null, { rresp });
        });
      }
});

router.get('/findcount/:tablename',(req, res)=>{
  let { tablename} = req.params;
  if (tablename=='announcements'){
  db[tablename].findAndCountAll({
    attributes:['id', 'title', 'createdat', 'updatedat', 'active', 'lang', 'category', 'isPopup']
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
}
})


router.put("/add/:tablename", async (req, res) => {
  let {tablename} = req.params;
  let {category, visible, group_, active, lang, title, contentbody, textdisp, orderkey, orderval} = req.body;
  if (tablename=='categories'){
    db[tablename].count({where:{group_}}).then((resp)=>{
      console.log(resp)
      db[tablename].create({
        category,
        visible,
        displayOrder: parseInt(resp),
        group_,
        textdisp
      }).then((respp)=>{
        respok(res, null, null)
      })
    })
    
  }
  if(tablename=='announcements'){
    db[tablename].create({
      category,
      active,
      lang,
      title,
      contentbody
    })
    .then((resp)=>{
      respok(res, null,null)
    })
  }
});

router.delete("/delete/:tablename/:filterkey/:filterval", (req, res)=>{
  let {tablename, filterkey, filterval} = req.params
  if(tablename=="categories"){
    db[tablename].destroy({where:{[filterkey]:filterval}}).then((resp)=>{
      respok(res, null, null)
    })
  }
})

router.get("/search/:tablename", async (req, res) => {
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
  }else if(tablename == "maincategory"){
    db["maincategory"]
      .findAll({
        offset: 0,
        limit: 100,
        include: [
          {
            model: db["mainitemss"],
            as: "itemsss",
            include: [
              {
                model: db["users"],
                as: "user",
                attributes: [
                  "username",
                  "nickname",
                  "description",
                  "profileimageurl",
                ],
              },
              {
                model: db["items"],
                as: "item",
                attributes: [
                  "itemid",
                  "author",
                  "titlename",
                  "description",
                  "url",
                  "countfavors",
                  "createdat",
                  "typestr",
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
              },
            ],
          },
        ],
        raw: false,
        //, nest:true
        order: [["displayorder", "ASC"]],
      })
      .then((list_00) => {
        respok(res, null, null, { list: list_00 });
      });
  }
});

module.exports = router;
