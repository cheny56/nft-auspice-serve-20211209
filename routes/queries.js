var express = require("express");
var router = express.Router();
const {
  findone,
  findall,
  createrow,
  updaterow,
  countrows_scalar,
  createorupdaterow,
  fieldexists,
} = require("../utils/db");
const {
  updaterow: updaterow_mon,
  findone: findone_mon,
} = require("../utils/dbmon");
const KEYS = Object.keys;
const {
  LOGGER,
  generaterandomstr,
  generaterandomstr_charset,
  gettimestr,
  convaj,
  ISFINITE,
  separatebycommas,
} = require("../utils/common");
const {
  respok,
  respreqinvalid,
  resperr,
  resperrwithstatus,
} = require("../utils/rest");
const { messages } = require("../configs/messages");
const { getuseragent, getipaddress } = require("../utils/session"); // const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const { validateemail } = require("../utils/validates");
const db = require("../models"); // const dbmon=require('../modelsmongo')
const { getusernamefromsession } = require("../utils/session"); // const { createrow:createrow_mon , updaterow : updaterow_mon }=require('../utils/dbmon')
const {
  queryitemdata,
  queryitemdata_user,
  resolve_salestatus,
} = require("../utils/db-custom");
const { queryuserdata } = require("../utils/db-custom-user");

const {
  CDN_PATH,
  PRICEUNIT_DEF,
  MAP_SALESTATUS_STR,
} = require("../configs/configs");
const { isAsyncFunction } = require("util/types");
const TOKENLEN = 48;
const convliker = (str) => "%" + str + "%";
let { Op } = db.Sequelize;
let nettype = "ETH-TESTNET";
const MAP_ORDER_BY_VALUES = {
  ASC: 1,
  asc: 1,
  DESC: 1,
  desc: 1,
};
const MAP_TABLENAME_QUERY_ALLOWED = {
  settings: 1,
  categories: 1,
  itembalances: 1,
  reportcategory: 1,
  reports: 1,
  announcements: 1,
};
const expand_fieldval_matches = (fieldname, arrfieldvalues) => {
  let arr_field_matches = arrfieldvalues.map((elem) => {
    let jdata = {};
    jdata[fieldname] = { [Op.like]: elem };
    return jdata;
  });
  return { [Op.or]: arr_field_matches };
};
const MAP_TABLE_INVOKE_ITEMQUERY = {
  items: 1,
  itembalances: 1,
};
router.get(
  "/rows/fieldvalues/:tablename/:offset/:limit/:orderkey/:orderval",
  async (req, res) => {
    // :fieldname/:fieldval/
    let { tablename, offset, limit, orderkey, orderval } = req.params;
    let { fieldname, fieldvalues, itemdetail } = req.query;
    const username = getusernamefromsession(req);
    fieldexists(tablename, fieldname).then(async (resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      offset = +offset;
      limit = +limit;
      if (ISFINITE(offset) && offset >= 0 && ISFINITE(limit) && limit >= 1) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "offset-or-limit-invalid" },
        });
        return;
      }
      if (MAP_ORDER_BY_VALUES[orderval]) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "orderby-value-invalid" },
        });
        return;
      }
      let respfield_orderkey = await fieldexists(tablename, orderkey);
      if (respfield_orderkey) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "orderkey-invalid" },
        });
        return;
      }

      let jfilter = {};
      let { fieldname, fieldvalues } = req.query;
      if (fieldname && fieldvalues) {
        if (fieldvalues.length) {
          if (
            fieldvalues.match(/\,/) &&
            fieldvalues.match(/(?<big>[a-zA-Z0-9]+)/)
          ) {
            let arrfieldvalues = separatebycommas(fieldvalues);
            LOGGER("pPPlj4EEMG", arrfieldvalues);
            jfilter = expand_fieldval_matches(fieldname, arrfieldvalues);
          } else {
            jfilter[fieldname] = fieldvalues;
          }
        } else {
        }
      } else {
      } //		jfilter[ fieldname ]	=fieldval
      db[tablename]
        .findAll({
          raw: true,
          where: { ...jfilter },
          offset,
          limit,
          order: [[orderkey, orderval]],
        })
        .then((list_00) => {
          //		if (tablename=='items'){
          if (MAP_TABLE_INVOKE_ITEMQUERY[tablename] || itemdetail) {
            let aproms = [];
            if (username) {
              list_00.forEach((elem) => {
                aproms[aproms.length] = queryitemdata_user(
                  elem.itemid,
                  username
                );
              });
            } else {
              list_00.forEach((elem) => {
                aproms[aproms.length] = queryitemdata(elem.itemid);
              });
            }
            Promise.all(aproms).then((list) => {
              //				list= list.map ( (elem,idx ) => {return {... elem, ... list_00[idx] }} )
              //				list= list.map ( (elem,idx ) => {return {... list_00[idx] , payload : list_00[idx] , ... elem , }} )
              list = list.map((elem, idx) => {
                return { ...list_00[idx], ...elem };
              });
              respok(res, null, null, { list });
            });
          } else {
            respok(res, null, null, { list: list_00 });
          }
        });
    });
  }
);

