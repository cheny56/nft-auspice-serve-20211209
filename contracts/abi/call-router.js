
const abicallrouter = [
	{		name: 'call_call'
		, type:'function'
		, payable: true
		, constant: true
		, inputs:[
			 {type:'address' , name:'_callee_address' }
		,	{ type : 'bytes4'  , name : '_bytes4arg' }
		]
		, outputs:[
		]
	}
	, {		name: 'call_delegatecall'
	, type:'function'
	, payable: true
	, constant: true
	, inputs:[
		 {type:'address' , name:'_callee_address' }
	,	{ type : 'bytes4'  , name : '_bytes4arg' }
	]
	, outputs:[
	]
} 
]
module.exports={
	abicallrouter
}
/** function call_call ( address _callee_address , bytes4 memory _bytes4arg) public {
	require( _callee_address != address(0), "ERR(62850) zero address");
	_callee_address.call ( _bytes4arg );
}
function call_delegatecall ( address _callee_address , bytes4 memory _bytes4arg ) public {
*/