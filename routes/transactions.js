var express = require('express');
var router = express.Router();
const {gettxandwritetodb}=require('../services/query-eth-chain')

/* GET home page. */
/** router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}) */

router.post('/:txhash', ( req, res )=> {	
	let {txhash}=req.params
	gettxandwritetodb(txhash).then(resp=>{
		respok(res)
	})
})

module.exports = router;
