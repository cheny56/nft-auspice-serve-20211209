
module.exports = {
  schema: {
    id:     {type:String,required: true}
    , itemid: {type:String,required: false}
    , createdAt:  {type:String,required: false}
    , updatedAt:{type:String,required: false}
    , createdat:{ type: String, required: false,     }
    , updatedat:{ type: String, required: false,     }
    , address:    {type:String,required: false}
    , ip:         {type:String,required: false}
    , pw:         {type:String,required: false}
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
    , coverimage  : {type:String,required: false}
    , receiveemailnews : {type:Number,required: false , default:0}
    , basecrypto  : { type:String, required:false}

    , countowners : { type:Number , required:false , default : 0 }
    , countoriginators : { type:Number , required:false  , default : 0}
    , isoriginator : { type:Number , required:false  , default : 0}
    , icanmint  : { type : Number , required : true ,default : 0}
  }
  , methods: { }
  , statics: { }
}

