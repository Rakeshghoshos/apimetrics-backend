import mongoose from "mongoose";

const schema = mongoose.Schema;

const userSchema = schema(
  {
    emailId: { type: String, required: true },
    password: { type: String, required: true },
    uniqueCode: { type: schema.Types.ObjectId, required: true },
    token: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
