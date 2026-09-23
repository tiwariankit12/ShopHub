import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/orders/my-orders");

        setOrders(response.data);
      } catch (error) {
        console.error("Orders fetch failed:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusSteps = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
  ];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Orders 📦
            </h1>

            <p className="text-gray-500 mt-2">
              Track all your ShopHub orders
            </p>
          </div>

          <Link
            to="/"
            className="hidden sm:block text-indigo-600 font-semibold hover:text-indigo-800"
          >
            ← Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">

            <div className="text-7xl mb-5">
              📦
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mt-2">
              You haven't placed any orders yet.
            </p>

            <Link
              to="/"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Start Shopping
            </Link>

          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => {
              const currentStatusIndex = getStatusIndex(
                order.status
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >

                  {/* Order Header */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">

                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <p className="font-bold text-gray-900 break-all">
                        {order._id}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(
                          order.createdAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                    </div>

                  </div>

                  {/* Status Timeline */}

                  {order.status === "cancelled" ? (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="font-semibold text-red-600">
                        ❌ This order has been cancelled.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-7">

                      <div className="flex items-center justify-between">

                        {statusSteps.map(
                          (step, index) => {
                            const completed =
                              index <= currentStatusIndex;

                            return (
                              <div
                                key={step}
                                className="flex flex-col items-center flex-1"
                              >

                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                                    completed
                                      ? "bg-indigo-600 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {completed
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <span
                                  className={`text-xs sm:text-sm mt-2 capitalize ${
                                    completed
                                      ? "text-indigo-600 font-semibold"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {step}
                                </span>

                              </div>
                            );
                          }
                        )}

                      </div>

                      <div className="h-1 bg-gray-200 mt-[-25px] mx-[12%] -z-0 relative">
                        <div
                          className="h-1 bg-indigo-600 transition-all"
                          style={{
                            width:
                              currentStatusIndex <= 0
                                ? "0%"
                                : `${
                                    (currentStatusIndex /
                                      (statusSteps.length -
                                        1)) *
                                    100
                                  }%`,
                          }}
                        />
                      </div>

                    </div>
                  )}

                  {/* Items */}

                  <div className="mt-7 space-y-4">

                    <h3 className="text-xl font-bold text-gray-900">
                      Items
                    </h3>

                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row gap-4 border border-gray-100 rounded-xl p-4"
                      >

                        <div className="w-full sm:w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-gray-400">
                              No Image
                            </span>
                          )}

                        </div>

                        <div className="flex-1">

                          <h4 className="font-bold text-gray-900">
                            {item.name}
                          </h4>

                          <p className="text-gray-500 mt-1">
                            ₹
                            {item.price.toLocaleString(
                              "en-IN"
                            )}{" "}
                            × {item.quantity}
                          </p>

                        </div>

                        <div className="font-bold text-gray-900">
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </div>

                      </div>
                    ))}

                  </div>

                  {/* Bottom Details */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7 pt-6 border-t">

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Delivery Address
                      </h3>

                      <p className="text-gray-600">
                        {order.shippingAddress?.name}
                      </p>

                      <p className="text-gray-600">
                        {order.shippingAddress?.phone}
                      </p>

                      <p className="text-gray-600">
                        {order.shippingAddress?.address}
                      </p>

                      <p className="text-gray-600">
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}
                      </p>

                      <p className="text-gray-600">
                        PIN:{" "}
                        {order.shippingAddress?.pincode}
                      </p>
                    </div>

                    <div>

                      <h3 className="font-bold text-gray-900 mb-3">
                        Payment & Total
                      </h3>

                      <div className="space-y-2 text-gray-600">

                        <div className="flex justify-between">
                          <span>Payment</span>

                          <span className="font-medium uppercase">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Subtotal</span>

                          <span>
                            ₹
                            {order.subtotal.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Delivery</span>

                          <span>
                            {order.deliveryCharge === 0
                              ? "FREE"
                              : `₹${order.deliveryCharge}`}
                          </span>
                        </div>

                        <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                          <span>Total</span>

                          <span>
                            ₹
                            {order.totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;