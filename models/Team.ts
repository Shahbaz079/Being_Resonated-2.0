import mongoose from 'mongoose'

const TeamSchema=new mongoose.Schema({
  name:{type:String,required:true},
  motive:{type:String,required:true},
  deadline:{type:Date,required:true},
  members:[{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"}],
  leader:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},


},{timestamps:true})

export const Team=mongoose.models?.Team || mongoose.model("Team",TeamSchema);