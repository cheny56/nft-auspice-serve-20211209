var express = require('express');
var router = express.Router();
const {getusernamefromsession}=require('../utils/session')
const {gettxandwritetodb}=require('../services/query-eth-chain')
const {messages}=require('../configs/messages')
const db=require('../models')
let { Op}=db.Sequelize
const {createifnoneexistent
	, createrow 
	, updaterow 
	, moverow
	, logical_op
	, findone
	, findall
	, incrementrow
}=require('../utils/db')
const { create_uuid_via_namespace , uuidv4 }=require('../utils/common')
const { TIMESTRFORMAT
	, PRICEUNIT_DEF
	, MAP_SALESTATUS_STR
}=require('../configs/configs')
const { NETTYPE }=require('../configs/net')
const {move_avail_to_locked
	, adjust_balances_on_transfer
} = require('../utils/db-balance' )
const { respok , resperr}=require('../utils/rest')
const LOGGER=console.log
/* GET home page. */
/** router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}) */
// /report/auction/english
const MAP_TXTYPES_CODE ={
	OPEN_AUCTION_ENGLISH : 1
	, PUT_BID_TO_AUCTION : 2
}
// , API_REPORT_BID_TO_AUCTION : `${apiServer}/transactions/report/auction/english/bid` // /:txhash
router.post('/report/registerproxy/:txhash' , (req,res)=>{
	let { txhash}= req.params
	let { username , address, feeamount , priceunit , nettype }=req.body
	if ( username && feeamount ){	}
	else { resperr(res, messages.MSG_ARGMISSING , null, {payload: {reason: 'address or feeamount'}} ) ; return }
	let uuid = create_uuid_via_namespace ( txhash )
	let status = 1
	updaterow ( 'users', { username } , { } ).then(resp=>{
		respok ( res, null,null ,{ payload : {uuid}})
		createrow( 'logactions', {
			username
			, typestr: 'REGISTER_PROXY'
			, actionname : 'REGISTER_PROXY'
			, amount : feeamount
			, priceunit
			, from_ : username
			, nettype
			, uuid
			, txhash
			, status
		})
		createrow ( 'transactions' , {
			username
			, value : feeamount
			, price : feeamount
			, amount : feeamount
			, status
			, typestr : 'REGISTER_PROXY'
			, priceunit
			, from_ : username
			, nettype
			, uuid
			, txhash
			, status
		})
	}) 
})

router.post('/report/auction/english/bid/:txhash' , async(req,res)=>{
	let { txhash}=req.params
	let { itemid
		, auctionuuid 
		, seller
		, username // due to kaikas 
		, price
		, priceunit
		, nettype
		, typestr
		, tokenid
		, expiry
	}=req.body ; LOGGER(req.body )
	if ( auctionuuid && username && price ) {}
	else {resperr( res, messages.MSG_ARGMISSING) ; return }
	let respbid = await findone ('bids', {txhash} )
	if ( respbid ) {resperr(res , messages.MSG_DATADUPLICATE,null,{payload : {reason:'txhash-duplicate'}} ); return }
	findone('orders', {uuid : auctionuuid , active : 1 } ).then(async resp=>{
		if (resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND, null, {payload: {reason:'corresponding-order-not-found' } } ) ; return }
		let aprevbids=await findall ( 'bids', { basesaleuuid : auctionuuid		})
		let uuid=create_uuid_via_namespace( txhash) //  uuidv4()
		if ( aprevbids && aprevbids.length) { 
			aprevbids.forEach (async elem=>{
				await moverow( 'bids' , { id:elem.id } , 'logbids', { outbidderuuid : uuid , active : 0}  ) 
			})
		}
		await createrow ( 'bids', {	txhash
			, itemid
			, seller
			, bidder : username
			, price
			, priceunit
			, uuid
			, nettype
			, username
			, expiry
			, status : 1
			, basesaleuuid : auctionuuid
			, active : 1
		})
		createifnoneexistent( 'itemhistory' , {			txhash				} , {
			itemid
			, from_ : username
			, to_ : seller
			, price
			, typestr
			, tokenid : (tokenid? tokenid: null)
			, isonchain : 1
			, nettype
			, uuid
			, status : 1
		 } )
		respok ( res, null,null, { payload : {uuid}})
		await logical_op( 'items' , {itemid} , 'salestatus' , MAP_SALESTATUS_STR[ 'BID' ] , 'or' )
	})
})
/**itemhistory;
| itemid         | varchar(100)     
| iteminstanceid | int(10) unsigned 
| from_          | varchar(80)      
| to_            | varchar(80)      
| price          | varchar(20)      
| priceunit      | varchar(20)      
| typestr        | varchar(20)      
| type           | tinyint(4)       
| datahash       | varchar(100)     
| tokenid        | varchar(20)      
| txtype         | tinyint(4)       
| isonchain      | tinyint(4)       
| nettype        | varchar(20)      
| uuid           | varchar(50)      
| status         | tinyint(4)       
| txhash         | varchar(80)      
*/

