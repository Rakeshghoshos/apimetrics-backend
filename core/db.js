import mongoose from "mongoose";

const dbConnect = async () => {
  await mongoose.connect(
    "mongodb+srv://root:root@cluster0.gseo2lz.mongodb.net/metrics"
  );
  console.log("connected");
};

export default dbConnect;
