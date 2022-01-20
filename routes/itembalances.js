var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria 
	, isuuid , ISFINITE
}=require('../utils/common')
const {findone,findall , createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow
	, fieldexists
 }=require('../utils/db')
const {createifnoneexistent:createifnoneexistent_dbmon , updaterow:updaterow_dbmon }=require('../utils/dbmon')
const {get_ipfsformatcid_file}=require('../utils/ipfscid')
const {getusernamefromsession}=require('../utils/session')
const dbmon=require('../modelsmongo')
const fs=require('fs')
const {messages}=require('../configs/messages')
const {respok,resperr,respreqinvalid  ,resperrwithstatus  }=require('../utils/rest')
const {CDN_PATH , PRICEUNIT_DEF }=require('../configs/configs')
const {generateitemid}=require('../utils/items')
const shell = require('shelljs')
const db=require('../models')
const multer=require('multer')
const {MAP_ITEMTXTYPES}=require('../configs/map-itemtxtypes')
const {gettxandwritetodb}=require('../services/query-eth-chain')
const {storefiletoawss3}=require('../utils/repo-s3')
const {or,like}=db.Sequelize.Op // .Op.or
const URL_SELF_DEF='https://collector.place/repo'
const URL_SELF_DEF_BASE='https://collector.place'
const PATH_STORE_DEF='/var/www/html'
const PATH_STORE_DEF_BASE='/var/www/html'
const PATH_STORE_TMP='/tmp/repo'
const URL_IPFS_REPO='http://ipfs.casa'
const {MAP_ACTIONTYPE_CODE , MAP_CODE_ACTIONTYPE}=require('../configs/map-actiontypes')
const STRINGER=JSON.stringify
const PARSER=JSON.parse
const {hashfile}=require('../utils/largefilehash')
let { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
const MAP_ORDER_BY_VALUES={
  ASC:1
  , asc:1
  , DESC:1
  , desc:1
}
// queryitemdata_filter }=require('../utils/db-custom')

/** router.get('/:username/:offset/:limit', (req,res)=>{
	let { username , offset , limit }=req.params
	offset = +offset
	limit = +limit
	if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
	else {resperr( res, messages.MSG_ARGINVALID ); return }
	db[']('itembalances', {username} ).then(list=>{
	}) 
}) */
router.get('/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval' , async (req,res)=>{
	let { fieldname , fieldval , offset , limit , orderkey , orderval}=req.params
	let username=getusernamefromsession (req)
	let tablename= 'itembalances'
	fieldexists(tablename, fieldname ).then(async resp=>{
		if(resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND); return }
		offset = +offset
		limit = +limit
		if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
		else {resperr( res, messages.MSG_ARGINVALID , null , {payload: {reason : 'offset-or-limit-invalid'}} ); return }
		if ( MAP_ORDER_BY_VALUES[orderval]){}
		else {resperr( res , messages.MSG_ARGINVALID , null , {payload: {reason : 'orderby-value-invalid'}})  ; return }
		let respfield_orderkey = await fieldexists ( tablename , orderkey )
		if ( respfield_orderkey){}
		else {resperr( res, messages.MSG_ARGINVALID, null , {payload : {reason : 'orderkey-invalid'}}); return }
		let jfilter={}
		jfilter[ fieldname ]	=fieldval
		db[tablename].findAll ({raw:true
			, where : {... jfilter} 
			, offset
			, limit
			,	order : [[ orderkey , orderval ]]
		}).then( respraw =>{
			let aproms=[]
			if (username){
				respraw.forEach (elem=>{
					aproms[ aproms.length ] = 			queryitemdata_user ( elem.itemid , username ) 
				})
			} else {
				respraw.forEach (elem=>{
					aproms[ aproms.length ] = 			queryitemdata ( elem.itemid ) 
				})
			}
			Promise.all ( aproms).then(list=>{
				respok ( res ,null, null , {list } )
			})
		})
	})
})

module.exports = router;


