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
const {get_ipfsformatcid_file}=require('../utils/ipfscid')
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
const multer=require('multer')
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

router.post("/create/:type", (req, res) => {
  let { type } = req.params;
});
router.post("/swap/:code/:base/:target", async (req, res) => {
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

router.post("/delete/:code", async (req, res) => {
  let { code } = req.params;
  let { selectedItems, id } = req.query;

  if (code == "category") {
    db["maincategory"].destroy({ where: { id } }).then((resp) => {
      respok(res, null, null, { list: resp });
    });
  } else {
    await selectedItems.map(async (v, i) => {
      await db["mainitemss"].destroy({ where: { id: parseInt(v) } }).then((resp)=>{
          respok(res, null, null, null)
      });
    });
  }
});

router.post("/add/:type/:code/:itemid", async (req, res) => {
  let { type, code, itemid } = req.params;
  let { title, url, description,imgurl, id } = req.query;
  let username = null;


    if (type == 0){
      
    }else if((type == 1)){
    }else if((type == 2)){
        username = itemid;
        itemid = null;
    }else if((type == 3)){
        username = null;
        itemid = null;
    }else{
        resperr(res, 'NO-TYPE')
    }

    if(id){
        db["mainitemss"]
        .update(
          {
            title,
            url,
            description,
            imgurl: imgurl
          },
          { where: { id } }
        )
        .then((rresp) => {
          respok(res, null, null, { rresp });
        });
    }else{
        db['mainitemss']
        .count({where:{code, itemid, username, title: title?title:null}})
        .then((count)=>{
            if(count == 0){
                db['mainitemss']
                    .max("displayorder", {where:{code}})
                    .then((max)=>{
                        if(!max){max = 0}
                        db['mainitemss']
                            .create({
                                code,
                                itemid: itemid?itemid:null,
                                username: username?username:null,
                                displayorder: max+1,
                                //title: title?title:null,
                                //url: url?url:null,
                                //description: description?description:null,
                                imgurl: imgurl?imgurl:null
                            })
                            .then((resp)=>{
                                respok(res, null, 'REGISTERED')
                            })
                    })

            }else{  ///EXISTS
                
            }
        })
    }


  // await selectedItems.map(async(v,i)=>{
  //   await db['mainitemss'].destroy({where:{id: parseInt(v)}})
});

//Add Category
router.post("/add/category", async (req, res) => {
  let { name, type, visible, id } = req.query;
  console.log(id);
  if (id) {
    db["maincategory"].findOne({ where: { id } }).then((resp) => {
      if (resp) {
        db["maincategory"]
          .update(
            {
              name,
              visible,
            },
            {
              where: {
                id,
              },
            }
          )
          .then((resp) => {
            respok(res, null, null, resp);
          });
      } else {
        resperr(res, "item-doesnt-exists");
      }
    });
  } else {
    let aa = await db["maincategory"].count();
    db["maincategory"]
      .create({
        name,
        type,
        visible,
        code: aa + 1,
        displayorder: aa,
      })
      .then((rresp) => {
        respok(res, null, null, { rresp });
      });
  }
});

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
  } else if (tablename == "maincategory") {
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

router.post('/upload/file/:target' , filehandler.single('file'),async(req,res)=>{ // /:type0
  //	res.status(200).send( req )
  //	respok ( res, null, null,{reqcontent:req}) 
  //	return 
  	let {target}=req.params; 
    
    //const username=getusernamefromsession(req)
    //if(username){}
    //else {resperr (res,messages.MSG_ARGMISSING);return}
  //	if(username) {} else {res.status(403).send({status:'ERR', message:messages.MSG_PLEASELOGIN}); return}
  //	if(username){} else {respreqinvalid(res,messages.MSG_ARGMISSING);return}
    const filename=req.file.filename
    console.log(filename)
    const fulltmpname=`/var/www/html/tmp/${filename}` // ${PATH_STORE_TMP}/${filename}`
  //	const itemid = await hashfile( fulltmpname )
    const itemid = await get_ipfsformatcid_file ( fulltmpname ) 
  
  //	const fullpathname=`${PATH_STORE_DEF}/repo/${itemid}`
    const fullpathname=`/var/www/html/resource/${target}`
    const fullpathandfilename=`/var/www/html/resource/${target}/${filename}`
    if (! fs.existsSync( fullpathname ) )	{		shell.mkdir('-p' , fullpathname)	}
    fs.rename( fulltmpname , fullpathandfilename , (err)=>{
      if(err){LOGGER(err); resperr(res,messages.MSG_INTERNALERR); return}
      respok(res,null,null,{
        respdata:fullpathandfilename
        , payload : {url:`http://itemverse1.net/resource/${target}/${filename}` 
          , storage_s3:''
          , storage_ipfs : ''
        }
      })
    })
  })

module.exports = router;
