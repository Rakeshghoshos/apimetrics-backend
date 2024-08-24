import mongoose from "mongoose";

const schema = mongoose.Schema;

const apiLogs = schema(
  {
    uniqueCode: { type: schema.Types.ObjectId, required: true },
    api: { type: String, required: true },
    responseTime: { type: Number, required: true },
  },
  { timestamps: true }
);

const apiLogsModel = mongoose.model("apiLog", apiLogs);

export default apiLogsModel;
