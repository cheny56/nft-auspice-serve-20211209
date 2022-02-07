var express = require('express');
var router = express.Router();
const {getusernamefromsession}=require('../utils/session')
const { findone , findall
	,  incrementroworcreate
	, createrow 
	, updaterow
	, logical_op 
	, update_min_or_max 
}=require('../utils/db')
const { ISFINITE , uuidv4, LOGGER 
	, TIMESTRFORMAT
}=require('../utils/common')
const { MAP_SALESTATUS_STR }=require('../configs/configs')
const { messages }=require('../configs/messages')
const { ADDRESSES }=require('../contracts/addresses')
const { respok , resperr }=require('../utils/rest')
const { NETTYPE } =require('../configs/net')
const moment=require('moment')

router.post('/bid',(req,res)=>{
	
})
router.post('/taker/ididtake/:txhash' , (req,res)=>{
	const username = getusernamefromsession(req)
  if(username) {} else {resperr(res,messages.MSG_PLEASELOGIN,403);return}
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
router.post('/maker/seller',async (req, res, next) => { // 
	LOGGER('' , req.body)
	const username=getusernamefromsession(req)
  if(username) {} 
	else {resperr(res , messages.MSG_PLEASELOGIN  , 403);return}
	let { itemid 
		, amount 
		, buyorsell
		, tokenid
		, price
		, expiry
		, typestr
	 }=req.body
//	respok ( res ); return 
	amount = + amount
	if ( itemid && amount ){}
	else {resperr( res, messages.MSG_ARGMISSING, ); return } 
  findone( 'itembalances' , { username 
		, itemid }).then(async resp => {
		if(resp){}
		else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 40320 );  return }
		let {avail}=resp
		avail = + avail
		if( ISFINITE( avail ) ){
			if( avail >= amount ){ }
			else {resperr(res, messages.MSG_BALANCE_NOT_ENOUGH , 79175 );return }
			let uuid = uuidv4()
			createrow( 'orders' , {
				... req.body
				, username
//				, asset_contract_offer : ADDRESSES.matcher
				, asset_id_bid       : tokenid // ''
				, asset_amount_bid : amount
				, asset_amount_ask : price 
				, makerortaker : 0 //  'maker'
				, uuid
				, supertype : 1
				, supertypestr : 'SELL'
				, expiry
				, expirychar : moment.unix ( expiry).format( TIMESTRFORMAT )
			}).then(async respcreate =>{
				respok(res , null , null , {payload : {
					uuid
				}})
				updaterow ('itembalances' , { // db['itembalances'].
					username , itemid
				} , {
					avail : resp.avail - amount
				, locked : resp.locked + amount
				} )	// table,jfilter,fieldname,incvalue				// table,jfilter,jupdates
				createrow ( 'logactions' , {
					username
					, typestr : ''
					, itemid
					, tokenid : (tokenid? tokenid: null )
					, amount
					, nettype : NETTYPE
					, uuid
					, status : 1 
				} )
				createrow( 'itemhistory' , {
					itemid
					, from_: username
					, price
					, typestr
					, tokenid : (tokenid? tokenid: null )
					, isonchain : 0
					, uuid
					, status : 1
				})
			})
			await logical_op( 'items' , {itemid} , 'salestatus' , MAP_SALESTATUS_STR[ typestr ] , 'or' )
			await update_min_or_max ( 'items' , {itemid} , 'pricemin' , price , 0 ) // oper_min_or_max 
			await update_min_or_max ( 'items' , {itemid} , 'pricemax' , price , 1 )
			{	let jdata={} ; 
				let fieldname = `salestatus${MAP_SALESTATUS_STR[ typestr ]}`
				incrementrow ( { table : 'items', jfilter: {itemid } , fieldname , incvalue: +1})
//				jdata[ ] = 1
//				updaterow ( 'items', {itemid} , {... jdata } )
			}
		} else {
			resperr(res, messages.MSG_DATA_NOT_FOUND);return
		}

	})
})
module.exports = router;
/** desc logactions 
  username       | varchar(80)         
| typestr        | varchar(40)         
| type           | tinyint(4)          
| collectionuuid | varchar(80)         
| itemid         | varchar(100)        
| tokenid        | bigint(20) unsigned 
| bundleuuid     | varchar(80)         
| note           | varchar(500)        
| actiontype     | tinyint(4)          
| actionname     | varchar(20)         
| amount         | varchar(20)         
| price          | varchar(20)         
| priceunit      | varchar(20)         
| from_          | varchar(80)         
| to_            | varchar(80)         
| nettype        | varchar(20)         
| uuid           | varchar(50)         
| txhash         | varchar(80)         
| status         | tinyint(4)          
*/
/** desc orders;
| matcher_contract     | varchar(80)         
| username             | varchar(80)         
| asset_contract_offer | varchar(80)         
| asset_id_offer       | bigint(20)          
| asset_amount_offer   | varchar(20)         
| asset_contract_ask   | varchar(80)         
| asset_id_ask         | bigint(20)          
| asset_amount_ask     | varchar(20)         
| makerortaker         | tinyint(4)   
*/
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
