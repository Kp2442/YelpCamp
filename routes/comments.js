const express = require("express"),
	router = express.Router({ mergeParams: true }),
	middleware = require("../middleware"),
	Campground = require("../models/campground"),
	Comment = require("../models/comment");

router.get("/new", middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id)
		.exec()
		.then(function(campground) {
			res.render("comment/new", { campground: campground });
		})
		.catch(function(err){
			req.flash("error", "Sorry there was an error, try again.")
			res.redirect(`/campgrounds/${req.params.id}`)
		})
});

router.post("/", middleware.isLoggedIn, async function(req, res) {
	try {
		let campground = await Campground.findById(req.params.id).exec();
		let comment = await Comment.create(req.body.comment);
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.save();
		campground.comments.push(comment);
		campground.save();
		req.flash("success", "Comment successfully posted")
		res.redirect(`/campgrounds/${campground._id}`);
	} catch (err) {
		req.flash("error", "Sorry there was an error, try again.")
		res.redirect(`campgrounds/${req.params.id}`)
	}
});

router.get("/:comment_id/edit", middleware.isCommentAuthor, async function(req, res) {
	comment = await Comment.findById(req.params.comment_id);
	campground = await Campground.findById(req.params.id);
	res.render("comment/edit", { comment: comment, campground: campground });
});

router.put("/:comment_id", middleware.isCommentAuthor, async function(req, res) {
	try {
		await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
		req.flash("success", "Comment successfully edited.")
		res.redirect(`/campgrounds/${req.params.id}`);
	} catch {
		req.flash("error", "Sorry there was an error, your comment wasn't edited.")
		res.redirect("back");
	}
});

router.delete("/:comment_id/delete", middleware.isCommentAuthor, async function(req, res) {
	try {
		await Comment.findByIdAndDelete(req.params.comment_id);
		campground = await Campground.findById(req.params.id);
		campground.comments.deleteOne(req.params.comment_id);
		campground.save();
		req.flash("error", "Comment successfully deleted.")
		res.redirect("/campgrounds");
	} catch {
		req.flash("error", "Sorry there was an error, we couldn't delete your comment.")
		res.redirect("back");
	}
});

module.exports = router;
