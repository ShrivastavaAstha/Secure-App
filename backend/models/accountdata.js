const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
  username: { type: String },
  contact: { type: Number },
  email: { type: String },
  password: { type: String },
});
const accountmodel = mongoose.model("account_datas", accountSchema);
module.exports = accountmodel;
