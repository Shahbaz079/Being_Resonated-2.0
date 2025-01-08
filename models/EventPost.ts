import mongoose from "mongoose";

const EventPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    from:{type:String,required:true},
    caption:{type:String,required:false},
    Image: { type: String, required: true },
    likes: { type: Number, default: 0 },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        
  },
  { timestamps: true }
)


export const EventPost=mongoose.models?.EventPost || mongoose.model("EventPost",EventPostSchema);
