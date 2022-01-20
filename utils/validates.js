
const validate_txhash=str=>{  return /^0x([A-Fa-f0-9]{64})$/.test( str )}

const validateemail =email=> {  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
const WAValidator = require('multicoin-address-validator')
const cryptotype = 'ETH'
const isaddressvalid =str=> WAValidator.validate( str , cryptotype.toLowerCase() )
module.exports={
	validate_txhash
	, validateemail
	, isaddressvalid 
}
