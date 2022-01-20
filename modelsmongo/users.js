
module.exports = {
  schema: {
    id:     {type:String,required: false}
    , itemid: {type:String,required: false}
    , createdAt:  {type:String,required: false}
    , updatedAt:{type:String,required: false}
    , createdat:{ type: String, required: false,     }
    , updatedat:{ type: String, required: false,     }
    , address:    {type:String,required: false}
    , ip:         {type:String,required: false}
    , pw:         {type:String,required: false}
    , pwhash:         {type:String,required: false}
    , level:      {type:String,required: false}
    , username:   {type:String,required: false}
    , active:     {type:String,required: false}
    , email:      {type:String,required: false}
    , nickname    :{type:String,required: false}
    , storename   :{type:String,required: false}
    , description :{type:String,required: false}
    , referercode : {type:String,required: false}
    , myreferercode   : {type:String,required: false}
    , profileimage: {type:String,required: false}
    , profileimagefilename : {type:String,required: false}

    , coverimage  : {type:String,required: false}
    , coverimagefilename  : {type:String,required: false}
    , receiveemailnews : {type:Number,required: false , default:0}
    , basecrypto  : { type:String, required:false}
    , countowners : { type:Number , required:false , default : 0 }
    , countoriginators : { type:Number , required:false  , default : 0}
    , isoriginator : { type:Number , required:false  , default : 0}
    , icanmint  : { type : Number , required : true ,default : 0}
		, agreepromoinfo : { type : Number , required : true ,default : 0}
  }
  , methods: { }
  , statics: { }
}
/** id                   | int(10) unsigned | NO   | PRI | NULL                | auto_increment                |
| createdat            | datetime         | YES  |     | current_timestamp() |                               |
| updatedat            | datetime         | YES  |     | NULL                | on update current_timestamp() |
| username             | varchar(80)      | YES  |     | NULL                |                               |
| nickname             | varchar(80)      | YES  |     | NULL                |                               |
| email                | varchar(100)     | YES  |     | NULL                |                               |
| pw                   | varchar(20)      | YES  |     | NULL                |                               |
| pwhash               | varchar(100)     | YES  |     | NULL                |                               |
| level                | int(10) unsigned | YES  |     | 0                   |                               |
| profileimageurl      | varchar(500)     | YES  |     | NULL                |                               |
| coverimageurl        | varchar(500)     | YES  |     | NULL                |                               |
| uuid                 | varchar(80)      | YES  |     | NULL                |                               |
| iscreator            | tinyint(4)       | YES  |     | 0                   |                               |
| countowned           | int(10) unsigned | YES  |     | NULL                |                               |
| countcreated         | int(10) unsigned | YES  |     | NULL                |                               |
| address              | varchar(80)      | YES  |     | NULL                |                               |
| emailverified        | tinyint(4)       | YES  |     | 0                   |                               |
| profileimagesrc      | varchar(1000)    | YES  |     | NULL                |                               |
| backgroundimgsrc     | varchar(1000)    | YES  |     | NULL                |                               |
| profileimagefilename | varchar(200)     | YES 
*/
