var express = require("express");
var router = express.Router();
const {
  findone,
  findall,
  createrow,
  updaterow,
  countrows_scalar,
  fieldexists,
  createorupdaterow
} = require("../utils/db");
const {
  LOGGER,
  ISFINITE,
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
let {Op} = db.Sequelize;
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
const NAMESPACE = Uint8Array.from([
  0xDE, 0x42, 0xF6, 0xFF,
  0x21, 0x0C,
  0xDA, 0x9C,
  0xA3, 0x0E,
  0x1A, 0x4A, 0xC2, 0x74, 0x36, 0x56,
]);

//FILEUPLOAD
const fs = require('fs');
const multer = require('multer');
const { sequelize } = require("../models");
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

router.post ('/join',async(req,res)=>{
	let {
		username
    , nickname
		, email
    , pw
    , pwhash
    , level
    , phone
    ,id
	}=req.body
	if (username && pw && pwhash){}
	else {resperr(res, messages.MSG_ARGMISSING); return }
	let aproms=[]

  if(id){
      db['adminusers'].update({
        ...req.body
      },{where:{
        id
      }}).then((resp)=>{
        respok(res, null, null)
      })
    }
  else{
      //resperr(res,messages.MSG_DATADUPLICATE , null , {reason: 'username' }); return
		let uuid = uuidv5( username , NAMESPACE )
    console.log(uuid)
    /* Disable creating account on registering.*/
		let resp_create = await createorupdaterow('adminusers', {username}, {... req.body , uuid })//await createrow ('adminusers' , {... req.body , uuid } )
    
		respok ( res , null , null , { payload : { uuid }} )
  }

})

router.get('/list', (req,res)=>{
  db['adminusers'].findAll({
  }).then((resp)=>{
    respok(res, null, null, {list: resp})
  })
})

router.delete('/account/:id', (req, res)=>{
  let {id} = req.params;
  db['adminusers'].destroy({where:{id }}).then((resp)=>respok(res, null, null))
})

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

    findone("adminusers", { username: account, pwhash: hashpassword }).then((resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      const ddata = resp?.level;
      const token = generaterandomstr(TOKENLEN);
      let ipaddress = getipaddress(req);
      createrow("sessionkeys", {
        username: account,
        token,
        useragent: getuseragent(req),
        ipaddress,
      }).then(async (resp) => {
        respok(res, null, null, { account: account, payload: token, data: ddata });
      });
    });
  });
});

router.delete('/logout/:account/:token', (req, res)=>{
  let {account, token} = req.params;
  db['sessionkeys'].destroy({where:{username: account, token }}).then((resp)=>respok(res, null, null))
})

