
const { updaterow , findone, findall }=require('../utils/dbmon')
const LOGGER=console.log

const username_srcimg ='0x08F61493539E166810bBb06C28F73323D1a2d202'
// const username='0xa4be47b0c1f6a0a9066d3cebb29ac5d1a42ae689'
//0xa4be47b0c1f6a0a9066d3cebb29ac5d1a42ae689
// const username = "0xdf7f660ecb4d96b56856d6b555a9ee9ae2404918"
const username='0xa9379265c524ead779cf4f2964c6453c0055c9ad'

findone('users',{username : username_srcimg }).then(resp=>{
//	false &&	LOGGER(resp.profileimage)

	findall ( 'users', { username  }).then(list=>{
		list.forEach ( elem=>{
			updaterow ( 'users', { username : elem.username }, { profileimage : resp.profileimage} )
		})
	})

})

false && findone('users',{username}).then(resp=>{
	false &&	LOGGER(resp.profileimage)

	findall ( 'users', {  }).then(list=>{
		list.forEach ( elem=>{
			updaterow ( 'users', { username : elem.username }, { profileimage : resp.profileimage} )
		})
	})

})
