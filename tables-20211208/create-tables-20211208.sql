drop if exists table balances ;
drop if exists table items ;
drop if exists table multicopies ;
drop if exists table iteminstances ;
drop if exists table filestorages ;
drop if exists table sales ;
drop if exists table bids ;
drop if exists table logbids ;
drop if exists table paymeans ;
drop if exists table itemhistory ;
drop if exists table logactions ;
drop if exists table logfavorites ;
drop if exists table comments ;
drop if exists table adminusers ;
drop if exists table adminfees ;
drop if exists table bundles ;
drop if exists table bundlehasitems ;

create table balances (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80)
	, itemid varchar(100)
	, amount int unsigned default 0
) ;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80)
	, nickname varchar(80)
	, email varchar(100)
	, pw varchar(20)
	, pwhash varchar(100) comment 'hash'
	, level int unsigned default 0 comment '사용자권한레벨'
);
create table items (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, itemid varchar(100)
	, is1copyonly tinyint default 1
	, countcopies int unsigned 
	, countsplitshares bigint unsigned
	, owner varchar(80)
	, author varchar(80)
	, authorfee int unsigned comment 'authorfee unit is in basis point==10**4'
	, countfavors bigint unsigned default 0
	, type int unsigned comment '1: single copy, 2: multi copy , 3: split shares'
	, typestr varchar(20)
);
create table multicopies (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, itemid varchar(100)
	, countcopies int unsigned 
) ;
create table iteminstances (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, itemid varchar(100)
	, serialnumber int unsigned
);
create table filestorages (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, itemid varchar(100)
	, rawfileurl varchar(1000)
	, rawfileurl01 varchar(1000)
	, rawfileipfs varchar(1000)
	, rawfileipfs01 varchar(1000)
	, rawfiles3 varchar(1000)
	, rawfiles301 varchar(1000)
	, metadataurl varchar(1000)
	, metadataurl01 varchar(1000)
	, metadataipfs varchar(1000)
	, metadataipfs01 varchar(1000)
	, metadatas3 varchar(1000)
	, metadatas301 varchar(1000)
) ;
create table sales (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80)
	, seller varchar(80)
	, itemid varchar(100)
	, iteminstanceid int unsigned 
	, expiryunix bigint 
	, expiry varchar(30) comment '판매만기일 - YYYY-MM-DDTHH:mm:ss'
	, typestr varchar(20) comment '1)COMMON 2)AUCTION() 3)auction-dutch'
	, type tinyint comment '1)COMMON 2)AUCTION 3)auction-dutch'
	, price  varchar(20)
	, offerprice varchar(20) 
	, priceunit varchar(20) 
); 
create table bids (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, saleid int unsigned
	, itemid varchar(100)
	, iteminstanceid int unsigned 
	, seller varchar(80) 
	, bidder varchar(80)
	, price varchar(20)
	, priceunit varchar(20) 
	, txhash varchar(80)
	, nettype varchar(20) comment 'ETH-ROPSTEN, KLAYTN-MAINNET'
);
create table logbids (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, saleid int unsigned
	, itemid varchar(100)
	, iteminstanceid int unsigned 
	, seller varchar(80) 
	, bidder varchar(80)
	, price varchar(20)
	, priceunit varchar(20) 
);
create table paymeans (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, address varchar(80)
	, name varchar(20)
	, symbol varchar(20)
	, decimals tinyint
	, nettype varchar(20) comment 'ETH-ROPSTEN, KLAYTN-MAINNET'
) ;
create table itemhistory (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, itemid varchar(100)
	, iteminstanceid int unsigned
	, from_ varchar(80)
	, to_ varchar(80)
	, price varchar(20)
	, priceunit varchar(20)
	, typestr varchar(20) comment 'MINT,BID,MINT_SELL,SALE,APPROVE_BID,CANCEL_BID,DENY_BID'
	, type tinyint comment ''
);
create table logactions (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80)
	, typestr varchar(20) comment ''
	, type tinyint
) ;
create table logfavorites (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80 )
	, itemid varchar(100)
	, status tinyint comment '0: i do not like, 1: i do like'	
) ;
create table comments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(80)
	, titlename varchar(100)
	, contentbody varchar(1000)
) ;
create table adminusers (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, username varchar(30)
	, pw  varchar(30)
	, email varchar(100)
	, level tinyint default 0 comment '관리자 레벨 0<= ? <=100'
);
create table adminfees ( 
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp()
	, useraction varchar(50) comment 'user actions which are charged'
	, feerate int unsigned comment 'unit is in basis point'
	, writer varchar(30) comment '해당 행 기록 혹은 업데이트한 관리자'
);
 CREATE TABLE `items02` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `itemid` varchar(100) DEFAULT NULL,
  `market` tinyint(4) DEFAULT 0,
  `filesize` bigint(20) unsigned DEFAULT NULL,
  `imagewidth` int(10) unsigned DEFAULT NULL,
  `imageheight` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;
