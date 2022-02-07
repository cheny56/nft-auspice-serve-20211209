
const Web3=require('web3')
const infuraurlmain=   '' // 'https://mainnet.infura.io/v3/cd35bc8ac4c14bc5b464e267e88ee9d0'
const urltestnet= 'https://api.baobab.klaytn.net:8651' // 'https://ropsten.infura.io/v3/5799d55e1e66488786f26d987bfcfd05'
// const caver = new Caver( urltestnet )
// const web3 = new Web3( urltestnet ) // "https://cloudflare-eth.com")
// const eth = new Eth(Eth.givenProvider || "ws://some.local-or-remote.node:8546");
const NETCLASS='testnet' // require('fs').readFileSync('NETTYPE.cfg').toString().replace(/ /g,'');console.log(NETCLASS)
const jnetkind={mainnet:'mainnet',testnet:'ropsten'}
const jnettype={mainnet:'mainnet',testnet:'testnet'}
const jinfuraurl={ mainnet : infuraurlmain
	,testnet : urltestnet
}
const infuraurl=jinfuraurl[NETCLASS]  //
const netkind=jnetkind[NETCLASS],nettype=jnettype[NETCLASS] // 'testnet' //  'ropsten'
// const infuraurl=infuraurlmain // urltestnet // 
let web3 = new Web3(new Web3.providers.HttpProvider( urltestnet ))

module.exports={ web3 , netkind , nettype } // ,createaccount,aapikeys,getapikey

