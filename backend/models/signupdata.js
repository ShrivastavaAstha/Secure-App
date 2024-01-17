const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
});
const signupmodel = mongoose.model("signup_datas", signupSchema);
module.exports = signupmodel;
