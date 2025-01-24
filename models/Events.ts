import mongoose from 'mongoose'

const EventSchema=new mongoose.Schema({
  name:{type:String,required:true},
  leaders:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"User"}],
  image:{type:String,required:true},
  team:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Team"},
  date:{type:Date,required:true},
  members:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"User"}],
  discription:{type:String,required:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
  partricipated:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"User"}],
  requests:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"User"}],
  location:{type:String,required:true},
  time:{type:String,required:true},
  isLive:{type:Boolean,required:true,default:false},
  posts:{type:mongoose.Schema.Types.ObjectId,required:false,ref:"EventPost"}
  

},{timestamps:true})

export const Event=mongoose.models?.Event || mongoose.model("Event",EventSchema);
