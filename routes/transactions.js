var express = require('express');
var router = express.Router();
const {getusernamefromsession}=require('../utils/session')
const {gettxandwritetodb}=require('../services/query-eth-chain')
const {messages}=require('../configs/messages')
const {createifnoneexistent}=require('../utils/db')
const { create_uuid_via_namespace }=require('../utils/common')
/* GET home page. */
/** router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}) */

router.post('/:txhash', ( req, res )=> {	
	let {txhash}=req.params
	let username=getusernamefromsession ( req)
	if ( username ) {}
	else {resperr( res, messages.MSG_PLEASELOGIN);return  }
	let {			type
		, typestr
		, amount
		, itemid
		, seller
		, buyer
		, from_
		, to_
	} = req.body
	let uuid = create_uuid_via_namespace( txhash )
	createifnoneexistent( 'transactions',{ txhash } ,  {
		... req.body
		, uuid   
	}).then(resp=>{
		respok(res , null , null , {payload: {uuid } })
	}) 
	gettxandwritetodb(txhash).then(resp=>{
	})
})

module.exports = router

/** transactions;
| username   | varchar(80)         | YES  |     | NULL                |                               |
| txhash     | varchar(80)         | YES  |     | NULL                |                               |
| itemid     | varchar(80)         | YES  |     | NULL                |                               |
| type       | tinyint(4)          | YES  |     | NULL                |                               |
| value      | varchar(20)         | YES  |     | NULL                |                               |
| price      | varchar(20)         | YES  |     | NULL                |                               |
| seller     | varchar(80)         | YES  |     | NULL                |                               |
| buyer      | varchar(80)         | YES  |     | NULL                |                               |
| status     | tinyint(4)          | YES  |     | -1                  |                               |
| originator | varchar(80)         | YES  |     | NULL                |                               |
| typestr    | varchar(20)         | YES  |     | NULL                |                               |
| paymeans   | varchar(80)         | YES  |     | NULL                |                               |
| tokenid    | bigint(20) unsigned | YES  |     | NULL                |                               |
| priceunit  | varchar(20)         | YES  |     | NULL                |                               |
| from_      | varchar(80)         | YES  |     | NULL                |                               |
| to_        | varchar(80)         | YES  |     | NULL                |                               |
| uuid       | varchar(100)        | YES  |     | NULL                |                               |
| nettype    | varchar(20)         | YES  | 
*/

