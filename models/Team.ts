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

import { Types } from 'mongoose';

interface ITeam {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  deadline?: Date;
  members?: Types.ObjectId[];
  leader: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    gradYear?: number
  };
  timage?: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export default ITeam;
