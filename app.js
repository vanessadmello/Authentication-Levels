require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//session configuration
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

//initialize passport with session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/SecretsDB");

const userSchema = mongoose.Schema({
	email: String,
	password: String,
});

//add plugin for passport-local-mongoose for authentication services
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.get("/secrets", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
});

app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

app.post("/register", (req, res) => {
	User.register(
		{ username: req.body.username },
		req.body.password,
		function (err, user) {
			if (err) {
				console.log(err);
				res.redirect("/register");
			} else {
				passport.authenticate("local")(req, res, () => {
					res.redirect("/secrets");
				});
			}
		}
	);
});

app.post("/login", (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	});
	req.login(user, (err) => {
		if (err) {
			console.log(err);
			res.redirect("/login");
		} else {
			passport.authenticate("local")(req, res, () => {
				res.redirect("/secrets");
			});
		}
	});
});

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
