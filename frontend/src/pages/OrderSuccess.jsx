import { Link, Navigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaBoxOpen,
} from "react-icons/fa";

function OrderSuccess() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm p-8 md:p-10 text-center">

        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-7xl" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-500 mt-4 leading-relaxed">
          Thank you for shopping with ShopHub.
          Your order has been received successfully.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-7">
          <p className="text-green-700 font-semibold text-lg">
            🎉 Your order is confirmed
          </p>

          <p className="text-green-600 text-sm mt-2">
            You can track your order status from My Orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">

          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
          >
            <FaBoxOpen />
            My Orders
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-xl transition"
          >
            <FaShoppingBag />
            Continue Shopping
          </Link>

        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;