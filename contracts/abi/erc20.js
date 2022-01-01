
const abierc20 = [
	{		name: 'approve'
		, type:'function'
		, payable: false
		, constant: true
		, inputs:[
			 {type:'address' , name:'_spender'}
		,	{ type : 'uint256'  , name : '_amount' }
		]
		, outputs:[
			{type:'bool' , name: 'result_'}
		]
	}
]
module.exports={
	abierc20
}
