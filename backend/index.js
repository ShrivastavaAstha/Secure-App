const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
const { connectDatabase } = require("./connection/connect");
const signupmodel = require("./models/signupdata");
const verifyToken = require("./tokens/verifyToken");
const generateToken = require("./tokens/generateToken");
const { encrytPassword, verifyPassword } = require("./functions/encryption");
const { sendLoginOtp } = require("./functions/otp");

// const inputPassword = "astha@2333";
// const encryptedPassword = encrytPassword(inputPassword);

app.get("/public", (req, res) => {
  try {
    return res.json({ success: true, message: "Hello from the public api" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/addsignup", async (req, res) => {
  try {
    const { email, username } = req.body;
    const userEmailExist = await signupmodel.findOne({ email });
    const userNameExist = await signupmodel.findOne({ username });
    if (userEmailExist) {
      return res.json({ message: "Email already Exist" });
    } else if (userNameExist) {
      return res.json({ message: "Username already Exist" });
    }
    const obj = {
      username: req.body.username,
      email: req.body.email,
      password: await encrytPassword(req.body.password),
      contact: req.body.contact,
    };
    console.log(obj);
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
      const signupdata = new signupmodel(obj);
      await signupdata.save();
      return res.status(200).json({ success: true, message: "Data Saved" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    let inputpassword = req.body.password;
    const checkuser = await signupmodel.findOne({
      email: email,
    });
    //leftside email is comming from database and rightone is from frontend that user enter.
    if (!checkuser) {
      return res
        .status(400)
        .json({ success: false, error: "User not found, please signup first" });
    }
    let originalpassword = checkuser.password;

    let userid = checkuser._id;
    // if (inputpassword === originalpassword) {
    //   const token = generateToken(userid);
    //   console.log(token);
    //   res.cookie("web_tk", token);
    //   return res.json({
    //     success: true,
    //     message: "Logged in successfully.",
    //   });}
    if (await verifyPassword(inputpassword, originalpassword)) {
      sendLoginOtp(`+91${checkuser.contact}`);
      //here we will do 2fa process in which we will send otp to the logged in user.
      return res.json({
        success: true,
        message: "Logged in successfully.",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect password" });
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

const PORT = 8000;
connectDatabase();
app.listen(PORT, async () => {
  await console.log(`Server is running at Port ${PORT}`);
});
