import mongoose from "mongoose";

const UserPostSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    caption:{type:String,required:false},
    Image: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" }],
   // relatedTo: [{ type: String, required: true }],
   // sendTo: { type: String, required: true,options:["all","teams","interests"] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

        
  },
  { timestamps: true }
)


export const UserPost=mongoose.models?.UserPost || mongoose.model("UserPost",UserPostSchema);
