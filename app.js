const express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	methodOverride = require("method-override"),
	Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	User = require("./models/user");

const indexRoutes = require("./routes/index"),
	campgroundRoutes = require("./routes/campgrounds"),
	commentRoutes = require("./routes/comments");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
	useNewUrlParser: true,
	useFindAndModify: false
});
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(
	require("express-session")({
		secret: "YelpCamp",
		resave: false,
		saveUninitialized: false
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
app.use(methodOverride("_method"));

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(3000);
