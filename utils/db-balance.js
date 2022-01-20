
const KEYS=Object.keys
const {findone , findall , countrows_scalar
	, updaterow
 }=require('../utils/db')
const db=require('../models')
const cliredisa=require('async-redis').createClient()
const { ISFINITE } =require('../utils/common' )

const move_avail_to_locked=async(username,itemid , amounttolockup )=>{
	amounttolockup = + amounttolockup 
	if (ISFINITE ( amounttolockup ) ){}
	else {LOGGER('BAg9a3WfzF arg invalid'); return null }
	let respbalance = await findone( 'itembalances' , {		username , itemid	})
	if ( respbalance ) {
		if(+respbalance.avail >= amounttolockup ){}
		else {LOGGER('3kd2YE3l9f@balance not enough'  ) ; return null }
		await updaterow ( 'itembalances' , { username, itemid} , {
			avail : respbalance.avail - amounttolockup 
			, locked : respbalance.locked + amounttolockup 
		} )
		return 1
	}
}
const move_across_columns = async(username,itemid ,sourcefield ,destfield,  amount)=>{
	amount= + amount
	if (ISFINITE ( amount) ){}
	else {LOGGER('BAg9a3WfzF arg invalid'); return null }
	let respbalance = await findone( 'itembalances' , {		username , itemid	})
	if ( respbalance ) {
		if(+respbalance[ sourcefield ] >= amount ){}
		else {LOGGER('3kd2YE3l9f@balance not enough'  ) ; return null }
		let jupdates={}
		jupdates[ sourcefield ] = jupdates[ sourcefield ] - amount
		jupdates[ destfield ] = jupdates[ destfield ] + amount // all init'd to 0
		await updaterow ( 'itembalances' , { username, itemid} , {
			... jupdates
		} )
		return 1
	}
}
/** itembalances;
| username  | varchar(80)         | YES  |     | NULL                |                               |
| itemid    | varchar(100)        | YES  |     | NULL                |                               |
| amount    | bigint(20)          | YES  |     | 0                   |                               |
| avail     | bigint(20)          | YES  |     | 0                   |                               |
| locked    | bigint(20)          | YES  |     | 0                   |                               |
| tokenid   | bigint(20) unsigned | YES  |     | NULL                |                               |
| hidden    | bigint(20) unsigned | YES  |     | NULL                |                               |
| visible   | bigint(20) unsigned | YES  |     | NULL                |                               |
| decimals  | tinyint(4)          |  */
/** logfavorites;
| id | createdat           | updatedat           | username                                   | itemid | status | objectid                                       |
|  2 | 2022-01-17 09:43:36 | 2022-01-17 09:47:08 | 0x8983ea0aadc94cf8dff68d12b011c17a9a3d523d | NULL   |      0 | QmS7RFqoUZei5tQZN6XYyyjcvrtk3eHfibQoxJG4bnh3v3 |
*/
module.exports={move_across_columns 
}

