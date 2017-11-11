const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("hello", 10)
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"}
};

function currentUser(users, userID) {
  for (let user in users) {
    if (users[user].id !== userID) {
      return true;
    }
  }
  return false;
};

function takenEmail(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

function findUserByEmail(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

function urlsForUser(userID) {
  var output = {};
  for (var url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      output[url] = urlDatabase[url];
    }
  }
  return output;
};

app.use(cookieSession({
  name: 'session',
  keys: ["Connie!!!!"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL:     req.params.id,
    urlsDatabase: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = findUserByEmail(users, req.body.email);
  let templateVars = {
    user: users[req.session.user_id]
  }
    if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL; //when we use url, always use req.params. 234523
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send(403);
    return;
  };
  console.log(generateRandomString(), req.body);
  urlDatabase[generateRandomString()] = {longURL: req.body.longURL, userID: req.session.user_id};
  console.log(urlDatabase);
    // debug statement to see POST parameters
  res.redirect("/urls");
           // Respond with 'Ok' (we will replace this)
});

app.get("/login", (req, res) => {
  let templatesVars = {
    user: users[req.session.user_id]
  };
  if (currentUser(templatesVars.user)) {
    res.sendStatus(403);
    return;
  };
  res.render("urls_login", templatesVars);
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(users, req.body.email);
  if (!user) {
    res.sendStatus(403);
    return;
  };
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.sendStatus(403);
    return;
  };
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let register = {
    email: req.body.email,
    password: req.body.password
  };
  res.render("urls_register", register);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("urls");
});


app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.send(400);
    return;
  };
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.send(403);
    return;
  };
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.send(400);
    return;
  };

  let templatesVars = {
    user: users[req.session.user_id],
    shortURL:     req.params.id,
    urlDatabase:  urlDatabase
  };
  res.render("urls_show", templatesVars);
});

app.post("/register", (req, res) => {
  if (req.body.password.length === 0  || req.body.email.length === 0) {
    res.sendStatus(400);
    return;
  };
  if (takenEmail (users, req.body.email)) {
    res.sendStatus(400);
    return;
  };
  const userID = generateRandomString();
  users[userID]= {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
    req.session.user_id = userID;
    res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
