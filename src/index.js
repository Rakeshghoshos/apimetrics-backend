import { Router } from "express";
import _ from "lodash";
import metricDataModel from "../models/metricsData.js";
import metricsModel from "../models/metrics.js";
import userModel from "../models/user.js";
import enc from "../utilities/encryptor.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const router = Router();
const response = {
  success: (message = null, data, res) => {
    res.status(200).json({ message: message, data: data });
  },
  error: (message = err, res) => {
    res.status(200).json({ message: message });
  },
};

const generateToken = (value) => {
  let token = jwt.sign(value, process.env.TOKEN_SECRET);
  token = enc.encrypt(token);
  return token;
};

const verifyToken = async (req, res, next) => {
  let headers = req.headers["authorization"];
  if (headers) {
    let token = headers.split(" ")[1];
    token = enc.decrypt(token);
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, emailId) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      let data = await userModel.findOne({ emailId: emailId }).lean();
      req.uniqueCode = data.uniqueCode;
      next();
    });
  } else {
    return res.sendStatus(401); // Unauthorized
  }
};

router.get("/test",async(req,res)=>{
  return response.success("working", "successfully deployed", res);
});
router.post("/register", async (req, res) => {
  try {
    let data = req.body;
    let isExists = await userModel.findOne({ emailId: data.emailId }).lean();
    if (!_.isEmpty(isExists)) {
      return response.success("already registed", 0, res);
    }

    let password = enc.encrypt(data.password);
    let uniqueCode = new mongoose.Types.ObjectId();

    data = {
      ...data,
      password,
      uniqueCode,
    };

    let user = await userModel.create(data);
    user.token = generateToken(data.emailId);
    user.uniqueCode = uniqueCode;
    return response.success("register successfull", user, res);
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});

router.post("/login", async (req, res) => {
  try {
    let { emailId, password } = req.body;
    let isExists = await userModel.findOne({ emailId: emailId }).lean();
    if (_.isEmpty(isExists)) {
      return response.success("invalid credentials", 0, res);
    }
    isExists.password = enc.decrypt(isExists.password);
    if (password.toString() !== isExists.password?.toString()) {
      return response.success("invalid credentials", 0, res);
    }
    isExists.token = generateToken(emailId);
    return response.success("login successfull", isExists, res);
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});

router.post("/data", async (req, res) => {
  try {
    let { metrics } = req.body;
    let keys = Object.keys(metrics);
    let metric = {};
    if (metrics[keys[0]]?.status != 404) {
      metric = await metricsModel
        .findOne({ uniqueCode: metrics[keys[0]]?.uniqueCode, apiName: keys[0] })
        .lean();

      let totalTime = metrics[keys[0]]?.totalTime;
      if (_.isEmpty(metric)) {
        metric = {
          uniqueCode: metrics[keys[0]]?.uniqueCode,
          apiName: keys[0],
          lastCallResponseTime: totalTime,
          minResponseTimeDaily: totalTime,
          maxResponseTimeDaily: totalTime,
          totalCallsDaily: 1,
          totalCallsWeekly: 1,
          totalCallsMonthly: 1,
          avgResponseTimeDaily: totalTime,
          avgResponseTimeWeekly: totalTime,
          avgResponseTimeMonthly: totalTime,
          avgCallsWeekly: 1,
          avgCallsMonthly: 1,
        };
        let isExists = await metricDataModel
          .findOne({ uniqueCode: metrics[keys[0]]?.uniqueCode })
          .lean();

        if (_.isEmpty(isExists)) {
          await metricDataModel.create({
            uniqueCode: metrics[keys[0]]?.uniqueCode,
            totalApis: 1,
            apiLogCount: 50,
          });
        } else {
          await metricDataModel
            .updateOne(
              { uniqueCode: metrics[keys[0]]?.uniqueCode },
              { $set: { totalApis: isExists.totalApis + 1 } }
            )
            .lean();
        }
        await metricsModel.create(metric);
        return response.success("api added", 1, res);
      }

      let totalCallsDaily = metric.totalCallsDaily + 1;
      let totalCallsWeekly = metric.totalCallsWeekly + 1;
      let totalCallsMonthly = metric.totalCallsMonthly + 1;
      metric = {
        ...metric,
        lastCallResponseTime: totalTime,
        minResponseTimeDaily:
          metric.minResponseTimeDaily > totalTime
            ? totalTime
            : metric.minResponseTimeDaily,
        maxResponseTimeDaily:
          metric.maxResponseTimeDaily < totalTime
            ? totalTime
            : metric.maxResponseTimeDaily,
        totalCallsDaily: totalCallsDaily,
        totalCallsWeekly: totalCallsWeekly,
        totalCallsMonthly: totalCallsMonthly,
        avgResponseTimeDaily:
          (metric.avgResponseTimeDaily * (totalCallsDaily - 1) + totalTime) /
          totalCallsDaily,
        avgResponseTimeWeekly:
          (metric.avgResponseTimeWeekly * (totalCallsWeekly - 1) + totalTime) /
          totalCallsWeekly,
        avgResponseTimeMonthly:
          (metric.avgResponseTimeMonthly * (totalCallsMonthly - 1) +
            totalTime) /
          totalCallsMonthly,
        avgCallsWeekly: metric.totalCallsWeekly / 7,
        avgCallsMonthly: metric.totalCallsWeekly / 31,
      };

      await metricsModel.findByIdAndUpdate(metric._id, { $set: metric });
      return response.success(null, 1, res);
    } else {
      return response.success(null, 0, res);
    }
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});

router.post("/getmetrics", verifyToken, async (req, res) => {
  try {
    let uniqueCode = req.uniqueCode;
    let { page, limit, sortBy } = req.body;
    let sort = {};
    sort[sortBy] = -1;
    let data = await metricsModel.aggregatePaginate(
      [
        {
          $match: {
            uniqueCode: uniqueCode,
          },
        },
        {
          $sort: sort,
        },
      ],
      { limit: limit, page: page }
    );

    if (_.isEmpty(data)) {
      return response.success("no data", 0, res);
    }
    return response.success("data", data, res);
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});

router.post("/getMetricsData", verifyToken, async (req, res) => {
  try {
    let uniqueCode = req.uniqueCode;
    let data = await metricDataModel.findOne({ uniqueCode: uniqueCode }).lean();
    if (_isEmpty(data)) {
      return response.success("no data", 0, res);
    }
    return response.success("data", data, res);
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});

router.post("/getMostUsed", verifyToken, async (req, res) => {
  try {
    let uniqueCode = req.uniqueCode;
    let mostCalls = await metricsModel
      .aggregate([
        {
          $match: {
            uniqueCode: new mongoose.Types.ObjectId(uniqueCode),
          },
        },
        {
          $sort: {
            totalCallsDaily: -1,
          },
        },
        {
          $skip: 0,
        },
        {
          $limit: 4,
        },
      ])
      .exec();

    let mostResponseTime = await metricsModel
      .aggregate([
        {
          $match: {
            uniqueCode: new mongoose.Types.ObjectId(uniqueCode),
          },
        },
        {
          $sort: {
            totalCallsDaily: -1,
          },
        },
        {
          $skip: 0,
        },
        {
          $limit: 4,
        },
      ])
      .exec();

    let apiCount = await metricDataModel
      .findOne({ uniqueCode: uniqueCode })
      .select("-_id totalApis")
      .lean();

    apiCount = apiCount?.totalApis;
    return response.success(
      "most used",
      { mostCalls, mostResponseTime, apiCount },
      res
    );
  } catch (err) {
    console.log(err);
    return response.error(err, res);
  }
});
export default router;
