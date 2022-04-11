var express = require('express');
const moment = require('moment');
const { sequelize, Sequelize } = require('../models');
const db=require('../models')
var router = express.Router();
const cliredisa=require('async-redis').createClient()
const {respok , resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
const Op = Sequelize.Op;
const TODAY_START = new Date().setHours(0, 0, 0, 0);
const NOW = new Date();
/* GET home page. */

router.get('/tickers/:denomincurrency', ( req,res)=>{
	let { denomincurrency } =req.params
	cliredisa.hgetall( `TICKERS-${denomincurrency }` ).then(resp=>{
		respok ( res , null , null , {list : resp } )  
	})
})
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/:type/:from/:to', async (req, res)=>{
	let{type, from, to} =req.params;
	//let{from, to} = req.query;
	switch(type){
		case 'duration':
			Promise.all([
				//fee
				db['logfeepayouts'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: from,
						[Op.lt]: to
					  }, receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum']],
				}),
				db['logfeepayouts'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: from,
						[Op.lt]: to
					  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum']],
				}),
				db['users'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: from,
						[Op.lt]: to
					  },},//Sequelize.DATE(TODAY)},
					  attributes: ['*']
				}),
				db['transactions'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: from,
						[Op.lt]: to
					  }},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum']],
				}),
			]).then((resp)=>{
				console.log('a')
			console.log('a')
			console.log('a')
				respok(res, null, null, {resp});})
			break;
		case 'day':
			Promise.all([
				//fee
				db['logfeepayouts'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: TODAY_START,
						[Op.lt]: NOW
					  }, receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum']],
				}),
				db['logfeepayouts'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: TODAY_START,
						[Op.lt]: NOW
					  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum']],
				}),
				db['users'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: TODAY_START,
						[Op.lt]: NOW
					  },},//Sequelize.DATE(TODAY)},
					  attributes: ['*']
				}),
				db['transactions'].findAndCountAll({
					where:{createdat: { 
						[Op.gt]: TODAY_START,
						[Op.lt]: NOW
					  }},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum']],
				}),
			]).then((resp)=>{respok(res, null, null, {resp}); })
			break;
		case 'total':
			Promise.all([
				//fee
				db['logfeepayouts'].findAndCountAll({
					where:{receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum']],
				}),
				db['logfeepayouts'].findAndCountAll({
					where:{receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum']],
				}),
				db['users'].findAndCountAll({
					where:{},//Sequelize.DATE(TODAY)},
					  attributes: ['*']
				}),
				db['transactions'].findAndCountAll({
					where:{},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum']],
				}),
			]).then((resp)=>{respok(res, null, null, {resp})})
			break;
		case 'month':
			
			var fromDate = moment(from);
			var toDate = moment(to);
			var monthData = [];
			var wholedata = []
			//var query = await sequelize.query("SELECT orders.id, orders.createdat, orders.username, orders.itemid, 6 as type, username as 'from', NULL as 'to', items.titlename as 'itemname', items.priceunit as 'unit', orders.price as 'price', NULL as 'txhash' FROM orders LEFT JOIN items ON orders.itemid = items.itemid WHERE username='"+username+"' UNION ALL SELECT logorders.id, logorders.createdat, logorders.username, logorders.itemid, 4 as type , buyer as 'from', seller as 'to', items.titlename as 'itemname', items.priceunit as 'unit', logorders.price as 'price', logorders.closingtxhash as 'txhash' FROM logorders LEFT JOIN items ON logorders.itemid = items.itemid WHERE buyer='"+username+"' OR seller='"+username+"' UNION ALL SELECT bids.id, bids.createdat, bids.username, bids.itemid, 3 as type , bidder as 'from', seller as 'to', items.titlename as 'itemname', items.priceunit as 'unit', bids.price as 'price', bids.txhash as 'txhash' FROM bids LEFT JOIN items ON bids.itemid = items.itemid WHERE bidder='"+username+"' OR seller='"+username+"' ORDER BY createdat LIMIT 50;", { type: sequelize.QueryTypes.SELECT });
			while (toDate > fromDate || fromDate.format('M') === toDate.format('M')){
				monthData.push(fromDate.format('YYYY-MM'));
				fromDate.add(1,'month'); 
			}
			console.log(monthData)
			//respok(res, null, null, {monthData})

			monthData.forEach((v, i)=>{
			Promise.all([
				db['logfeepayouts'].findAll({
					where:{createdat: { 
						 			[Op.gt]: moment(v).startOf('month'),
						 			[Op.lt]: moment(v).endOf('month')
						 		  }, 
						receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum'], [sequelize.fn('count', sequelize.col('amount')), 'feecount']],
				}),
				db['logfeepayouts'].findAll({
					where:{createdat: { 
						[Op.gt]: moment(v).startOf('month'),
						 			[Op.lt]: moment(v).endOf('month')
					  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum'], [sequelize.fn('count', sequelize.col('amount')), 'royalcount']],
				}),
				db['users'].findAll({
					where:{createdat: { 
						[Op.gt]: moment(v).startOf('month'),
						 			[Op.lt]: moment(v).endOf('month')
					  }},//Sequelize.DATE(TODAY)},
					  attributes: ['*', [sequelize.fn('count', sequelize.col('id')), 'usercount']]
				}),
				db['transactions'].findAll({
					where:{createdat: { 
						[Op.gt]: moment(v).startOf('month'),
						 			[Op.lt]: moment(v).endOf('month')
					  }},//Sequelize.DATE(TODAY)},
					attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum'], [sequelize.fn('count', sequelize.col('id')), 'pricecount']],
				}),
			]).then((resp)=>{wholedata.push({[v]: resp}); console.log(wholedata); if(monthData.length == i+1){respok(res, null, null, {wholedata})}})
			//console.log(wholedata)
			
		})
		
				// Promise.all([
				// 	//fee
				// 	db['logfeepayouts'].findAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: fromDate.startOf('month'),
				// 			[Op.lt]: toDate.endOf('month')
				// 		  }, receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
				// 		attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum'], [sequelize.fn('count', sequelize.col('amount')), 'feecount'], [sequelize.fn('month', sequelize.col('createdat')), 'month'], [sequelize.fn('year', sequelize.col('createdat')), 'year']],
				// 		group: [sequelize.fn('month', sequelize.col('createdat'))]
				// 	}),
				// 	db['logfeepayouts'].findAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: fromDate.startOf('month'),
				// 			[Op.lt]: toDate.endOf('month')
				// 		  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
				// 		attributes:['createdat', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum'], [sequelize.fn('count', sequelize.col('amount')), 'royaltycount'], [sequelize.fn('month', sequelize.col('createdat')), 'month'], [sequelize.fn('year', sequelize.col('createdat')), 'year']],
				// 		group: [sequelize.fn('month', sequelize.col('createdat'))]
				// 	}),
				// 	db['users'].findAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: fromDate.startOf('month'),
				// 			[Op.lt]: toDate.endOf('month')
				// 		  },},//Sequelize.DATE(TODAY)},
				// 		  attributes: ['*', [sequelize.fn('count', sequelize.col('id')), 'usercount'], [sequelize.fn('month', sequelize.col('createdat')), 'month'], [sequelize.fn('year', sequelize.col('createdat')), 'year']],
				// 		  group: [sequelize.fn('month', sequelize.col('createdat'))]
				// 	}),
				// 	db['transactions'].findAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: fromDate.startOf('month'),
				// 			[Op.lt]: toDate.endOf('month')
				// 		  }},//Sequelize.DATE(TODAY)},
				// 		attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum'], [sequelize.fn('count', sequelize.col('price')), 'pricecount'], [sequelize.fn('month', sequelize.col('createdat')), 'month'], [sequelize.fn('year', sequelize.col('createdat')), 'year']],
				// 		group: [sequelize.fn('month', sequelize.col('createdat'))]
				// 	}),
				// ]).then((resp)=>{
				// 	respok(res, null, null, {resp})
				// 	//monthData.push(resp); fromDate.add(1,'month'); 
				// })
				
				
				//monthData.push(fromDate.format('YYYY-MM'));
				
				
				//}
				// respok(res, null, null, {monthData});
				
				// Promise.all([
				// 	//fee
				// 	db['logfeepayouts'].findAndCountAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: TODAY_START,
				// 			[Op.lt]: NOW
				// 		  }, receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
				// 		attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum']],
				// 	}),
				// 	db['logfeepayouts'].findAndCountAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: TODAY_START,
				// 			[Op.lt]: NOW
				// 		  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
				// 		attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum']],
				// 	}),
				// 	db['users'].findAndCountAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: TODAY_START,
				// 			[Op.lt]: NOW
				// 		  },},//Sequelize.DATE(TODAY)},
				// 		  attributes: ['*']
				// 	}),
				// 	db['transactions'].findAndCountAll({
				// 		where:{createdat: { 
				// 			[Op.gt]: TODAY_START,
				// 			[Op.lt]: NOW
				// 		  }},//Sequelize.DATE(TODAY)},
				// 		attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum']],
				// 	}),
				// ]).then((resp)=>{respok(res, null, null, {resp}); })
			// monthData.map(async (v)=>{
				
			// 	Promise.all([
			// 		//fee
			// 		db['logfeepayouts'].findAndCountAll({
			// 			where:{createdat: { 
			// 				[Op.gt]: moment(v).startOf('month').format('YYYY-MM-DD'),
			// 				[Op.lt]: moment(v).endOf('month').format('YYYY-MM-DD')
			// 			  }, receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
			// 			attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'feesum']],
			// 		}),
			// 		db['logfeepayouts'].findAndCountAll({
			// 			where:{createdat: { 
			// 				[Op.gt]: moment(v).startOf('month').format('YYYY-MM-DD'),
			// 				[Op.lt]: moment(v).endOf('month').format('YYYY-MM-DD')
			// 			  }, receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
			// 			attributes:['*', [sequelize.fn('sum', sequelize.col('amount')), 'royaltysum']],
			// 		}),
			// 		db['users'].findAndCountAll({
			// 			where:{createdat: { 
			// 				[Op.gt]: moment(v).startOf('month').format('YYYY-MM-DD'),
			// 				[Op.lt]: moment(v).endOf('month').format('YYYY-MM-DD')
			// 			  },},//Sequelize.DATE(TODAY)},
			// 			  attributes: ['*']
			// 		}),
			// 		db['transactions'].findAndCountAll({
			// 			where:{createdat: { 
			// 				[Op.gt]: moment(v).startOf('month').format('YYYY-MM-DD'),
			// 				[Op.lt]: moment(v).endOf('month').format('YYYY-MM-DD')
			// 			  }},//Sequelize.DATE(TODAY)},
			// 			attributes:['*', [sequelize.fn('sum', sequelize.col('price')), 'pricesum']],
			// 		}),
			// 	]).then((resp)=>{Dataset=[...Dataset, resp] })
			// 	if (Dataset.length == monthData.length){
			// 		respok(res, null, null, Dataset);
			// 	}
				
			
			// })
		
			break
		case 'target':
			if(from=="transactions"){
				db['transactions'].findAndCountAll({
					include:[{
						model: db['items'],
						as: 'item_info'
					}]
					,order: [['createdat', 'DESC']]
				}).then((r)=>{
					respok(res, null, null, r)
				})
			} else if(from=="fee"){
				db['logfeepayouts'].findAndCountAll({
					where:{receiverrolestr: 'ADMIN'},//Sequelize.DATE(TODAY)},
					include:[{
						model: db['items'],
						as: 'fee_item_info'
					},{
						model: db['logorders'],
						as: 'feed_order'
					}]
					,order: [['createdat', 'DESC']]
				
				}).then((r)=>{
					respok(res, null, null, r)
				})
			} else if(from=="royal"){
				db['logfeepayouts'].findAndCountAll({
					where:{receiverrolestr: 'AUTHOR'},//Sequelize.DATE(TODAY)},
					include:[{
						model: db['items'],
						as: 'fee_item_info',
						include:[{
							model: db['users'],
							as: 'author_info'
						}]
					},{
						model: db['logorders'],
						as: 'feed_order'
					}]
					,order: [['createdat', 'DESC']]
					
				}).then((r)=>{
					respok(res, null, null, r)
				})
			}
			break;
		default:
			return;
	}
	// if(type=="duration"){
	// 	console.log('a')
	// 	console.log('a')
	// 	console.log('a')
	// 	console.log('a')
	// 	console.log('a')
	// 	console.log(moment(from).toDate)
	// 	console.log(moment(from).toDate)
	// 	console.log(moment(from).toDate)
	// 	console.log(moment(from).toDate)
	// 	console.log(to)

	// }
	// if(type=='day'){

	// }
	// else if(type=='month'){

	// }
	// else if(type='total'){
		
	// }
	// else if(type="target"){
		
	// }
	// else{
	// 	resperr(res, "wrongarg")
	// }
	

})

module.exports = router;
