import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Product360({ name, image }) {
  const [imageError, setImageError] = useState(false);

  const productImage =
    image && !imageError
      ? image
      : "https://via.placeholder.com/600x600?text=ShopHub";

  return (
    <div className="bg-gray-50 p-4">
      <div className="relative h-60 flex items-center justify-center overflow-hidden select-none">
        <img
          src={productImage}
          alt={name}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-contain transition duration-300 hover:scale-105"
        />
      </div>
    </div>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortBy, setSortBy] = useState("default");

  const [categories, setCategories] = useState([
    "All",
  ]);

  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products");

      const uniqueCategories = [
        ...new Set(
          response.data.map(
            (product) => product.category
          )
        ),
      ];

      setCategories([
        "All",
        ...uniqueCategories,
      ]);
    } catch (error) {
      console.error(
        "Categories fetch failed:",
        error
      );
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }

      if (sortBy !== "default") {
        params.sort = sortBy;
      }

      const response = await api.get("/products", {
        params,
      });

      setProducts(response.data);
    } catch (error) {
      console.error(
        "Products fetch failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    selectedCategory,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            ShopHub 🛒
          </h1>

          <p className="mt-3 text-gray-600">
            Discover amazing products at great prices
          </p>
        </div>

        {/* Search / Filter / Sort */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="🔎 Search products..."
              className="w-full border border-gray-300 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="default">
                Sort: Default
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating-high">
                Rating: High to Low
              </option>

              <option value="name-asc">
                Name: A to Z
              </option>
            </select>

          </div>

          {/* Result Count */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {products.length}
              </span>{" "}
              matching products
            </p>

            {(search ||
              selectedCategory !== "All" ||
              sortBy !== "default") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
              >
                Clear Filters
              </button>
            )}

          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <div className="animate-pulse">
              <p className="text-xl font-semibold text-gray-700">
                Loading products...
              </p>

              <p className="text-gray-400 mt-2">
                Please wait...
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (

          /* No Products */
          <div className="bg-white rounded-2xl p-10 text-center">

            <div className="text-6xl mb-4">
              🔎
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Products Found
            </h2>

            <p className="text-gray-500 mt-2">
              Try a different search or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Clear Filters
            </button>

          </div>
        ) : (

          /* Products */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">

            {products.map((product) => (

              <div
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
              >

                {/* Product Image */}
                <Link
                  to={`/product/${product._id}`}
                >
                  <Product360
                    name={product.name}
                    image={product.image}
                  />
                </Link>

                {/* Product Information */}
                <div className="p-5">

                  <Link
                    to={`/product/${product._id}`}
                  >
                    <p className="text-sm text-indigo-600 font-medium mb-2">
                      {product.category}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition">
                      {product.name}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price + Rating */}
                  <div className="flex items-center justify-between mt-4">

                    <span className="text-2xl font-bold text-gray-900">
                      ₹
                      {product.price.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span className="text-yellow-500 font-medium">
                      ⭐ {product.rating}
                    </span>

                  </div>

                  {/* Stock */}
                  <p className="text-sm text-gray-500 mt-2">
                    {product.stock > 0
                      ? `${product.stock} items available`
                      : "Out of stock"}
                  </p>

                  {/* Add To Cart */}
                  <button
                    type="button"
                    onClick={() =>
                      addToCart(product)
                    }
                    disabled={product.stock === 0}
                    className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition"
                  >
                    🛒 Add to Cart
                  </button>

                  {/* View Details */}
                  <Link
                    to={`/product/${product._id}`}
                    className="block w-full mt-3 text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-xl transition"
                  >
                    View Details
                  </Link>

                </div>
              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}

export default Home;