
const { updaterow , findone, findall }=require('../utils/db')
const LOGGER=console.log
const { getrandomint}=require('../utils/common')	
findall('items',{}).then(async list=>{
	list.forEach (async elem=>{
		let pricemin = getrandomint(1,10)
		let pricemax= pricemin + getrandomint(1,10)
		await updaterow('items', {id : elem.id} , { pricemin , pricemax } ) 
	})
})

