import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = mongoose.Schema;

const metricsSchema = schema(
  {
    uniqueCode: { type: schema.Types.ObjectId, required: true },
    apiName: { type: String, required: true },
    lastCallResponseTime: { type: Number, required: true, default: 0 },
    avgResponseTimeDaily: { type: Number, required: true, default: 0 },
    minResponseTimeDaily: { type: Number, required: true, default: 0 },
    maxResponseTimeDaily: { type: Number, required: true, default: 0 },
    avgResponseTimeWeekly: { type: Number, required: true, default: 0 },
    avgResponseTimeMonthly: { type: Number, required: true, default: 0 },
    totalCallsDaily: { type: Number, required: true, default: 0 },
    totalCallsWeekly: { type: Number, required: true, default: 0 },
    totalCallsMonthly: { type: Number, required: true, default: 0 },
    avgCallsWeekly: { type: Number, required: true, default: 0 },
    avgCallsMonthly: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

metricsSchema.plugin(mongoosePaginate);
metricsSchema.plugin(aggregatePaginate);

const metricsModel = mongoose.model("metric", metricsSchema);

export default metricsModel;
