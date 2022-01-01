const IPFS = require('ipfs')
const node = new IPFS()

node.on('ready', () => {
   // start the API gateway
    const Gateway = require('ipfs/src/http');
    const gateway = new Gateway(node);
    return gateway.start();
})
