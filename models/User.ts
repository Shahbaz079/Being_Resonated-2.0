import mongoose from 'mongoose'


const userSchema=new mongoose.Schema({
  name:{type:String,required:true},
  description:{type:String,required:false},
  email:{type:String,required:true,unique:true},
  dob:{type:Date,required:false},
  events:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Event"}],
  gradYear:{type:Number,required:false},
  password:{type:String,required:false,select:false}, // Optional password for custom auth
  image:{type:String,required:false},
  imgThumbnail:{type:String,required:false},
  interests:[{type:String,required:false}],
  teams:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Team"}],
 // assignedWorks: [ {
    // work: { type: String, required: false },
    // completionDate:{type:Date,required:true},
   //  team: { type:mongoose.Schema.Types.ObjectId, ref: 'Team', required: true } }],
  role:{type:String,default:'user'},
  authProviderId:{type:String,required:false}, // For email verification users
  emailVerified:{type:Boolean,default:false}, // Email verification status
  posts:[{type:String,required:false}], // Array of post IDs as strings
  participations:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Events"}],
  eventRequests:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Events"}], // Already exists
  requestEvents:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Events"}], // Used in participate API
  requestTeams:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"Team"}], // Used in join API
  postLikes:[{type:mongoose.Schema.Types.ObjectId,required:false,ref:"EventPost"}],

},{timestamps:true})

export const User=mongoose.models?.User || mongoose.model("User",userSchema);