import mongoose from 'mongoose'

const EventSchema=new mongoose.Schema({
  Name:{type:String,required:true},
  image:{type:String,required:true},
  team:{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Team"},
  date:{type:Date,required:true},
  discription:{type:String,required:true},
  

},{timestamps:true})

export const Event=mongoose.models?.Event || mongoose.model("Event",EventSchema);