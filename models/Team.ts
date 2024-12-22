import mongoose from 'mongoose'

const TeamSchema=new mongoose.Schema({
  name:{type:String,required:true},
  description:{type:String,required:true},
  deadline:{type:Date,required:false},
  members:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"User"}],
  leader:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
  timage:{type:String,required:false},
  createdBy:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},


},{timestamps:true})

export const Team=mongoose.models?.Team || mongoose.model("Team",TeamSchema);