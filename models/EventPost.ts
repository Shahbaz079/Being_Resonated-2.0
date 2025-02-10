import mongoose from "mongoose";
import { boolean } from "zod";

const EventPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    from:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Event"},
    team:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Team"},
    caption:{type:String,required:false},
    Image: { type: String, required: true },
    imgThumbnail: { type: String, required: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,required:false}],
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isEventPost:{ type:Boolean,required:true,default:true} ,

    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        
  },
  { timestamps: true }
)


export const EventPost=mongoose.models?.EventPost || mongoose.model("EventPost",EventPostSchema);
