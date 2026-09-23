import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductImage({ name, image }) {
  const [imageError, setImageError] = useState(false);

  const productImage =
    image && !imageError
      ? image
      : "https://via.placeholder.com/700x700?text=ShopHub";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-5">
      <div className="h-[350px] sm:h-[450px] flex items-center justify-center overflow-hidden">
        <img
          src={productImage}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain transition duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();

  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Product fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await api.get(`/reviews/${id}`);

        setReviews(response.data);
      } catch (error) {
        console.error("Reviews fetch failed:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const existingProduct = cart.find(
      (item) => item._id === product._id
    );

    if (existingProduct) {
      const remainingStock =
        product.stock - existingProduct.quantity;

      setQuantity((currentQuantity) => {
        if (remainingStock <= 0) {
          return 1;
        }

        return Math.min(currentQuantity, remainingStock);
      });
    }
  }, [cart, product]);

  const increaseQuantity = () => {
    if (!product) return;

    const existingProduct = cart.find(
      (item) => item._id === product._id
    );

    const alreadyInCart =
      existingProduct?.quantity || 0;

    if (alreadyInCart + quantity >= product.stock) {
      toast.error("Maximum available stock reached.");
      return;
    }

    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("Product is out of stock.");
      return;
    }

    const existingProduct = cart.find(
      (item) => item._id === product._id
    );

    const alreadyInCart =
      existingProduct?.quantity || 0;

    const remainingStock =
      product.stock - alreadyInCart;

    if (quantity > remainingStock) {
      toast.error(
        `Only ${remainingStock} more item(s) available.`
      );
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    toast.success(
      `${quantity} ${
        quantity === 1 ? "item" : "items"
      } added to cart! 🛒`
    );

    setQuantity(1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to write a review.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review.");
      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await api.post("/reviews", {
        product: id,
        rating,
        comment: comment.trim(),
      });

      setReviews((currentReviews) => [
        response.data.review,
        ...currentReviews,
      ]);

      setComment("");
      setRating(5);

      toast.success("Review added successfully! ⭐");

      // Refresh product so updated rating appears
      const productResponse = await api.get(
        `/products/${id}`
      );

      setProduct(productResponse.data);
    } catch (error) {
      console.error("Review submit failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🛍️</div>

          <p className="text-xl font-semibold text-gray-700">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">
        <div className="text-7xl mb-5">😕</div>

        <h1 className="text-3xl font-bold text-gray-900">
          Product Not Found
        </h1>

        <p className="text-gray-500 mt-2">
          The product you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold transition"
        >
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const existingProduct = cart.find(
    (item) => item._id === product._id
  );

  const alreadyInCart =
    existingProduct?.quantity || 0;

  const remainingStock =
    product.stock - alreadyInCart;

  const canIncrease =
    alreadyInCart + quantity < product.stock;

  const reviewCount = reviews.length;

  const averageReviewRating =
    reviewCount > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + review.rating,
            0
          ) / reviewCount
        ).toFixed(1)
      : Number(product.rating || 0).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:text-indigo-800 transition"
        >
          ← Back to Shop
        </Link>

        {/* Product Section */}
        <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Product Image */}
          <ProductImage
            name={product.name}
            image={product.image}
          />

          {/* Product Info */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            <span className="inline-block w-fit bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-xl">
                  ★
                </span>

                <span className="font-bold text-gray-800">
                  {Number(product.rating || 0).toFixed(1)}
                </span>
              </div>

              <span className="text-gray-300">
                |
              </span>

              <span className="text-gray-500">
                {reviewCount}{" "}
                {reviewCount === 1
                  ? "Review"
                  : "Reviews"}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mt-6">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-7">
              <span className="text-4xl font-bold text-gray-900">
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            {/* Stock */}
            <div className="mt-5">
              {product.stock > 0 ? (
                <div>
                  <span className="text-green-600 font-semibold">
                    ● In Stock
                  </span>

                  <span className="text-gray-500 ml-2">
                    ({product.stock} available)
                  </span>

                  {product.stock <= 5 && (
                    <div className="mt-3 w-fit bg-orange-50 border border-orange-200 text-orange-600 px-4 py-2 rounded-xl font-semibold text-sm">
                      ⚠️ Only {product.stock} left
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-red-500 font-semibold">
                  ● Out of Stock
                </span>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mt-7">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Quantity
                </p>

                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transition"
                  >
                    −
                  </button>

                  <span className="w-10 text-center text-xl font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={!canIncrease}
                    className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold text-xl transition"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {remainingStock > 0
                    ? `${remainingStock} available to add`
                    : "Maximum stock already in cart"}
                </p>
              </div>
            )}

            {/* Add To Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                product.stock === 0 ||
                remainingStock <= 0
              }
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition text-lg shadow-sm"
            >
              🛒 Add {quantity}{" "}
              {quantity === 1 ? "Item" : "Items"} to Cart
            </button>

            {/* View Cart */}
            <Link
              to="/cart"
              className="w-full mt-3 text-center border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-4 rounded-xl transition"
            >
              View Cart
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-8 lg:p-10 mt-8">

          {/* Review Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Customer Reviews
              </h2>

              <p className="text-gray-500 mt-2">
                See what customers are saying about this product.
              </p>
            </div>

            {/* Average Rating */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-7 py-5 text-center">

              <div className="text-4xl font-bold text-gray-900">
                {averageReviewRating}
                <span className="text-yellow-500 text-3xl ml-2">
                  ★
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {reviewCount}{" "}
                {reviewCount === 1
                  ? "Review"
                  : "Reviews"}
              </p>
            </div>
          </div>

          {/* Write Review */}
          <div className="mt-8 border border-indigo-100 bg-indigo-50 rounded-2xl p-5 sm:p-6">

            <h3 className="text-xl font-bold text-gray-900">
              Write a Review
            </h3>

            {!token ? (
              <p className="text-gray-600 mt-3">
                Please{" "}
                <Link
                  to="/login"
                  state={{
                    from: `/product/${id}`,
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  login
                </Link>{" "}
                to write a review.
              </p>
            ) : (
              <form
                onSubmit={handleSubmitReview}
                className="mt-5"
              >

                {/* Stars */}
                <div>
                  <p className="font-semibold text-gray-700 mb-2">
                    Your Rating
                  </p>

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setRating(star)
                          }
                          className={`text-3xl transition hover:scale-110 ${
                            star <= rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Write your review..."
                  rows="4"
                  maxLength="500"
                  className="w-full mt-4 border border-gray-300 bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    Minimum 3 characters
                  </span>

                  <span className="text-xs text-gray-400">
                    {comment.length}/500
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  {reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review ⭐"}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="mt-8">

            {reviewsLoading ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">
                  ⭐
                </div>

                <p className="text-gray-500">
                  Loading reviews...
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">

                <div className="text-5xl">
                  ⭐
                </div>

                <h3 className="text-xl font-bold text-gray-800 mt-3">
                  No Reviews Yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Be the first to review this product!
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>
                        <h3 className="font-bold text-gray-900">
                          {review.user?.name ||
                            "Customer"}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      {/* Review Stars */}
                      <div className="text-lg">
                        <span className="text-yellow-400">
                          {"★".repeat(
                            review.rating
                          )}
                        </span>

                        <span className="text-gray-300">
                          {"★".repeat(
                            5 - review.rating
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-4 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetails;