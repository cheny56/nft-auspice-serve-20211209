const USERSURL='http://itemverse1.net'
const CDN_PATH='/var/www/html'
//	const PRICEUNIT_DEF='ETH'
//  const PRICEUNIT_DEF='KRW'
const PRICEUNIT_DEF='KLAY'

const TIMESTRFORMAT='YYYY-MM-DD HH:mm:ss'
const B_ENFORCE_NO_DUPLICATE_ITEMID=false

const MAP_MARKETTYPE_ID={
  primary : 1
  , secondary : 2
  , entire : 3
}
const NAMESPACE_FOR_HASH='itemverse'
const MAP_SALESTATUS_STR={
	new : 1
,	hasoffers : 2
,	buynow : 4 // spot
,	onauction : 8
,	'COMMON' : 4
,	'AUCTION_ENGLISH' : 8
, BID : 16
}


module.exports={
  CDN_PATH
  , PRICEUNIT_DEF
  , TIMESTRFORMAT
  , MAP_MARKETTYPE_ID
  , B_ENFORCE_NO_DUPLICATE_ITEMID
	, NAMESPACE_FOR_HASH
	, MAP_SALESTATUS_STR
  , USERSURL
}

