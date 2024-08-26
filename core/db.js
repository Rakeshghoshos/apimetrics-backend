import mongoose from "mongoose";
import { CronJob } from "cron";
import metricsModel from "../models/metrics.js";

const dbConnect = async () => {
  await mongoose.connect(
    "mongodb+srv://root:root@cluster0.gseo2lz.mongodb.net/metrics"
  );
  console.log("connected");

  // const jobMinute = new CronJob(
  //   "*/1 * * * *",
  //   async function () {
  //     await metricsModel.updateMany(
  //       {},
  //       {
  //         $set: {
  //           totalCallsDaily: 0,
  //           avgResponseTimeDaily: 0,
  //           minResponseTimeDaily: 0,
  //           maxResponseTimeDaily: 0,
  //         },
  //       }
  //     );
  //     console.log("updated successfully");
  //   },
  //   null,
  //   true,
  //   "Asia/Kolkata"
  // );

  const jobDaily = new CronJob(
    "0 0 * * *",
    async function () {
      await metricsModel.updateMany(
        {},
        {
          $set: {
            totalCallsDaily: 0,
            avgResponseTimeDaily: 0,
            minResponseTimeDaily: 0,
            maxResponseTimeDaily: 0,
          },
        }
      );
      console.log("updated successfully");
    },
    null,
    true,
    "Asia/Kolkata"
  );

  const jobMonth = new CronJob(
    "0 0 28-31 * *",
    async function () {
      await metricsModel.updateMany(
        {},
        {
          $set: {
            avgResponseTimeMonthly: 0,
            totalCallsMonthly: 0,
            avgCallsMonthly: 0,
          },
        }
      );
      console.log("updated successfully monthly");
    }, // onTick
    null, // onComplete
    true, // start
    "Asia/Kolkata" // timeZone
  );

  const jobWeek = new CronJob(
    "0 0 * * 0", // cronTime - runs every Sunday at 12:00 AM
    async function () {
      await metricsModel.updateMany(
        {},
        {
          $set: {
            avgResponseTimeWeekly: 0,
            totalCallsWeekly: 0,
            avgCallsWeekly: 0,
          },
        }
      );
      console.log("updated successfully weekly");
    }, // onTick
    null, // onComplete
    true, // start
    "Asia/Kolkata" // timeZone
  );
};

export default dbConnect;
