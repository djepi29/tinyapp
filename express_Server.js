// required dependencies
const express = require("express");
const app = express();
const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080;
// required funcitons
const { generateRandomString, findUserByEmail, urlsForUser } = require("./helpers");
// required Database
const { urlDatabase, users } = require("./database-sample");


// middleware codes
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // maxAge: 24 * 60 * 60 * 1000
}));



//// ROUTES //////////////////////////////////////


app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  user ? res.redirect('/urls') : res.redirect("/login");
});

app.get("/urls", (req, res) => {
  //                     .cookies
  const user = users[req.session.user_id];
  if (!user) return res.status(404).send('you must be logged in!');
  //                               .cookies
  const userUrls = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = {
    user,
    urls: userUrls,

  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //       .cookies
  if (!req.session.user_id) return res.redirect('/login');
  //                     .cookies
  const user = users[req.session.user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //                     .cookies
  const user = users[req.session.user_id];
  if (!user) return res.status(404).send('you must be logged in!');
  //                                           .cookies
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(404).send("invalid ID request!");
  }
  const templateVars = {
    user,
    longURL: urlDatabase[req.params.id].longURL,
    id: req.params.id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const {id} = req.params;
  console.log("the id:", id);
  console.log(urlDatabase);
  if (!urlDatabase[id]) {
    return res.status(404).send("Url not found")
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return longURL ? res.redirect(longURL) : res.status(404).send('ID not found');
});

app.post("/urls", (req, res) => {
  //       .cookies
  if (!req.session.user_id) return res.status(404).send('you must be logged in!');
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id", (req, res) => {
  //                     .cookies
  const user = users[req.session.user_id];
  if (!user) return res.status(404).send('you must be logged in!');
  const id = req.params.id;
  if (!urlDatabase[id]) return res.status(404).send("ID does not exist");
  //                                 .cookie
  if (urlDatabase[id].userID !== req.session.user_id) {
    return res.status(404).send("invalid ID request!");
  }
  let updatedUrl = req.body.longURL;
  urlDatabase[id].longURL = updatedUrl;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  //                     .cookie
  const user = users[req.session.user_id];
  if (!user) return res.status(404).send('you must be logged in!');
  const id = req.params.id;
  if (!urlDatabase[id]) return res.status(404).send("ID does not exist");
  //                                 .cookies
  if (urlDatabase[id].userID !== req.session.user_id) {
    return res.status(404).send("invalid ID request!");
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  //      .cookie
  if (req.session.user_id) return res.redirect('/urls');
  res.render("urls_login", { user: null });
});


app.get("/register", (req, res) => {
  //      .cookie
  if (req.session.user_id) return res.redirect('/urls');
  res.render("urls_register", { user: null });
});



// urls_login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(users, email);
  if (!user) return res.status(404).send('user not found');
  const passwordCheck = bcrypt.compareSync(password, user.password);
  if (!passwordCheck) return res.status(404).send('invalid credentials');
  req.session.user_id = user.id;
  res.redirect("/urls");
});




app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(404).send('email and password required');
    return;
  }
  const foundUser = findUserByEmail(users, req.body.email);
  if (foundUser) {
    res.status(404).send('email already taken');
    return;
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString(10);
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = userId;
  res.redirect("/urls");

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
