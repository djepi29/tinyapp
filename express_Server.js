// required dependencies
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080


// middleware codes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.set("view engine", "ejs");


// in-server sample-database//////////////////

// URL storage/sorting database
// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

// user info storage/sorting database
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

// global functions////////////////////////

// ID generator 
const generateRandomString = (sliceNumber) => {
  const generator = Math.random().toString(36).slice(sliceNumber);
  return generator;
}

// user search by email 
function findUserByEmail(users, targetEmail) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === targetEmail) {
      return user;
    }
  }
  return null;
};

// urls list of user
const urlsForUser = function (id) {
  const userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
};

//// ROUTES //////////////////////////////////////

// redirect based on login ? /urls : /login)
app.get("/", (req, res) => {
  res.send("Hello!");
});


// renders urls_index / list of urldatabase
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) return res.send('you must be logged in!');
  const userUrls = urlsForUser(req.cookies.user_id)
  const templateVars = {
    user,
    urls: userUrls,

  };
  res.render("urls_index", templateVars);
});

// longURL entries page
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) return res.redirect('/login');
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});


// longURL and generated id page
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) return res.send('you must be logged in!');
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    return res.send("invalid ID request!");
  };
  const templateVars = {
    user,
    longURL: urlDatabase[req.params.id].longURL,
    id: req.params.id
  };
  res.render("urls_show", templateVars);
});



app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  return longURL ? res.redirect(longURL) : res.status(403).send('ID not found');
});



app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) return res.send('you must be logged in!');
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl].longURL = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);
});



app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) return res.send('you must be logged in!');
  const id = req.params.id;
  if (!urlDatabase[id]) return res.send("ID does not exist");
  if (urlDatabase[id].userID !== req.cookies.user_id) {
    return res.send("invalid ID request!");
  };
  let updatedUrl = req.body.longURL;
  urlDatabase[id].longURL = updatedUrl;
  res.redirect("/urls");
});


// delete ShortUrl id
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) return res.send('you must be logged in!');
  const id = req.params.id;
  if (!urlDatabase[id]) return res.send("ID does not exist");
  if (urlDatabase[id].userID !== req.cookies.user_id) {
    return res.send("invalid ID request!");
  };
  delete urlDatabase[id];
  res.redirect('/urls');
});


// login page
app.get("/login", (req, res) => {
  if (req.cookies.user_id) return res.redirect('/urls');
  res.render("urls_login", { user: null });
});


// register page
app.get("/register", (req, res) => {
  if (req.cookies.user_id) return res.redirect('/urls');
  res.render("urls_register", { user: null });
});





app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(users, email);
  if (!user) return res.status(403).send('user not found');
  if (user.password !== password) {
    return res.status(403).send('invalid credentials');
  };
  res.cookie("user_id", user.id)
  res.redirect("/urls");
});




app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('email and password required')
    return;
  };
  const foundUser = findUserByEmail(users, req.body.email);
  if (foundUser) {
    res.status(400).send('email already taken')
    return;
  };
  const password = req.body.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: hashedPassword
  };

  res.cookie("user_id", userId);
  res.redirect("/urls")

});






app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
