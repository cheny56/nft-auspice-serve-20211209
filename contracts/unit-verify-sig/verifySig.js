// const web3 = require("web3");
// const eth = require('web3-eth');

var Web3 = require("web3")
const web3 = new Web3("https://cloudflare-eth.com")

var Eth = require('web3-eth');
const eth = new Eth(Eth.givenProvider || 'ws://some.local-or-remote.node:8546');

// const contract = new web3.eth.Contract(
//     [
//         {
//             name: 'testCall',
//             inputs: [
//                 { type: 'bytes32', name: '_hash', internalType: 'bytes32' },
//             ],
//         },
//     ],
//     "0xaeC2f4Dd8b08EeF0C71B02F97978106D875464Ed",
// );

const Order = { //보낼 데이터
    'exchange': '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
    'maker': '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
    "makerRelayerFee" : 12
};
const priKey = "0xcaceedbd0912a415744beaea5cf3f2fbca535ca7ccbe0dc780ac005488657132"; //개인키 (maker만 가짐)
const pubKey = "0xaeC2f4Dd8b08EeF0C71B02F97978106D875464Ed"; //주소(공개키로 쓰임, maker와 taker 모두 가짐(전송교환했다고 가정))

// encoded = web3.eth.abi.encodeParameters(
//     [
//         {
//             "OrderStruct": {
//                 "exchange": 'address',
//                 "maker": 'address',
//                 "makerRelayerFee": 'uint256',
//             }
//         }
//     ],
//     [
//         {
//             "OrderStruct": {
//                 "exchange": '0xaeC2f4Dd8b08EeF0C71B02F97978106D875464Ed',
//                 "maker": '0xaeC2f4Dd8b08EeF0C71B02F97978106D875464Ed',
//                 "makerRelayerFee": '5',
//             }
//         }
//     ]
// )
// hash = web3.utils.keccak256(encoded)
console.log("====================================="); // maker 과정
encoded = web3.eth.abi.encodeParameters(['address', 'address', 'uint'],[Order.exchange, Order.maker, Order.makerRelayerFee])
console.log("keccak256 encoded: ");
console.log(encoded); //문자열로
console.log("=====================================");
signatureObject = web3.eth.accounts.sign(web3.utils.sha3(encoded), priKey); //사인
console.log("sign: ");
console.log(signatureObject);
console.log("====================================="); // maker 과정 끝

// recoverStr = web3.eth.accounts.recover(signatureObject) //사인풀기
// console.log("recover: " + recoverStr);
// console.log("=====================================");
// decoded = web3.eth.abi.decodeParameters(['address', 'address', 'uint'], encoded); //디코드
// console.log(decoded);
// console.log("=====================================");

console.log("====================================="); // taker 과정
function verifySig(signatureObject, pubKey) {
    const recoverStr = web3.eth.accounts.recover(signatureObject) //사인풀기
    if (recoverStr == pubKey) { return true }
}
if(verifySig) {
    console.log("ok");
}
console.log("====================================="); // taker 과정 끝