/**desc bids ;
| saleid       | int(10) unsigned | YES  |     | NULL                |                               |
| itemid       | varchar(100)     | YES  |     | NULL                |                               |
| seller       | varchar(80)      | YES  |     | NULL                |                               |
| bidder       | varchar(80)      | YES  |     | NULL                |                               |
| price        | varchar(20)      | YES  |     | NULL                |                               |
| priceunit    | varchar(20)      | YES  |     | NULL                |                               |
| txhash       | varchar(80)      | YES  |     | NULL                |                               |
| nettype      | varchar(20)      | YES  |     | NULL                |                               |
| uuid         | varchar(50)      | YES  |     | NULL                |                               |
| status       | tinyint(4)       | YES  |     | NULL                |                               |
| username     | varchar(80)      | YES  |     | NULL                |                               |
| basesaleuuid | varchar(50)      | YES  |     | NULL                |                               |
| active       | tinyint(4)       | YES  |     |
*/
router.post('/report/sale/close/:txhash' , async(req,res)=>{
	let { txhash}=req.params
	let { itemid
		, tokenid
		, amount
		, price
		, username
		, seller
		, buyer
		, matcher_contract
		, token_repo_contract
		, adminfee // {address : '',amount:'',rate:''}
		, refererfee // {address : '',amount:'',rate:''}
		, authorfee // {address : '',amount:'',rate:''}
		, sellorderuuid
		, nettype
	} = req.body ; LOGGER('4w6zniMJOr' , req.body )
	let typestr='CLOSE_SALE'
	let uuid=create_uuid_via_namespace( txhash) //  uuidv4()
	await createifnoneexistent( 'transactions', {txhash } , { username,itemid,typestr , amount, price , nettype, seller, buyer } )
	respok ( res ,null,null, {payload : { uuid } } )
	 await moverow( 'orders'
		, { uuid : sellorderuuid } 
		, 'logorders'
		, { closingtxhash : txhash , buyer,seller } 
	) // (fromtable, jfilter, totable , auxdata)

	createrow ( 'logactions', {
		username
		, typestr
		, itemid
		, tokenid
		, amount
		, nettype : NETTYPE
		, uuid
		, txhash
		, status : 1
	})
	await adjust_balances_on_transfer( seller ,buyer,itemid , amount ) 	// const adjust_balances_on_transfer=async(from,to,itemid,amount)=>{
 	await createifnoneexistent ( 'itemhistory' , { txhash } 	 	, 
		{	itemid
			, from_ : seller 
			, to_ : buyer 
			, price
			, priceunit : PRICEUNIT_DEF
			, typestr
			, tokenid
			, isonchain : 1
			, nettype : NETTYPE
			, uuid
	})
	{	let {address,amount,rate} = adminfee
		await createrow ( 'logfeepayouts' , {
			receiver : address
			, contract : matcher_contract
			, buyer,seller
			, strikeprice : price
			, amount
			, amountunit : PRICEUNIT_DEF
			, itemid
			, nettype : NETTYPE
			,	uuid
			, txhash
			, receiverrolestr : 'ADMIN'
			, subtypestr : 'SALE-SPOT'
		})
	}
	{	let {address,amount,rate} = authorfee
		await createrow ( 'logfeepayouts' , {
			receiver : address
			, contract : matcher_contract
			, buyer,seller
			, strikeprice : price
			, amount
			, amountunit : PRICEUNIT_DEF
			, itemid
			, nettype : NETTYPE
			,	uuid
			, txhash
			, receiverrolestr : 'AUTHOR'
		})	
	}
	{ if (refererfee){}
		else {return }
		let {address,amount,rate}=refererfee
		createrow ( 'logfeepayouts' , {
			receiver : address
			, contract : matcher_contract
			, buyer,seller
			, strikeprice : price
			, amount
			, amountunit : PRICEUNIT_DEF
			, itemid
			, nettype : NETTYPE
			,	uuid
			, txhash
			, receiverrolestr : 'REFERER'
		})	
	}
//	await updaterow ( 'orders' , { uuid : sellorderuuid } , {active:0 } )
	findone('users02' , {username : seller} ).then(resp=>{
		if ( resp){
			let jmaxprice
			updaterow ( 'users02' , {id:resp.id} , {
				countsales : 1 + resp.countsales
				, sumsales : + price + +resp.sumsales  
				, sumsalesfloat : +price + resp.sumsalesfloat
				, maxstrikeprice : +price> +resp.maxstrikeprice ? price : resp.maxstrikeprice
				, maxstrikepricefloat : +price> +resp.maxstrikeprice ? price : resp.maxstrikepricefloat 
			})
		}		else { createrow ( 'users02' , { 
			countsales : 1
			, sumsales : price
			, sumsalesfloat : price
			, maxstrikeprice : price
			, maxstrikepricefloat : price
//			, nickname : 
		})
		}
	})
	findone('users02', {username : buyer } ).then(resp=>{
		if ( resp){
			updaterow ( 'users02', {
				countbuys : 1 + resp.countbuys
				, maxstrikeprice : +price> +resp.maxstrikeprice ? price : resp.maxstrikeprice				
				, maxstrikepricefloat : +price> +resp.maxstrikeprice ? price : resp.maxstrikepricefloat
				, sumbuys : price
				, sumbuysfloat : price
			})
		} else 	{
			createrow ('users02', {
				countbuys : 1
				, maxstrikeprice : price
				, maxstrikepricefloat : price
				, sumbuys : price
				, sumbuysfloat : price
			})
		}
	})
	incrementrow({table : 'items' 
		,jfilter: {itemid} 
		,fieldname:`salestatus${MAP_SALESTATUS_STR['COMMON'] }`
		,incvalue : -1 } )
})
router.post('/report/auction/english/open/:txhash' ,async (req,res)=>{
	let { txhash}=req.params
	let {		itemid
		, tokenid
		, amount
		, startingtime
		, startingprice
		, expiry
		, username
		, matcher_contract
		, token_repo_contract
	}=req.body
	let typestr='OPEN-AUCTION-ENGLISH'
	let uuid=create_uuid_via_namespace( txhash) //  uuidv4()
	await createifnoneexistent( 'transactions', {txhash } , { username,itemid,typestr , amount, price : startingprice } )
	await createrow ( 'orders' , {
		matcher_contract
		, username
		, asset_id_bid : tokenid
		, asset_amount_bid : amount
//		, asset_id_ask :  
		, asset_amount_ask : startingprice
		, markerortaker : 0
		, uuid // 
		, itemid
		, type : MAP_TXTYPES_CODE [ typestr ]
		, typestr
		, supertype: 1 // sell
		, supertypestr: 'SELL'
		, price :startingprice
		, expiry
		, expirychar : moment.unix(expiry).format(TIMESTRFORMAT)
		, tokenid	
	})
	let respadjust = await move_avail_to_locked ( username , itemid , amount)	
	respok ( res ,null,null, {payload : { uuid } } )
	createrow ( 'logactions', {
		username
		, typestr
		, itemid
		, tokenid
		, amount
		, nettype : NETTYPE
		, uuid
		, txhash
		, status : 1
	})
	createifnoneexistent ( 'itemhistory' , { txhash } 
	 	, {		itemid
			, from_ : username
			, to_ : username
			, price : startingprice
			, priceunit : PRICEUNIT_DEF
			, typestr
			, tokenid
			, isonchain : 1
			, nettype : NETTYPE
			, uuid
			, txhash
	})	
})
/**logfeepayouts;
| receiver        | varchar(80) 
| contract        | varchar(80) 
| paymeans        | varchar(80) 
| paymeansname    | varchar(20) 
| amount          | varchar(20) 
| txhash          | varchar(80) 
| receiverrolestr | varchar(20) 
| receiverrole    | tinyint(4)  
*/
/** orders
		matcher_contract | varchar(80) 
| username           | varchar(80) 
| asset_contract_bid | varchar(80) 
| asset_id_bid       | bigint(20) u
| asset_amount_bid   | varchar(20) 
| asset_contract_ask | varchar(80) 
| asset_id_ask       | bigint(20)  
| asset_amount_ask   | varchar(20) 
| makerortaker       | tinyint(4)  
| uuid               | varchar(80) 
| sig_r              | varchar(80) 
| sig_s              | varchar(80) 
| sig_v              | varchar(10) 
| signature          | varchar(100)
| datahash           | varchar(100)
| itemid             | varchar(100)
| type               | tinyint(4)  
| typestr            | varchar(40) 
| rawdata_to_sign    | varchar(3000
| supertype          | tinyint(4)  
| supertypestr       | varchar(20) 
| rawdatahash        | varchar(80) 
| signaturestr       | varchar(200)
| isprivate          | tinyint(4)  
| privateaddress     | varchar(80) 
| price              | varchar(20) 
| expiry             | bigint(20) u
| expirychar         | varchar(30) 
| tokenid            | bigint(20) u
*/
/** transactions;
| username   | varchar(80) 
| txhash     | varchar(80) 
| itemid     | varchar(80) 
| type       | tinyint(4)  
| value      | varchar(20) 
| price      | varchar(20) 
| seller     | varchar(80) 
| buyer      | varchar(80) 
| status     | tinyint(4)  
| originator | varchar(80) 
| typestr    | varchar(20) 
| paymeans   | varchar(80) 
| tokenid    | bigint(20) u
| priceunit  | varchar(20) 
| from_      | varchar(80) 
| to_        | varchar(80) 
| uuid       | varchar(100)
| nettype    | varchar(20) 
*/

