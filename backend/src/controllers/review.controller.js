import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

export const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!product) {
      return res.status(400).json({
        message: "Product is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        message: "Review comment is required",
      });
    }

    const existingProduct = await Product.findById(product);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      comment: comment.trim(),
    });

    // Get all reviews for this product
    const allReviews = await Review.find({ product });

    // Calculate average rating
    const totalRating = allReviews.reduce(
      (total, review) => total + review.rating,
      0
    );

    const averageRating =
      totalRating / allReviews.length;

    // Update product rating
    existingProduct.rating = Number(
      averageRating.toFixed(1)
    );

    await existingProduct.save();

    const populatedReview = await Review.findById(
      review._id
    ).populate("user", "name");

    res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};