CREATE TABLE `notifies` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `title` varchar(100) DEFAULT NULL,
  `contents` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `announcements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `category` varchar(20) DEFAULT NULL,
  `title` varchar(500) DEFAULT NULL,
  `contentbody` varchar(1000) DEFAULT NULL,
  `writer` varchar(100) DEFAULT NULL,
  `countviews` int(10) unsigned DEFAULT 0,
  PRIMARY KEY (`id`)
);
CREATE TABLE `settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `key_` varchar(100) DEFAULT NULL,
  `value_` varchar(2000) DEFAULT NULL,
  `subkey_` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;
CREATE TABLE `sessionkeys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `username` varchar(80) DEFAULT NULL,
  `token` varchar(48) DEFAULT NULL,
  `ipaddress` varchar(64) DEFAULT NULL,
  `useragent` varchar(200) DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1,
  `type` tinyint(4) DEFAULT 0,
  `typestr` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;
CREATE TABLE `transactions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `username` varchar(80) DEFAULT NULL COMMENT 'may well be address',
  `txhash` varchar(80) DEFAULT NULL,
  `itemid` varchar(80) DEFAULT NULL,
  `type` tinyint(4) DEFAULT NULL COMMENT '0:mint, 1:buy , 2:change price, 3:? ',
  `value` varchar(20) DEFAULT NULL COMMENT '==msg.value',
  `price` varchar(20) DEFAULT NULL,
  `seller` varchar(80) DEFAULT NULL,
  `buyer` varchar(80) DEFAULT NULL,
  `status` tinyint(4) DEFAULT -1,
  `originator` varchar(80) DEFAULT NULL,
  `typestr` varchar(20) DEFAULT NULL,
  `paymeans` varchar(80) DEFAULT NULL,
  `tokenid` bigint(20) unsigned DEFAULT NULL,
  `priceunit` varchar(20) DEFAULT NULL,
  `from_` varchar(80) DEFAULT NULL,
  `to_` varchar(80) DEFAULT NULL,
  `uuid` varchar(100) DEFAULT NULL,
  `nettype` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;
CREATE TABLE `logsales` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `itemid` varchar(100) DEFAULT NULL,
  `market` tinyint(4) DEFAULT 0,
  `type` tinyint(4) DEFAULT NULL COMMENT '0: fixed price-seller approve, 1: fixed price-bid to take, 2: auction',
  `typestr` varchar(20) DEFAULT NULL,
  `expiry` bigint(20) unsigned DEFAULT NULL,
  `ownerserialnumber` int(10) unsigned DEFAULT NULL,
  `offerpricechar` varchar(20) DEFAULT NULL,
  `offerpriceint` bigint(20) unsigned DEFAULT NULL,
  `offerpricefloat` float DEFAULT NULL,
  `bidpricechar` varchar(20) DEFAULT NULL,
  `bidpriceint` bigint(20) unsigned DEFAULT NULL,
  `bidpricefloat` float DEFAULT NULL,
  `username` varchar(80) DEFAULT NULL,
  `bidder` varchar(80) DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1,
  `paymeans` varchar(80) DEFAULT NULL,
  `paymeansname` varchar(20) DEFAULT NULL,
  `expirychar` varchar(30) DEFAULT NULL,
  `ispaymeanstoken` tinyint(4) DEFAULT 1,
  `price` varchar(20) DEFAULT NULL,
  `priceunit` varchar(20) DEFAULT NULL,
  `seller` varchar(80) DEFAULT NULL,
  `txhash` varchar(100) DEFAULT NULL,
  `buyer` varchar(100) DEFAULT NULL,
  `saleopentxhash` varchar(100) DEFAULT NULL,
  `endedat` varchar(30) DEFAULT NULL,
  `nettype` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;
CREATE TABLE `users02` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `username` varchar(80) DEFAULT NULL,
  `countsales` int(10) unsigned DEFAULT 0,
  `countbuys` int(10) unsigned DEFAULT 0,
  `sumsales` varchar(20) DEFAULT '0',
  `sumsalesfloat` float DEFAULT 0,
  `maxstrikeprice` varchar(20) DEFAULT '0',
  `maxstrikepricefloat` float DEFAULT 0,
  `sumbuys` varchar(20) DEFAULT '0',
  `sumbuysfloat` float DEFAULT 0,
  `nickname` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `faqs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `category` varchar(20) DEFAULT NULL,
  `title` varchar(500) DEFAULT NULL,
  `contentbody` varchar(1000) DEFAULT NULL,
  `writer` varchar(100) DEFAULT NULL,
  `countviews` int(10) unsigned DEFAULT 0,
  PRIMARY KEY (`id`)
);
CREATE TABLE `collections` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key ,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `username` varchar(80) DEFAULT NULL COMMENT 'may well be address',
	name varchar(500)
	, description varchar(1000)
);	

CREATE TABLE `collectionhasitems` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key ,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
	collectionid int unsigned comment 'collection id'
	, itemid varchar(100) comment ''
);
create table bundles ( 
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key ,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
	name varchar(500)
	, description varchar(1000)	
) ;
create table bundlehasitems ( 
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT primary key ,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
	bundleid int unsigned comment 'bundle id'
	, itemid varchar(100) comment ''
);