router.get("/login/:account/:token", (req, res) => {
  //CHECK LOGIN
  let {account, token} = req.params;
  //const { account, hashpassword } = req.body;
  let lvl = 0;
  //LOGGER("ADMIN_LOGIN", req.body);
  db['sessionkeys'].findOne({where:{
    username: account,
    token: token
  }}).then((resp)=>{
    respok(res, null, null, {resp})
  })
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

router.post('/faq/category', (req, res)=>{
  let {textdisp, lang, state} = req.body
  db['faqcategories'].create({
    textdisp,
    lang,
    state
  })
})


router.put('/faq/category',(req,res)=>{
  let {id, textdisp, lang, state} = req.body
  db['faqcategories'].update(
    {
    textdisp,
    state
  },
  {
    where:{id}
  })
})

router.get('/faq/category/:lang', (req, res)=>{
  let {lang} = req.params;
  db['faqcategories'].findAll({
    where: (lang=='all')?{}:{lang}
  }).then((resp)=>{
    respok(res, null, null, {resp})
  })
})

router.delete('/faq/category/:id', (req, res)=>{
  let {id} = req.params;
  db['faqcategories'].destroy({where:{id}}).then((resp)=>{respok(res, null, null, {resp})})
})

router.post('/faq/item', (req, res)=>{
  let {title, description, category, status, lang} = req.body;
  db['faq'].create({
    title,
    description,
    category,
    lang,
    status
  })
});

router.put('/faq/item',(req, res)=>{

})
router.get('/faq/item',(req, res)=>{
  db['faq'].findAndCountAll({}).then((resp)=>{
    respok(res, null, null, {list: resp})
  })
})
router.delete('/faq/item',(req, res)=>{

})

router.get('/ticket', (req, res)=>{
  let jfilter={}
  let {filterkey, filterval} = req.body;
  if (filterkey && filterval){
    jfilter[filterkey] = filterval;
  }
  db['supporttickets'].findAndCountAll({
    where:{
      ...jfilter
    },
    include:[{
      model: db['users'],
      as: 'requester_info',
      attributes:[
        'nickname'
      ]
    }]
  }).then((resp)=>{
    respok(res, null, null, {list: resp})
  })
})

router.get('/userinfo/:username/:type/:offset/:limit', async (req, res)=>{
  let {username, type, offset, limit} = req.params;
  if (!username){resperr(res, 'NO-ARG-USERNAME');return;}
  offset = +offset;
      limit = +limit;
      if (ISFINITE(offset) && offset >= 0 && ISFINITE(limit) && limit >= 1) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "offset-or-limit-invalid" },
        });
        return;
      }
      console.log(offset+" : "+limit)
  if(type=="all"){
    //const count_items = 
    db['users'].findAndCountAll({
      raw: false,
      nested: true,

      attributes:['createdat', 'username', 'nickname', 'profileimageurl', 'description', 'email' ,'coverimageurl'],
      include:[{
        model: db['items'],
        as: 'owned_items',
        attributes: ['id']
      }],
      distinct: true,
      offset, 
      limit,
      //nest: true,
      //raw: true,
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
  if(type=="general"){
    //const count_items = 
    db['users'].findOne({
      where:{username},
      attributes:['createdat', 'username', 'nickname', 'profileimageurl', 'description', 'email' ,'coverimageurl',[sequelize.fn('COUNT', sequelize.col('item.id')), "itemscount"]],
      include: [{
        model: db['items']
        ,attributes:[]
      }],
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
  if(type=="buy"){
    db['logorders'].findAndCountAll({
      where:{buyer: username},
      include:[{
        model: db['users'],
        as: 'buyer_logorder_info',
        attributes: ['nickname']
      },{
        model: db['users'],
        as: 'seller_logorder_info',
        attributes: ['nickname']
      },{
        model: db['items'],
        as: 'item_logorder_info',
      },],
      offset,
      limit
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
  if(type=="sale"){
    db['logorders'].findAndCountAll({
      where:{seller: username},
      include:[{
        model: db['users'],
        as: 'buyer_logorder_info',
        attributes: ['nickname']
      },{
        model: db['users'],
        as: 'seller_logorder_info',
        attributes: ['nickname']
      },{
        model: db['items'],
        as: 'item_logorder_info',
      },],
      offset,
      limit
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
  if(type=='items'){
    db['itembalances'].findAndCountAll({
      where:{username},
      include:[{
        model: db['users'],
        as: 'owner_info',
      },{
        model: db['items'],
        as: 'balance_item_info'
      }]
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
  if(type=="activity"){
    var query = await sequelize.query("SELECT orders.id, orders.createdat, orders.username, orders.itemid, 6 as type, username as 'from', NULL as 'to', items.titlename as 'itemname', items.priceunit as 'unit', orders.price as 'price', NULL as 'txhash' FROM orders LEFT JOIN items ON orders.itemid = items.itemid WHERE username='"+username+"' UNION ALL SELECT logorders.id, logorders.createdat, logorders.username, logorders.itemid, 4 as type , buyer as 'from', seller as 'to', items.titlename as 'itemname', items.priceunit as 'unit', logorders.price as 'price', logorders.closingtxhash as 'txhash' FROM logorders LEFT JOIN items ON logorders.itemid = items.itemid WHERE buyer='"+username+"' OR seller='"+username+"' UNION ALL SELECT bids.id, bids.createdat, bids.username, bids.itemid, 3 as type , bidder as 'from', seller as 'to', items.titlename as 'itemname', items.priceunit as 'unit', bids.price as 'price', bids.txhash as 'txhash' FROM bids LEFT JOIN items ON bids.itemid = items.itemid WHERE bidder='"+username+"' OR seller='"+username+"' ORDER BY createdat LIMIT 50;", { type: sequelize.QueryTypes.SELECT });
    respok(res, null, null, {query})
  
  }
  if(type=="fav"){
    db['logfavorites'].findAndCountAll({
      where:{username},
      include:[{
        model: db['users'],
        as: 'liker_info',
      },{
        model: db['items'],
        as: 'liked_item_info',
        include:[{
          model: db['users'],
          as: 'author_info'
        }]
      }]
    }).then((resp)=>{
      respok(res, null, null, {resp})
    })
  }
})

module.exports = router;
