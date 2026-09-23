import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    cartTotal,
  } = useCart();

  const deliveryCharge = cartTotal >= 1000 ? 0 : 99;
  const finalTotal = cartTotal + deliveryCharge;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleIncrease = (product) => {
    if (product.quantity >= product.stock) {
      toast.error("Maximum available stock reached.");
      return;
    }

    addToCart(product);
  };

  const handleDecrease = (productId) => {
    decreaseQuantity(productId);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    toast.success("Product removed from cart.");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm">
          <div className="text-7xl mb-5">🛒</div>

          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-2">
            Looks like you haven't added anything yet.
          </p>

          <Link
            to="/"
            className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Shopping Cart 🛒
            </h1>

            <p className="text-gray-500 mt-2">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link
            to="/"
            className="hidden sm:block text-indigo-600 font-semibold hover:text-indigo-800"
          >
            ← Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}

          <div className="lg:col-span-2 space-y-5">

            {cart.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm p-5"
              >
                <div className="flex flex-col sm:flex-row gap-5">

                  {/* Image */}

                  <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-gray-400">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* Details */}

                  <div className="flex-1">

                    <p className="text-sm text-indigo-600 font-medium">
                      {product.category}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {product.name}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    {/* Quantity */}

                    <div className="flex items-center gap-3 mt-5">

                      <button
                        type="button"
                        onClick={() =>
                          handleDecrease(product._id)
                        }
                        className="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-lg"
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-bold">
                        {product.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleIncrease(product)
                        }
                        className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg"
                      >
                        +
                      </button>

                    </div>

                    {/* Stock */}

                    <p className="text-xs text-gray-500 mt-2">
                      {product.quantity >= product.stock
                        ? "Maximum available stock reached"
                        : `${product.stock - product.quantity} more available`}
                    </p>

                  </div>

                  {/* Price / Remove */}

                  <div className="flex sm:flex-col justify-between items-end">

                    <p className="text-xl font-bold text-gray-900">
                      ₹
                      {(
                        product.price * product.quantity
                      ).toLocaleString("en-IN")}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(product._id)
                      }
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      🗑️ Remove
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>

          {/* Order Summary */}

          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-24">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span>
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>

                <span
                  className={
                    deliveryCharge === 0
                      ? "text-green-600 font-medium"
                      : ""
                  }
                >
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>

                <span>
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

            </div>

            {cartTotal < 1000 && (
              <p className="mt-5 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Add ₹
                {(1000 - cartTotal).toLocaleString("en-IN")}{" "}
                more for FREE delivery 🚚
              </p>
            )}

            <Link
              to="/checkout"
              className="block w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition text-center"
            >
              Proceed to Checkout →
            </Link>

            <div className="mt-5 text-center text-sm text-gray-500">
              🔒 Secure checkout
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Cart;