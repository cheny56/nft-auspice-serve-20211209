
const KEYS=Object.keys
const {findone , findall , countrows_scalar }=require('../utils/db')
const db=require('../models')
const cliredisa=require('async-redis').createClient()
const queryitemdata=async (itemid ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone( 'users', { username: respitem.author } ) // 0 - author
			aproms[aproms.length]=countrows_scalar ( 'itembalances' , { itemid } ) // 1 - count holders 
			aproms[aproms.length]=findall( 'logsales' , { itemid } ) // 2 - logsales
			aproms[aproms.length]=findone( 'filestorages' , { itemid } ) // 3 - filestorages
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 1 } ) // 4 - orders , sell
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 2 } ) // 5 - orders , buyside
			aproms[aproms.length]=findall( 'sales' , { itemid  } ) // 6 - sales  
//			aproms[aproms.length]=findone( 'itembalances' , { username } ) // 3 - itembalance
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
					if ( aresps[0] ){
						delete aresps[0].pw
						delete aresps[0].pwhash
						delete aresps[0].emailverified
						delete aresps[0].emailverifiedtimeunix
						delete aresps[0].icanmint
						delete aresps[0].agreereceivepromo
					}
          resolve( {
							author : aresps[0]
 						, countholders  :aresps[1] 
						, logsales : aresps[2]
						, item : respitem
						, filestorages : aresps[3] 
						, orders_sellside : aresps[ 4 ]  
						, orders_buyside : aresps[ 5 ]  
						, sales : aresps[ 6 ]  
//						, itembalance : aresps[3]
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
//      })
    })
  })
}

////////
const queryitemdata_user=async (itemid , username ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone( 'users', { username: respitem.author } ) // 0 - author
			aproms[aproms.length]=countrows_scalar ( 'itembalances' , { itemid } ) // 1 - count holders 
			aproms[aproms.length]=findall( 'logsales' , { itemid } ) // 2 - logsales
			aproms[aproms.length]=findone( 'itembalances' , { username } ) // 3 - itembalance
			aproms[aproms.length]=findone( 'filestorages' , { itemid } ) // 4 - filestorages
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 1 } ) // 5 - orders , sell
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 2 } ) // 6 - orders , buyside
			aproms[aproms.length]=findone( 'logfavorites' , { itemid , username } ) // 7
			aproms[aproms.length]=findone( 'sales' , { itemid } ) // 8
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
          resolve( {
							author : aresps[0]
 						, countholders  :aresps[1] 
						, logsales : aresps[2]
						, itembalance : aresps[3]
						, item : respitem
						, filestorages : aresps[4]
						, orders_sellside : aresps[ 5 ]
						, orders_buyside : aresps[ 6 ]
						, ilikethisitem : aresps[7]?.status
						, sales : aresps[8]
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
//      })
    })
  })
}
/** logfavorites;
| id | createdat           | updatedat           | username                                   | itemid | status | objectid                                       |
|  2 | 2022-01-17 09:43:36 | 2022-01-17 09:47:08 | 0x8983ea0aadc94cf8dff68d12b011c17a9a3d523d | NULL   |      0 | QmS7RFqoUZei5tQZN6XYyyjcvrtk3eHfibQoxJG4bnh3v3 |
*/
module.exports={
	queryitemdata 
	,	 queryitemdata_user 
}

