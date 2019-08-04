const express = require("express"),
	router = express.Router(),
	middleware = require("../middleware"),
	Comment = require("../models/comment"),
	Campground = require("../models/campground");

router.get("/", function(req, res) {
	Campground.find()
		.exec()
		.then(function(campgrounds) {
			res.render("campground/index", { campgrounds: campgrounds });
		})
		.catch(function(err) {
			console.log(err);
		});
});

router.post("/", middleware.isLoggedIn, function(req, res) {
	let name = req.body.name;
	let image = req.body.image;
	let description = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username
	};
	Campground.create({
		name: name,
		image: image,
		description: description,
		author: author
	}).catch(function(err) {
		req.flash("error", "There was an unexpected error. Your campground hasn't been added");
		res.redirect("/campgrounds");
	});
	req.flash("success", "Your campground has been added!");
	res.redirect("/campgrounds");
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
	try{
		res.render("campground/newCampground");
	} catch(err) {
		req.flash("error", "There was an unexpected error.")
		res.redirect("/campgrounds")
	}
});

router.get("/:id", function(req, res) {
	Campground.findById(req.params.id)
		.populate("comments")
		.exec()
		.then(function(campground) {
			res.render("campground/show", { campground: campground });
		})
		.catch(function(err) {
			req.flash("error", "Sorry, something went wrong. We can't show you the selected campground.")
			res.redirect("/campgrounds")
		});
});

router.get("/:id/edit", middleware.isCorrectUser, async function(req, res) {
	try{
		campground = await Campground.findById(req.params.id).exec();
		res.render("campground/edit", { campground: campground });
	} catch(err) {
		req.flash("error", "Sorry, there's an error. We can't display the page.")
		res.redirect(`/campgrounds/${req.params.id}`)
	}
});

router.put("/:id", middleware.isCorrectUser, async function(req, res) {
	try {
		campground = await Campground.findByIdAndUpdate(
			req.params.id,
			req.body.campground
		);
		req.flash("success", "Campground successfully edited.")
		res.redirect(`/campgrounds/${req.params.id}`);
	} catch (err) {
		req.flash("error", "There was an error, we couldn't update the campground.")
		res.redirect(`/campgrounds/${req.params.id}`);
	}
});

router.delete("/:id/delete", middleware.isCorrectUser, async function(
	req,
	res
) {
	try {
		campground = await Campground.findByIdAndDelete(req.params.id);
		comments = await Comment.deleteMany({ _id: { $in: campground.comments } });
		req.flash("success", "Campground successfully removed.")
		res.redirect("/campgrounds");
	} catch (error) {
		req.flash("error", "There was an error, the campground was not deleted.")
		res.redirect(`/campgrounds/${req.params.id}`);
	}
});

module.exports = router;
