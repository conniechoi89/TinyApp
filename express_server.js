var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

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
    username: req.cookies["username"],
    shortURL:     req.params.id,
    urlsDatabase:     urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templatesVars = {
    username: req.cookies["username"],
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


app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  shortURL = req.body.longURL;
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});