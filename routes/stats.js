var express = require('express');
var router = express.Router();
const cliredisa=require('async-redis').createClient()
const {respok , resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
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

module.exports = router;
