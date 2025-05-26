// models/DocumentSet.ts
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  dept: { type: String, required: true }, // eg: "ce"
  sem: { type: String, required: true },
  exam: { type: String, required: true },
  year: { type: String, required: true },
  title: { type: String, required: true },
  fileId: { type: String, required: true }, 
},{
  timestamps: true, // Automatically manage createdAt and updatedAt fields});
})
export default mongoose.models.DocumentSet || mongoose.model("DocumentSet", DocumentSchema);
