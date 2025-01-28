import mongoose, { Mongoose } from "mongoose";

const TeamPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    from:{type:mongoose.Schema.Types.ObjectId,ref:"Team", required:true},
    caption:{type:String,required:false},
    image: { type: String, required: true },
    likes: { type: Number, default: 0 },
    imgThumbnail: { type: String, required: false },
   

    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        
  },
  { timestamps: true }
)


export const TeamPost=mongoose.models?.TeamPost || mongoose.model("TeamPost",TeamPostSchema);
