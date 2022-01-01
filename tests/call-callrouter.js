
const { ADDRESSES }=require('../configs/addresses')
const { getabistr_forfunction }=require('../utils/contract-calls')
const A_EOA= [ 
	'0xc35eC349Ca8cc32C3775e3DA9A310eC8E421ABfe' 
, '0x3e125F5D532D2C8CAbffE5cD2d7aBdAe2FEF0087'
]
let { getweirep}=require('../utils/eth')
const LOGGER=console.log
let abistr = getabistr_forfunction({
	contractaddress: ADDRESSES.test_erc20 ,
	abikind: "ERC20",
	methodname: 'approve',
	aargs: [        // myaddress ,
		A_EOA[ 0 ] // 
//		,	A_EOA[ 1 ] // 
		, getweirep("" + 1000000000000000 )
	],
})
// => 0x095ea7b3000000000000000000000000c35ec349ca8cc32c3775e3da9a310ec8e421abfe000000000000000000000000000000000000314dc6448d9338c15b0a00000000
//    function approve(address spender, uint256 amount) external returns (bool);

daiToken.methods.balanceOf(senderAddress).call(function (err, res) {
  if (err) {
    console.log("An error occured", err)
    return
  }
  console.log("The balance is: ", res)
})

LOGGER('' , abistr)
// approve(address spender, uint256 amount)  bool
