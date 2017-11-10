var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "hello"
  }
};

function currentUser(users, userID) {
  for (let user in users) {
    if (users[user].id === id) {
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
}

function userValidation(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

function userValidationPassword(users, password) {
  for (let user in users) {
    if (users[user].password === password) {
      return true;
    }
  }
  return false;
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    user: users[req.cookies["user_id"]],
    shortURL:     req.params.id,
    urlsDatabase:     urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templatesVars = {
    user: users[req.cookies["user_id"]],
    shortURL:     req.params.id,
    urlDatabase:  urlDatabase
  };
  res.render("urls_show", templatesVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; //when we use url, always use req.params. 234523
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(generateRandomString(), req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);
    // debug statement to see POST parameters
  res.send("Ok");
           // Respond with 'Ok' (we will replace this)
});

app.get("/login", (req, res) => {
  let templatesVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templatesVars);
  // res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userID = generateRandomString();
  users[userID]= {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };


if (currentUser(users, userID)) {
    res.sendStatus(400);
    return;
  };

if (!userValidation(users, req.body.email)) {
    res.sendStatus(403);
    return;
  };

if (!userValidationPassword(users, req.body.password)) {
    res.sendStatus(403);
    return;
  };


  // TODO: look up user id
  res.cookie("user_id", userID);
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
  res.clearCookie("user_id");
  res.redirect("urls");
});


app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  shortURL = req.body.longURL;
});

app.post("/register", (req, res) => {
  // TODO: if email or password are missing, send 400 "Email or Password Missing"
  // TODO: if the email is taken, send 400 "Email Taken"

  // If the email and password are good, do this stuff
  // if ( req.body.email || req.body.password ==== undefined) {
  //   console.log("Email or password is Missing.");
  // };
  // if ( takenEmail(users, req.body.email)) {
  //   console.log("Email Taken.");
  // }

  if (req.body.password.length === 0  || req.body.email.length === 0) {
    res.sendStatus(400);
    return;
  }

  if (takenEmail (users, req.body.email)) {
    res.sendStatus(400);
    return;
  };

  const userID = generateRandomString();
  users[userID]= {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// const user =  {
//   id: userID,
//   email: req.body.email,
//   password: req.body.password
// };
// users[userID]= user;



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
