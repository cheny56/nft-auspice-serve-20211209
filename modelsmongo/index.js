
const fs        = require('fs');
const path      = require('path');
const mongoose = require('mongoose');//.set('debug', true);
const basename  = path.basename(__filename);
const env       = process.env.NODE_ENV || 'development'
// const config    = require(__dirname + '/../config/config.json')[env];
const db        = {};
const Schema = mongoose.Schema
fs
  .readdirSync(__dirname)
  .filter(fileName => {
    return (
      fileName.indexOf('.') !== 0)
        && (fileName !== basename)
        && (fileName.slice(-3) === '.js'
    );
  })
  .forEach(fileName => {
    const model = require(path.join(__dirname, fileName));
    const modelSchema = new Schema(model.schema , { timestamps:true}) // ≈//{ createdAt: 'createdat',updatedAt:'updatedat'}
    modelSchema.methods = model.methods;
    modelSchema.statics = model.statics;
    // user.js will be user now
    fileName = fileName.split('.')[0];
    db[fileName] = mongoose.model(fileName, modelSchema)
  });
module.exports = db
mongoose.connect('mongodb://localhost:27017',
  {   useNewUrlParser: true
    , useUnifiedTopology: true
    , useFindAndModify:false
    , useCreateIndex:true
  }, err => {
    if(err){  console.log('mongo',err);return false}
    else {    console.log('mongo-local','connected')
    }
  }
)

