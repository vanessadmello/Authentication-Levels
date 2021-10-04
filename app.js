const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/SecretsDB");

const userSchema = mongoose.Schema({
	email: String,
	password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
		// Store hash in your password DB.
		const newUser = new User({
			email: req.body.username,
			password: hash,
		});
		newUser.save((err) => {
			if (err) {
				console.log(err);
			} else {
				res.render("secrets");
			}
		});
	});
});

app.post("/login", (req, res) => {
	User.findOne({ email: req.body.username }, (err, user) => {
		if (err) {
			console.log(err);
		} else {
			if (user) {
				bcrypt
					.compare(req.body.password, user.password)
					.then(function (result) {
						if (result === true) {
							res.render("secrets");
						}
					});
			}
		}
	});
});

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
