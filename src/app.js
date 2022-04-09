const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
require("./db/conn");
const Register = require("./models/registers");

const hbs = require("hbs");

const static_Path = path.join(__dirname, "../public");
const templates_Path = path.join(__dirname, "../templates/views");
const Partials_Path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_Path));
app.set("view engine", "hbs");
app.set("views", templates_Path);
hbs.registerPartials(Partials_Path);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirmpassword: cpassword,
      });

      console.log("the success paart" + registerEmployee);
      const token = await registerEmployee.generateAuthToken();
      console.log("the success part" + token);
      const registered = await registerEmployee.save();
      res.status(201).render("index");
    } else {
      res.send("password are not matching..");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//login check
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    //console.log(`email ${email} password ${password}`);
    const useremail = await Register.findOne({ email: email });
    //console.log(useremail.password);
    const isMatch = await bcrypt.compare(password, useremail.password);
    const token = await useremail.generateAuthToken();
    console.log("the success part" + token);
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid login detail");
    }
  } catch (error) {
    res.status(400).send("Invalid login detail");
  }
});

app.listen(port, () => {
  console.log(`server is running at port no. ${port}`);
});
