const mongoose = require("mongoose");

const connectDB = () => {
  return mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log("MongoDB Error ❌", err.message));
};

module.exports = connectDB;