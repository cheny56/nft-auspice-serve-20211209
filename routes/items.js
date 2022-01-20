var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria 
	, isuuid
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

/** router.get('/:username/:offset/:limit', (req,res)=>{
	let { username , offset , limit }=req.params
	offset = +offset
	limit = +limit
	if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
	else {resperr( res, messages.MSG_ARGINVALID ); return }
	db[']('itembalances', {username} ).then(list=>{
	}) 
}) */
router.get( '/item/:itemid' , (req,res)=>{
	let {	itemid } = req.params // uuid_or_itemid 
	let username = getusernamefromsession( req ) 

	if (username){	
		queryitemdata_user ( itemid , username ).then(resp=>{
			respok ( res, null , null , {respdata: resp					})
		})
	} else {
		queryitemdata ( itemid ).then(resp=>{
			respok ( res , null ,null, {respdata : resp } )
		})		
	}
})

router.get( '/item/genericid/:id' , (req,res)=>{
	let {	id }=req.params // uuid_or_itemid 
	let jfilter={}
	if( isuuid( id ) ) {
		jfilter['uuid'] = id
	}	else { // no validate for itemid due to missing validation method , default case
		jfilter['itemid']= id
	}
	queryitemdata_user ( jfilter ).then(resp=>{
		respok ( res, null , null , {respdata: resp			
		})
	})
})
router.get('/searches', (req,res)=>{
	let {		searchkey
	}=req.query
})

module.exports = router;