router.post('/:txhash/:address', async ( req, res )=> {	
	let {txhash , address }=req.params
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
	await createifnoneexistent( 'transactions',{ txhash } , {
		... req.body
		, uuid   
	}) // .then(resp=>{
	
	respok(res , null , null , {payload: {uuid } })
// 	}) 
//	gettxandwritetodb(txhash).then(resp=>{
	//})
})

router.get('/history/', async ( req, res )=> {
	let {username} = req.query;
	console.log(req.query)
	// if (!username){
	// 	username=getusernamefromsession (req)
	// }
	//if ( username ) {}
	//else {resperr( res, messages.MSG_PLEASELOGIN);return  }
	
	db['transactions'].findAll({
		where: {[Op.or]:[
			{seller: username},
			{username: username}
			]}
		,include:[{
			model: db['users'],
			as: 'seller_info'
		},
		{model: db['users'],
		as: 'buyer_info'
	},
	{
		model: db['items'],
		as: 'item_info'
	}
	
	]

		, order:[['id', 'DESC']]
	})
	.then(resp=>{
		console.log(JSON.stringify(resp))
		respok(res, null, null, {list: resp})
		// //console.log(resp)
		// let transactionsList = {}
		// let aaproms =[]
		// resp.map(async (transaction)=>{
		// 	let aproms=[]
		// 	if(transaction.itemid){}else{return;}
		// 	aaproms[aaproms.length] = new Promise((resolve, reject)=>{
		// 		findone('items', {itemid: transaction.itemid})
		// 		.then((resp)=>{
		// 			aproms[aproms.length] = resp
		// 			aproms[aproms.length] = findone('users', {username:transaction.buyer}, ['pw', 'pwhash', 'emailverified', 'emailverifiedtimeunix', 'icanmint', 'agreereceivepromo'])
		// 			aproms[aproms.length] = findone('users', {username:transaction.seller}, ['pw', 'pwhash', 'emailverified', 'emailverifiedtimeunix', 'icanmint', 'agreereceivepromo'])
					
		// 			Promise.all(aproms)
		// 			.then((aresps)=>{
		// 				resolve({
		// 					transaction,
		// 					item: aresps[0],
		// 					buyerInfo: aresps[1],
		// 					sellerInfo: aresps[2]
		// 				})
		// 			})
		// 		})

		// 	})
		// })

		// Promise.all(aaproms)
		// .then((list)=>{
		// 	console.log(...list)
		// 	respok(res, null, null, {payload: [...list]})
		// })
		

		
	}) // dealing transactions
}) // router

router.get('/history/all', async ( req, res )=> {
	Promise.all([
		db['orders'].findAll({}),
		db['logorders'].findAll({}),
		db['bids'].findAll({}),
		db['logbids'].findAll({})
	])
})


module.exports = router


