var express = require('express')
var router = express.Router()
const { generaterandomhex ,LOGGER , gettimestr , gettimestr_raw , filter_json_by_nonnull_criteria 
	, isuuid
}=require('../utils/common')
const {findone,findall 
, createifnoneexistent , createorupdaterow , updaterow , incrementrow , createrow
	, fieldexists
	, togglefield
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
// let { queryitemdata : queryitemdata_aux, queryitemdata_user : queryitemdata_user_aux }=require('../utils/db-custom')
let { queryitemdata : queryitemdata_aux }=require('../utils/db-custom-aux') // , queryitemdata_user : queryitemdata_user_aux

router.get( '/item/aux/:itemid', (req,res)=>{
	let { itemid } =req.params
	let username = getusernamefromsession ( req ) 
	if ( username ) {
	} else {}
	queryitemdata_aux ( itemid ).then( resp =>{
		respok ( res, null, null , {respdata : resp } ) //////
		if ( false && resp && resp.item ) {	incrementrow ( {
				table : 'items'
			, jfilter: { itemid }
			, fieldname : 'countviews'
			, incvalue : +1
		})}
	})
})
router.get( '/item/:itemid' , (req,res)=>{
	let {	itemid } = req.params // uuid_or_itemid
	let { incviewcount}=req.query 
	let username = getusernamefromsession( req ) 
	if (username){	
		queryitemdata_user ( itemid , username ).then(resp=>{
			respok ( res, null , null , {respdata: resp					})
			if ( incviewcount && resp && resp.item ) {	incrementrow ( {
					table : 'items'
				, jfilter: { itemid }
				, fieldname : 'countviews'
				, incvalue : +1
			})}
		})
	} else {
		queryitemdata ( itemid ).then(resp=>{
			respok ( res , null ,null, {respdata : resp } )
			if( incviewcount && resp && resp.item ) {	incrementrow ( {
					table : 'items'
				, jfilter: { itemid }
				, fieldname : 'countviews'
				, incvalue : +1
			} )}
		})		
	}
})
const MAP_ITEMBALANCES_FIELDS_CHANGEABLE={
	hidden : 1
	, visible : 1
}
router.put ( '/item/toggle/:itemid/:fieldname' , async(req,res)=>{ // /:fieldval
	let { itemid , fieldname , fieldval } =req.params
	let username = getusernamefromsession( req )
	if ( username){}
	else {resperr( res, messages.MSG_PLEASELOGIN ) ; return }
	findone ( 'itembalances' , {username, itemid }).then(async resp=>{
		if ( resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND); return }
		let respfieldexists = await fieldexists('itembalances' , fieldname)
		if ( respfieldexists){}
		else {resperr(res, messages.MSG_DATANOTFOUND ); return }
		togglefield ('itembalances', {id: resp.id } , fieldname ).then(resp=>{
			respok ( res, null,null, { payload : { respdata : resp }  } )  
		})
	})
})	

router.put ( '/item/:itemid/:fieldname/:fieldval' , async(req,res)=>{
	let { itemid , fieldname , fieldval } =req.params
	let username = getusernamefromsession( req )
	if ( username){}
	else {resperr( res, messages.MSG_PLEASELOGIN ) ; return }
	findone ( 'itembalances' , {username, itemid }).then(async resp=>{
		if ( resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND); return }
		let respfieldexists = await fieldexists('itembalances' , fieldname)
		if ( respfieldexists){}
		else {resperr(res, messages.MSG_DATANOTFOUND ); return }
		let jupdates={}
		jupdates[ fieldname] = fieldval
		updaterow ( 'itembalances' , {id: resp.id } , {... jupdates} ).then(resp=>{
			respok ( res) 
		})
	})
})	
router.put ( '/item/:itemid', (req,res)=>{ // may be called on token mint and token id assigned, on other contexts? 
	let { itemid}=req.params
	let { tokenid } = req.body
	let username = getusernamefromsession( req )
	if ( username){}
	else {resperr( res, messages.MSG_PLEASELOGIN ) ; return }
	findone( 'items' , {itemid}).then(resp=>{
		if ( resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND ); return  }
		updaterow ( 'items' , { id : resp.id } , { ... req.body } ).then(resp=>{
			respok ( res )
		})
	})
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

/** router.get('/:username/:offset/:limit', (req,res)=>{
	let { username , offset , limit }=req.params
	offset = +offset
	limit = +limit
	if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
	else {resperr( res, messages.MSG_ARGINVALID ); return }
	db[']('itembalances', {username} ).then(list=>{
	}) 
}) */

