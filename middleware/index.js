const middlewareObj = {},
	Campground = require("../models/campground"),
	Comment = require("../models/comment");

middlewareObj.isCorrectUser = async function(req, res, next) {
	if (req.isAuthenticated()) {
		campground = await Campground.findById(req.params.id).exec();

		if (!campground) {
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}

		if (campground.author.id.equals(req.user._id)) {
			next();
		} else {
			req.flash("error", "You don't have the permission to do that.")
			res.redirect("back");
		}
	} else {
		req.flash("error","You must be logged in to do that.")
		res.redirect("back");
	}
};

middlewareObj.isCommentAuthor = async function(req, res, next) {
	if (req.isAuthenticated()) {
		comment = await Comment.findById(req.params.comment_id).exec();
		if (!comment) {
			req.flash("error", "Comment not found.");
			return res.redirect("back");
		}
		if (comment.author.id.equals(req.user._id)) {
			next();
		} else {
			req.flash("error", "You don't have the permission to do that.")
			res.redirect("back");
		}
	} else {
		req.flash("error", "You must be logged in to do that.")
		res.redirect("back");
	}
};

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You must be logged in to do that.");
	res.redirect("/login");
};

module.exports = middlewareObj;
