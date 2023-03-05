const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan("dev"));
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => { // implementing ejs to render data
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); // req now includes post form
});

app.get("/urls/new", (req, res) => { // sending form template for POST request 
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { // show longURL and generated id
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => { 
  // console.log(req.body); // to inspect the body/for alt. use morgan 
  const shortUrl = generateRandomString(); // defined below
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => { // redirect to existing/preset website on urlDatabase
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  let updatedUrl = req.body.longURL;
  urlDatabase[id] = updatedUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const generator = Math.random().toString(36).slice(2, 8);
  return generator;
} 