router.get(
  "/rows/:tablename/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval",
  async (req, res) => {
    let { tablename, fieldname, fieldval, offset, limit, orderkey, orderval } =
      req.params;
    let { itemdetail, userdetail, filterkey, filterval, salestatusstr } =
      req.query;
    const username = getusernamefromsession(req);
    fieldexists(tablename, fieldname).then(async (resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      offset = +offset;
      limit = +limit;
      if (ISFINITE(offset) && offset >= 0 && ISFINITE(limit) && limit >= 1) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "offset-or-limit-invalid" },
        });
        return;
      }
      if (MAP_ORDER_BY_VALUES[orderval]) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "orderby-value-invalid" },
        });
        return;
      }
      let respfield_orderkey = await fieldexists(tablename, orderkey);
      if (respfield_orderkey) {
      } else {
        resperr(res, messages.MSG_ARGINVALID, null, {
          payload: { reason: "orderkey-invalid" },
        });
        return;
      }
      let jfilter = {};
      jfilter[fieldname] = fieldval;
      if (filterkey && filterval) {
        let respfieldexists = await fieldexists(tablename, filterkey);
        if (respfieldexists) {
        } else {
          resperr(res, messages.MSG_DATANOTFOUND);
          return;
        }
        jfilter[filterkey] = filterval;
      } else {
      }
      let jfilters = {};
      if (salestatusstr) {
        if (MAP_SALESTATUS_STR[salestatusstr]) {
        } else {
          resperr(res, messages.MSG_ARGINVALID, null, {
            payload: { reason: "salestatusstr" },
          });
          return;
        }
        jfilters["salestatus"] = MAP_SALESTATUS_STR[salestatusstr]; // data >> 2) & 8) | ((data >> 1) & 4) | (data & 3) FROM ...
      } else {
      }
      db[tablename]
        .findAll({
          raw: true,
          where: { ...jfilter },
          offset,
          limit,
          order: [[orderkey, orderval]],
        })
        .then((list_00) => {
          //		if (tablename=='items'){

          if (MAP_TABLE_INVOKE_ITEMQUERY[tablename] || itemdetail) {
            let aproms = [];
            if (username) {
              list_00.forEach((elem) => {
                aproms[aproms.length] = queryitemdata_user(
                  elem.itemid,
                  username
                );
              });
            } else {
              list_00.forEach((elem) => {
                aproms[aproms.length] = queryitemdata(elem.itemid);
              });
            }
            Promise.all(aproms).then((list) => {
              //				list= list.map ( (elem,idx ) => {return {... elem, ... list_00[idx] }} )
              //				list= list.map ( (elem,idx ) => {return {... elem , payload : elem, ... list_00[idx] }} )
              list = list.map((elem, idx) => {
                return { ...list_00[idx], ...elem };
              });
              respok(res, null, null, { list });
            });
          } else if (userdetail) {
            let aproms = [];
            list_00.forEach((elem) => {
              aproms[aproms.length] = queryuserdata(elem.username);
            });
            Promise.all(aproms).then((list) => {
              list = list.map((elem, idx) => {
                return { ...elem, ...list_00[idx] };
              });
              respok(res, null, null, { list });
            });
          } else {
            respok(res, null, null, { list: list_00 });
          }
        });
    });
  }
);
router.get("/:tablename", (req, res) => {
  let { tablename } = req.params;
	console.log(process.env.PORT);
  if (MAP_TABLENAME_QUERY_ALLOWED[tablename]) {
  } else {
    resperr(res, messages.MSG_NOT_ALLOWED);
    return;
  }
  findall(tablename, {}).then((resp) => {
    respok(res, null, null, { list: resp });
  });
});

