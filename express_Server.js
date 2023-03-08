const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080


// middleware codes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.set("view engine", "ejs");


// in-server sample-database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => { // implementing ejs to render data
  const user = users[req.cookies.user_id];
  const templateVars = { 
    user,
    urls: urlDatabase,
    // username: req.cookies["username"]
  };
  console.log(templateVars)
  res.render("urls_index", templateVars); // req now includes post form
});



app.get("/urls/new", (req, res) => { // sending form template for POST request 
  const user = users[req.cookies.user_id];
  const templateVars = { 
    user,
  };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => { // show longURL and generated id
  const user = users[req.cookies.user_id];
  const templateVars = { 
    user,
  };
  res.render("urls_show", templateVars);
});



app.get("/u/:id", (req, res) => { // redirect to existing/preset website on urlDatabase
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



app.post("/urls", (req, res) => { 
  // console.log(req.body); // to inspect the body/for alt. use morgan 
  const shortUrl = generateRandomString(); // defined below
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);
});



app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  let updatedUrl = req.body.longURL;
  urlDatabase[id] = updatedUrl;
  res.redirect("/urls");
});



app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/login", (req, res) =>{

});

app.get("/register", (req, res) => {
  res.render("urls_register")
});



app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});



app.post("/register", (req, res) => {
  
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
  
  res.cookie("user_id", userId);
  res.redirect("/urls")

});



app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const generator = Math.random().toString(36).slice(2, 8);
  return generator;
} 