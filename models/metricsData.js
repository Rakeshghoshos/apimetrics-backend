import mongoose from "mongoose";

const schema = mongoose.Schema;

const apiData = schema(
  {
    apiName: { type: String, required: true },
    apiId: { type: schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const metricDataSchema = schema(
  {
    uniqueCode: { type: schema.Types.ObjectId, required: true },
    totalApis: { type: Number, required: true, default: 0 },
    apiLogCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const metricDataModel = mongoose.model("metricsData", metricDataSchema);

export default metricDataModel;
