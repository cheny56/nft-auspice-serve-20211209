var express = require('express');
var router = express.Router();
const {getusernamefromsession}=require('../utils/session')
const { findone , findall
	,  incrementroworcreate
}=require('../utils/db')
const { ISFINITE , uuidv4 }=require('../utils/common')
const { messages }=require('../configs/messages')
const { ADDRESSES }=require('../contracts/addresses')
/* GET home page. */
router.post('/taker/ididtake/:txhash' , (req,res)=>{
	const username = getusernamefromsession(req)
  if(username) {} else {resperrwithstatus(res,403,messages.MSG_PLEASELOGIN);return}
	let { txhash }=req.params
	let { itemid , buyorsell  }=req.body
	findone( 'transactions' , {txhash} ).then(resp=>{
		if(resp){resperr( res, messages.MSG_DATADUPLICATE , 12927 );return } 
		else {}
		createrow('transactions' , {
			txhash
		})		
	})
})
/** username | varchar(80)         | YES  |     | NULL                |                               |
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
| nettype    | varchar(20)         
 */
router.post('/maker', (req, res, next) => { // 
	const username=getusernamefromsession(req)
  if(username) {} else {resperrwithstatus(res,403,messages.MSG_PLEASELOGIN);return}
	let { itemid 
		, amount 
		, buyorsell }=req.body
	amount = + amount
  findone('itembalances' , { username 
		, itemid }).then(resp => {
		if(resp){}
		else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 40320 );  return }
		let {avail}=resp
		avail = + avail
		if( ISFINITE( avail ) ){
			if( avail >= amount ){ }
			else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 79175 );return }
			let uuid = uuidv4()
			createrow({
				username
				, asset_contract_offer : ADDRESSES.matcher
				, asset_id_offer       : ''
				, asset_amount_offer   : amount
				, makerortaker : 'maker'
				, uuid
			}).then(resp=>{
				respok(res , null , null , {payload : {
					uuid
				}})
				db['itembalances'].updaterow ('itembalances' , {
					username , itemid
				} , {
					avail : resp.avail - amount
					, locked : resp.locked + amount
				} )
				// table,jfilter,fieldname,incvalue
				// table,jfilter,jupdates
			})
		} else {
			resperr(res, messages.MSG_DATA_NOT_FOUND);return
		}
	})
})

module.exports = router;
/** desc orders;
+----------------------+---------------------+------+-----+---------------------+-------------------------------+
| Field                | Type                | Null | Key | Default             | Extra                         |
+----------------------+---------------------+------+-----+---------------------+-------------------------------+
| matcher_contract     | varchar(80)         | YES  |     | NULL                |                               |
| username             | varchar(80)         | YES  |     | NULL                |                               |
| asset_contract_offer | varchar(80)         | YES  |     | NULL                |                               |
| asset_id_offer       | bigint(20)          | YES  |     | NULL                |                               |
| asset_amount_offer   | varchar(20)         | YES  |     | NULL                |                               |
| asset_contract_ask   | varchar(80)         | YES  |     | NULL                |                               |
| asset_id_ask         | bigint(20)          | YES  |     | NULL                |                               |
| asset_amount_ask     | varchar(20)         | YES  |     | NULL                |                               |
| makerortaker         | tinyint(4)   
*/