router.get('/findcount/:tablename',(req, res)=>{ //????????????, 1???1?????? ?????? ?????????
  let { tablename} = req.params;
  const username = getusernamefromsession(req);
  if (tablename=='announcements'){
  db[tablename].findAndCountAll({
    where:{active:1},
    attributes:['id', 'title', 'createdat']
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
}else if (tablename=='supporttickets'){
  if(!username){resperr(res, 'PLEASE-LOGIN'); return;}
  db[tablename].findAndCountAll({
    where:{username},
    //attributes:['id', 'title', 'createdat']
  }).then((resp)=>{
    
    respok(res, null, null, {list:resp})
  })
}
})

router.get("/field/:tablename", (req, res)=>{ // announcements getter
  let {tablename} = req.params;
  let {attributes, id, key, val} = req.query;

  db[tablename].findAll({
    where:{id}
    , attributes:['createdat', 'title', 'contentbody']
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
})

router.get("/field/:tablename/all", (req, res)=>{ // announcements getter
  let {tablename} = req.params;
  let {attributes, id, key, val} = req.query;

  db[tablename].findAll({
    where:{isPopup: true}
    , attributes:['id', 'createdat', 'title', 'contentbody']
  }).then((resp)=>{
    respok(res, null, null, {list:resp})
  })
})

//SIMPLE_COUNT
router.get("/count/:tablename", (req, res) => {
  let { tablename } = req.params;
  countrows_scalar(tablename, {}).then((resp) => {
    respok(res, null, null, { resp });
  });
});
//COUNT_WITH_OPTION
router.get("/count/:tablename/:fieldname/:fieldval", (req, res) => {
  let { tablename, fieldname, fieldval } = req.params;
  countrows_scalar(tablename, { [fieldname]: fieldval }).then((resp) => {
    respok(res, null, null, { resp });
  });
});



router.get("/:tablename/:fieldname/:fieldval", (req, res) => {
  let { tablename, fieldname, fieldval } = req.params;
  if (tablename == "users") {
    resperr(res, messages.MSG_NOT_PRIVILEGED);
    return;
  }
  fieldexists(tablename, fieldname).then((resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    let jfitler = {};
    jfilter[fieldnamn] = fieldval;
    findone(tablename, { ...jfilter }).then((resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      respok(res, null, null, { payload: { rowdata: resp } });
    });
  });
});

router.get("/list/transactions", async (req, res) => {
  let data = await findall("transactions", { active: 1 });
  //let tmp_data=[]

  let a = await data.map((data) => {
    let from_mongo = findone_mon("users", { username: data.from_ });
    let to_mongo = findone_mon("users", { username: data.to_ });

    return { ...data, from_: { ...from_mongo }, to_: { ...to_mongo } };
  });

  //console.log(a)
  respok(res, null, null, { payload: a });
});
///FILTERED ITEMS
router.get(
  "/filter/rows/:tablename/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval",
  async (req, res) => {
    let { tablename, fieldname, fieldval, offset, limit, orderkey, orderval } =
      req.params;
    let {
      itemdetail,
      userdetail,
      filterkey,
      filterval,
      salestatusstr,
      search,
    } = req.query;
    const username = getusernamefromsession(req);
    fieldexists(tablename, fieldname).then(async (resp) => {
      if (resp) {
      } else {
        resperr(res, messages.MSG_DATANOTFOUND);
        return;
      }
      offset = +offset;
      limit = +limit;
      //   if (ISFINITE(offset) && offset >= 0 && ISFINITE(limit) && limit >= 1) {
      //   } else {
      //     resperr(res, messages.MSG_ARGINVALID, null, {
      //       payload: { reason: "offset-or-limit-invalid" },
      //     });
      //     return;
      //   }
      //if ( MAP_ORDER_BY_VALUES[orderval]){}
      //else {resperr( res , messages.MSG_ARGINVALID , null , {payload: {reason : 'orderby-value-invalid'}})  ; return }
      //let respfield_orderkey = await fieldexists ( tablename , orderkey )
      //if ( respfield_orderkey){}
      //else {resperr( res, messages.MSG_ARGINVALID, null , {payload : {reason : 'orderkey-invalid'}}); return }
      let jfilter = {};
      jfilter[fieldname] = fieldval;
      if (filterkey && filterval) {
        let respfieldexists = await fieldexists(tablename, filterkey);
        if (respfieldexists) {
        } else {
          resperr(res, messages.MSG_DATANOTFOUND);
          return;
        }
        jfilter[filterkey] = filterval;
      }
      if (search) {
      } else {
      }
      let aproms = [];
      jfilters = {};
      if (salestatusstr) {
        if (MAP_SALESTATUS_STR[salestatusstr]) {
        } else {
          resperr(res, messages.MSG_ARGINVALID, null, {
            payload: { reason: "salestatusstr" },
          });
          return;
        }
        jfilters["salestatus"] = MAP_SALESTATUS_STR[salestatusstr]; // data >> 2) & 8) | ((data >> 1) & 4) | (data & 3) FROM ...
      } else {
      }
      let order = [];
      if (orderkey == "id") {
        order = [["id", "DESC"]];
      } else {
        order = [["items.countfavors", "DESC"]];
      }

      //db['items'].belongsTo(db.itembalances)
      db["itembalances"].belongsTo(db["items"]);
      db[tablename]
        .findAll({
          raw: true,
          where: { ...jfilter },
          // , offset
          // , limit
          order: order, // [[ orderkey , orderval ]]
        })
        .then(async (list_00) => {
          let liker = convliker(search);
          let jfilter02 = {
            [Op.or]: [
              { titlename: { [Op.like]: liker } },
              { owner: { [Op.like]: liker } },
              { description: { [Op.like]: liker } },
            ],
          };
          aproms = [];
          list_00.forEach((elem) => {
            var data = resolve_salestatus("items", {
              ...jfilters,
              ...jfilter02,
              itemid: elem.itemid,
            }); //await findall('items', {...jfilters, itemid: elem.itemid, })
            if (data != null) {
              aproms[aproms.length] = data;
            }
          });

          Promise.all(aproms).then((list) => {
            let filtered = list.filter((el) => {
              return el != null;
            });
            filtered = filtered.map((elem, idx) => {
              if (elem) {
                //console.log({...list_00[idx]})
                return { ...list_00[idx], ...elem };
              }
            });
            respok(res, null, null, { list: filtered });
          });
        });
    });
  }
);

///////

/////MAIN CURATION

router.get("/featured/rows/", async (req, res) => {
  fieldexists("maincategory", "visible").then(async (resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    let jfilter = {};
    jfilter["visible"] = 1;

    db["maincategory"]
      .findAll({
        where: { ...jfilter },
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
                  "coverimageurl",
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
                      "coverimageurl",
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
  });
});

/////MAIN CURATION CUSTOM LOADING

router.get("/featured/rows/:target/:key/:val", async (req, res) => {
  let { target, key, val } = req.params;

  if (target == "category") {
    //TARGET IS A CATEGORY
    db["maincategory"]
      .findAll({
        raw: true,
        offset: 0,
        limit: 100,
        order: [["displayorder", "ASC"]],
      })
      .then((resp) => {
        if (resp) {
          respok(res, null, null, { list: resp });
        } else {
          resperr(res, "DATA-NOT-FOUND");
          return;
        }
      });
  } else if (target == "item") {
    //TARGET IS AN ITEMS
    db["mainitemss"]
      .findAll({
        raw: false,
        offset: 0,
        limit: 100,
        where: { [key]: val },
        include: [
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
              "categorystr",
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
                  "coverimageurl",
                ],
              },
            ],
          },
        ],
        order: [["displayorder", "ASC"]],
      })
      .then((resp) => {
        if (resp) {
          respok(res, null, null, { list: resp });
        } else {
          resperr(res, "DATA-NOT-FOUND");
          return;
        }
      });
  } else if (target == "user") {
    //TARGET IS A USER
    db["mainitemss"]
      .findAll({
        raw: false,
        where: { [key]: val },
        offset: 0,
        limit: 100,

        include: [
          {
            model: db["users"],
            as: "user",
            attributes: [
              "username",
              "nickname",
              "description",
              "profileimageurl",
              "coverimageurl",
            ],
          },
        ],
        order: [["displayorder", "ASC"]],
      })
      .then((resp) => {
        if (resp) {
          respok(res, null, null, { list: resp });
        } else {
          resperr(res, "DATA-NOT-FOUND");
          return;
        }
      });
  } else if ((target = "link")) {
    //TARGET IS A LINK
    db["mainitemss"]
      .findAll({
        raw: true,
        where: { [key]: val },
        offset: 0,
        limit: 100,

        order: [["displayorder", "ASC"]],
      })
      .then((resp) => {
        if (resp) {
          respok(res, null, null, { list: resp });
        } else {
          resperr(res, "DATA-NOT-FOUND");
          return;
        }
      });
  } else {
    resperr(res, "TARGET-NOT-FOUND");
    return;
  }
});

router.get("/ilike/:itemid", async (req, res) => {
  let { itemid } = req.params;
  const username = getusernamefromsession(req);
  if (itemid && username) {
  } else {
    return;
  }
  findone("logfavorites", { itemid, username }).then((resp) => {
    //let{status}=resp
    if (resp) {
      let { status } = resp;
      respok(res, null, null, { status: status });
    } else {
      respok(res, null, null, { status: 0 });
    }
  });
});

router.post(
  "/swap/:tablename/:filterkey/:code/:base/:baseorder/:direction",
  async (req, res) => {
    ///UPDATE
    let { tablename, filterkey, code, base, direction, baseorder } = req.params;
    console.log(base, baseorder);
    if (direction == 0) {
      db[tablename]
        .findOne({
          where: { [filterkey]: code, displayOrder: parseInt(baseorder) + 1 },
          attributes: ["id", "category"],
        })
        .then((resp) => {
          if (!resp) {
            return;
          }
          db[tablename]
            .update(
              {
                displayOrder: parseInt(baseorder) + 1,
              },
              {
                where: {
                  [filterkey]: code,
                  id: base,
                },
              }
            )
            .then((rresp) => {
              db[tablename].update(
                {
                  displayOrder: parseInt(baseorder),
                },
                {
                  where: {
                    [filterkey]: code,
                    id: resp.id,
                  },
                }
              ).then((rrresp)=>{
                respok(res, null, null, null)
              })
            });
        });
    } else {
      db[tablename]
        .findOne({
          where: { [filterkey]: code, displayOrder: parseInt(baseorder) - 1 },
          attributes: ["id", "category"],
        })
        .then((resp) => {
          if (!resp) {
            return;
          }
          db[tablename]
            .update(
              {
                displayOrder: parseInt(baseorder) - 1,
              },
              {
                where: {
                  [filterkey]: code,
                  id: base,
                },
              }
            )
            .then((rresp) => {
              db[tablename].update(
                {
                  displayOrder: parseInt(baseorder),
                },
                {
                  where: {
                    [filterkey]: code,
                    id: resp.id,
                  },
                }
              ).then((rrresp)=>{
                respok(res, null, null, null)
              })
            });
        
        });
    }

    
  }
);
//FAQ
router.get('/faq/:target', async(req, res)=>{
let {target, key, val} = req.params;
let {filter} = req.query;
if(target=='categories'){
  console.log(filter)
  db['faqcategories'].findAll({where:{lang: parseInt(filter[0])}}).then((resp)=>{respok(res, null, null, {resp})})
}else if(target=='allitems'){
  console.log(filter)
  db['faq'].findAll({
    where:{lang: parseInt(filter[0])}, 
    include:[{
      model: db['faqcategories'], 
      as:'category_info'
    }]
  }).then((resp)=>{respok(res, null, null, {resp})})
}else if(target='items' && filter.length==2){
  console.log(filter)
  db['faq'].findAll({
    where:{lang: parseInt(filter[0]), category: parseInt(filter[1])}, 
    include:[{
      model: db['faqcategories'], 
      as:'category_info'
    }]
  }).then((resp)=>{respok(res, null, null, {resp})})
}
});

module.exports = router;
const get_search_table_fields = (tablename, liker) => {
  if (tablename) {
  } else {
    return null;
  }
  switch (tablename) {
    case "logsales":
      return {
        [Op.or]: [
          { itemid: { [Op.like]: liker } },
          { txhash: { [Op.like]: liker } },
          { paymeansname: { [Op.like]: liker } },
          { paymeans: { [Op.like]: liker } },
          { buyer: { [Op.like]: liker } },
          { seller: { [Op.like]: liker } },
        ],
      };
      //  , {nettype : {[Op.like] : liker} }}
      break;
    default:
      return {
        [Op.or]: [
          { name: { [Op.like]: liker } },
          { address: { [Op.like]: liker } },
        ],
      };
  }
};
