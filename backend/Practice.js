const express = require("express");
const app = express();
app.use(express.json());
const cookies = require("cookie-parser");
app.use(cookies());
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
      return res.status(400).json({
        successs: false,
        message: "Incorrect credentials",
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const middleware = (req, res, next) => {
  if (verifyToken(res.cookies.web_tk)) {
    const userinfo = verifyToken(res.cookies.web_tk);
    console.log(userinfo);
    next();
  } else {
    return res.status(400).json({ success: false, error: "UNAUTHORISED" });
  }
};

app.get("/profile", middleware, (req, res) => {
  try {
    return res.json({ success: true, message: "This is profile" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = 8000;
app.listen(PORT, async () => {
  await console.log(`Server is running at Port ${PORT}`);
});
