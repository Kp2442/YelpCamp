const express = require("express"),
	router = express.Router(),
	User = require("../models/user"),
	passport = require("passport");

router.get("/", function(req, res) {
	res.render("landing");
});

router.get("/register", function(req, res) {
	res.render("register");
});

router.post("/register", async function(req, res) {
	try {
		user = await User.register(
			new User({ username: req.body.username }),
			req.body.password
		);
		await passport.authenticate("local")(req, res, function() {
			req.flash("success", `Welcome ${user.username}`)
			res.redirect("/campgrounds");
		});
	} catch (err) {
		req.flash("error", err.message)
		res.render("register");
	}
});

router.get("/login", function(req, res) {
	res.render("login");
});

router.post(
	"/login",
	function(req, res, next){
		passport.authenticate("local", {
			successRedirect: "/campgrounds",
			failureRedirect: "/login",
			successFlash: "Welcome to YelpCamp, " + req.body.username + "!",
			failureFlash: true
		})(req, res);
	}
);

router.get("/logout", function(req, res) {
	req.logout();
	req.flash("error", "You've logged out.")
	res.redirect("/campgrounds");
});

module.exports = router;
