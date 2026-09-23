import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/all");
      setOrders(response.data);
    } catch (error) {
      console.error("Orders fetch failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
      });

      toast.success("Order status updated successfully! ✅");

      fetchOrders();
    } catch (error) {
      console.error("Status update failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update order status."
      );
    }
  };

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

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      order.status === filterStatus;

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      order._id?.toLowerCase().includes(searchText) ||
      order.user?.name?.toLowerCase().includes(searchText) ||
      order.user?.email?.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.totalAmount || 0),
    0
  );

  const deliveredRevenue = orders
    .filter((order) => order.status === "delivered")
    .reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            All Orders 📦
          </h1>

          <p className="text-gray-500 mt-2">
            Manage customer orders and delivery status
          </p>
        </div>

        {/* Revenue Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>

            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {pendingOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Delivered Orders
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {deliveredOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Total Revenue
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>

        </div>

        {/* Delivered Revenue */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Revenue from Delivered Orders
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹
                {deliveredRevenue.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div className="text-5xl">
              💰
            </div>

          </div>

        </div>

        {/* Search + Filter */}

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="md:col-span-2">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Orders
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by customer name, email or order ID..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>

              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="all">
                  All Orders
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </div>

          </div>

          {(search || filterStatus !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear Search & Filter
            </button>
          )}

        </div>

        {/* Order Count */}

        <div className="mb-6">

          <p className="text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">
              {orders.length}
            </span>{" "}
            orders
          </p>

        </div>

        {/* Orders */}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

            <div className="text-6xl mb-4">
              🔎
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Orders Found
            </h2>

            <p className="text-gray-500 mt-2">
              Try a different search or status filter.
            </p>

          </div>
        ) : (
          <div className="space-y-6">

            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >

                {/* Order Header */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b pb-5">

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

                  <div className="flex flex-wrap items-center gap-3">

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(
                          order._id,
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>

                    </select>

                  </div>

                </div>

                {/* Customer */}

                <div className="mt-6">

                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Customer Details
                  </h2>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="font-semibold text-gray-900">
                      {order.user?.name ||
                        "Unknown Customer"}
                    </p>

                    <p className="text-gray-600 mt-1">
                      {order.user?.email ||
                        "No email"}
                    </p>

                  </div>

                </div>

                {/* Products */}

                <div className="mt-6">

                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Products
                  </h2>

                  <div className="space-y-3">

                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                      >

                        <div className="w-full sm:w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Image
                            </span>
                          )}

                        </div>

                        <div className="flex-1">

                          <h3 className="font-bold text-gray-900">
                            {item.name}
                          </h3>

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

                </div>

                {/* Address + Payment */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">

                  <div>

                    <h2 className="font-bold text-gray-900 mb-3">
                      Delivery Address
                    </h2>

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

                    <h2 className="font-bold text-gray-900 mb-3">
                      Payment Summary
                    </h2>

                    <div className="space-y-2 text-gray-600">

                      <div className="flex justify-between">
                        <span>
                          Payment
                        </span>

                        <span className="font-semibold uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>
                          Subtotal
                        </span>

                        <span>
                          ₹
                          {order.subtotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>
                          Delivery
                        </span>

                        <span>
                          {order.deliveryCharge === 0
                            ? "FREE"
                            : `₹${order.deliveryCharge}`}
                        </span>
                      </div>

                      <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">

                        <span>
                          Total
                        </span>

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
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminOrders;