
const KEYS=Object.keys
const queryitemdata_filter = async jfilter => {
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if( KEYS(jfilter ).length ){} else {resolve(null)}
    findone('items', {... jfilter }).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone('users', { username : respitem.originator } ) // 0
      aproms[aproms.length]=findone('bids', { ... jfilter } ) // 1
      aproms[aproms.length]=findone('users', { username : respitem.owner } ) // 2
//      aproms[aproms.length]=db['logbids'].findAll({raw:true       , where :{}, offset:0, limit:1, order:[ ['id','DESC'] ]}) // 3 
      aproms[aproms.length]=db['logsales'].findAll({raw:true        , where :{... jfilter }, offset:0, limit:1, order:[ ['id','DESC'] ]}) // 3 
      aproms[aproms.length]=findone('items02' , { ... jfilter } ) // 4
      aproms[aproms.length]=findone('featured', { ... jfilter } ) // 5
      findone('sales', { ... jfilter }).then(async respsale=>{
        if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
        else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
          let logsale = aresps[3] && aresps[3][0] ? aresps[3][0] : null // 3
          let resolved_price=resolveprice ( respsale , logsale )
          let normprice= await resolve_normprice ( resolved_price , respsale , logsale )
          resolve( {
            sale : respsale
            , originator : aresps[0]  // 0
            , bid : aresps[1] // 1
            , owner : aresps[2] // 2
            , seller : aresps[6] // 6
            , item : respitem
            , logsale
            , price : resolved_price // ( respsale , logsale )
            , market : resolvemarket ( respsale , logsale )
            , countfavors : respitem.countfavors
            , normprice : normprice? normprice : null
            , item02 : aresps[4]
  , category : respsale? 'Sale' : 'Sold'
            , featured : aresps[5 ]
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
      })
    })
  })
}
const queryitemdata_input_itemid=async itemid=>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone('users', { username : respitem.originator } ) // 0
      aproms[aproms.length]=findone('bids', { itemid } ) // 1
      aproms[aproms.length]=findone('users', { username : respitem.owner } ) // 2
//      aproms[aproms.length]=db['logbids'].findAll({raw:true       , where :{itemid }, offset:0, limit:1, order:[ ['id','DESC'] ]}) // 3 
      aproms[aproms.length]=db['logsales'].findAll({raw:true        , where :{itemid }, offset:0, limit:1, order:[ ['id','DESC'] ]}) // 3 
      aproms[aproms.length]=findone('items02' , {itemid} ) // 4
      aproms[aproms.length]=findone('featured' , {itemid} ) // 5
      findone('sales', { itemid }).then(async respsale=>{
        if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
        else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
          let logsale = aresps[3] && aresps[3][0] ? aresps[3][0] : null // 3
          let resolved_price=resolveprice ( respsale , logsale )
          let normprice= await resolve_normprice ( resolved_price , respsale , logsale )
          resolve( {
            sale : respsale
            , originator : aresps[0]  // 0
            , bid : aresps[1] // 1
            , owner : aresps[2] // 2
            , seller : aresps[6] // 6
            , item : respitem
            , logsale
            , price : resolved_price // ( respsale , logsale )
            , market : resolvemarket ( respsale , logsale )
            , countfavors : respitem.countfavors
            , normprice : normprice? normprice : null
            , item02 : aresps[4]
  , category : respsale? 'Sale' : 'Sold'
            , featured : aresps[5 ]
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
      })
    })
  })
}

module.exports={
	 queryitemdata_filter 
	, queryitemdata_input_itemid
}

