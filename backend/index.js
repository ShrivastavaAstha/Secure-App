const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
const { connectDatabase } = require("./connection/connect");
const accountmodel = require("./models/accountdata");
const verifyToken = require("./tokens/verifyToken");
const generateToken = require("./tokens/generateToken");

app.get("/public", (req, res) => {
  try {
    return res.json({ success: true, message: "Hello from the public api" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/login", (req, res) => {
  try {
    console.log(req.body);
    let userid = req.body.userid;
    if (req.body.password === 12345) {
      const token = generateToken(userid);
      console.log(token);
      res.cookie("web_tk", token);
      return res.json({
        success: true,
        message: "Cookie generated successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect credentials" });
    }
    // const currDate = new Date();
    // const newTime = new Date(currDate.setHours(currDate.getHours() + 10));
    // console.log(newTime);
    // res.cookie("web_tk", "Hello_Cookie", { expires: newTime });
    // return res.json({ success: true, message: "Cookie generation successful" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const middleware = (req, res, next) => {
  if (verifyToken(req.cookies.web_tk)) {
    const userinfo = verifyToken(req.cookies.web_tk);
    console.log(userinfo);
    next();
  } else {
    return res.status(400).json({ success: false, error: "UNAUTHORIZED" });
  }
};

app.get("/profile", middleware, (req, res) => {
  try {
    // console.log(req.cookies.web_tk);
    // if (req.cookies.web_tk === "Hello_Cookie") {
    return res.json({ success: true, message: "This is Profile" });
    // } else {
    //   return res.status(400).json({ success: false, error: "UNAUTORIZED" });
    // }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/chats", middleware, (req, res) => {
  try {
    //if (req.cookies.web_tk === "Hello_Cookie")
    return res.json({ success: true, message: "Welcome to your chat" });
    // else return res.status(400).json({ success: false, error: "UNAUTHORISED" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/addaccount", async (req, res) => {
  try {
    const obj = {
      username: req.body.username,
      contact: req.body.contact,
      email: req.body.email,
      password: req.body.password,
    };
    console.log(obj);
    const accountdata = new accountmodel(obj);
    await accountdata.save();
    return res.status(200).json({ success: true, message: "Data Saved" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = 8000;
connectDatabase();
app.listen(PORT, async () => {
  await console.log(`Server is running at Port ${PORT}`);
});
