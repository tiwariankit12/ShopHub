import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";

import api from "../services/api";

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    rating: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Products fetch failed:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/all");
      setOrders(response.data);
    } catch (error) {
      console.error("Orders fetch failed:", error);
      toast.error("Failed to load orders");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Users fetch failed:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const averageRating =
    products.length > 0
      ? (
          products.reduce(
            (total, product) =>
              total + Number(product.rating || 0),
            0
          ) / products.length
        ).toFixed(1)
      : "0.0";

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const validOrders = orders.filter(
    (order) => order.status !== "cancelled"
  );

  const totalRevenue = validOrders.reduce(
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

  const averageOrderValue =
    validOrders.length > 0
      ? totalRevenue / validOrders.length
      : 0;

  // Last 7 days sales data
  const salesChartData = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(
        date.getDate() - (6 - index)
      );

      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const sales = orders
        .filter((order) => {
          if (order.status === "cancelled") {
            return false;
          }

          if (!order.createdAt) {
            return false;
          }

          const orderDate = new Date(
            order.createdAt
          );

          return (
            orderDate >= date &&
            orderDate < nextDate
          );
        })
        .reduce(
          (total, order) =>
            total +
            Number(order.totalAmount || 0),
          0
        );

      return {
        day: date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),
        sales,
      };
    }
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 5);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      stock: "",
      rating: "",
    });

    setEditingId(null);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating || 0),
      };

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          payload
        );

        toast.success(
          "Product updated successfully"
        );
      } else {
        await api.post(
          "/products",
          payload
        );

        toast.success(
          "Product added successfully"
        );
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(
        "Product save failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save product"
      );
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      description:
        product.description || "",
      price: product.price || "",
      category:
        product.category || "",
      image: product.image || "",
      stock: product.stock || "",
      rating: product.rating || "",
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      toast.success(
        "Product deleted successfully"
      );

      fetchProducts();
    } catch (error) {
      console.error(
        "Product delete failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "delivered") {
      return "bg-green-100 text-green-700";
    }

    if (status === "shipped") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "confirmed") {
      return "bg-indigo-100 text-indigo-700";
    }

    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your ShopHub store
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Manage Users
            </Link>

            <Link
              to="/admin/orders"
              className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Store Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">
              Total Users
            </p>

            <h2 className="text-3xl font-bold mt-2 text-indigo-600">
              {users.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">
              Total Products
            </p>

            <h2 className="text-3xl font-bold mt-2 text-blue-600">
              {totalProducts}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">
              Total Orders
            </p>

            <h2 className="text-3xl font-bold mt-2 text-purple-600">
              {totalOrders}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">
              Total Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>
          </div>

        </div>

        {/* Sales Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Sales Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-gray-500">
                Total Sales
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-gray-500">
                Delivered Revenue
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                ₹{deliveredRevenue.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-gray-500">
                Average Order Value
              </p>

              <p className="text-2xl font-bold text-indigo-600 mt-2">
                ₹{Math.round(
                  averageOrderValue
                ).toLocaleString("en-IN")}
              </p>
            </div>

          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sales Chart
            </h2>

            <p className="text-gray-500 mt-1">
              Sales performance for the last 7 days
            </p>
          </div>

          <div className="w-full h-80">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={salesChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`,
                    "Sales",
                  ]}
                />

                <Bar
                  dataKey="sales"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Product Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Product Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-gray-500">
                Total Stock
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalStock}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-gray-500">
                Average Rating
              </p>

              <p className="text-2xl font-bold text-yellow-500 mt-2">
                ⭐ {averageRating}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-gray-500">
                Cancelled Orders
              </p>

              <p className="text-2xl font-bold text-red-600 mt-2">
                {cancelledOrders}
              </p>
            </div>

          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Low Stock Alert
              </h2>

              <p className="text-gray-500 mt-1">
                Products that need restocking
              </p>
            </div>

            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
              {lowStockProducts.length}
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="bg-green-50 text-green-700 rounded-xl p-5 font-semibold">
              All products have sufficient stock.
            </div>
          ) : (
            <div className="space-y-3">

              {lowStockProducts.map(
                (product) => (
                  <div
                    key={product._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-200 rounded-xl p-4"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {product.name}
                      </h3>

                      <p
                        className={`text-sm font-semibold mt-1 ${
                          product.stock === 0
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : `Only ${product.stock} left`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(product)
                      }
                      className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
                    >
                      Restock
                    </button>
                  </div>
                )
              )}

            </div>
          )}
        </div>

        {/* Order Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Order Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-yellow-50 rounded-xl p-5">
              <p className="text-yellow-700">
                Pending
              </p>

              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {pendingOrders}
              </p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-5">
              <p className="text-indigo-700">
                Confirmed
              </p>

              <p className="text-3xl font-bold text-indigo-700 mt-2">
                {confirmedOrders}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-5">
              <p className="text-blue-700">
                Shipped
              </p>

              <p className="text-3xl font-bold text-blue-700 mt-2">
                {shippedOrders}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-5">
              <p className="text-green-700">
                Delivered
              </p>

              <p className="text-3xl font-bold text-green-700 mt-2">
                {deliveredOrders}
              </p>
            </div>

          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Orders
            </h2>

            <Link
              to="/admin/orders"
              className="text-indigo-600 font-semibold hover:text-indigo-800"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500">
              No orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-3 py-3 text-gray-500">
                      Order
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Customer
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Date
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Status
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-100"
                      >
                        <td className="px-3 py-4 font-semibold">
                          #{order._id.slice(-6)}
                        </td>

                        <td className="px-3 py-4">
                          {order.user?.name ||
                            "Unknown"}
                        </td>

                        <td className="px-3 py-4 text-gray-500">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-3 py-4 font-bold">
                          ₹{Number(
                            order.totalAmount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

            </div>
          )}
        </div>

        {/* Product Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="text-gray-500 mt-1">
                Manage your store products
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Category"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Stock"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Rating (0-5)"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product Description"
              rows="4"
              className="md:col-span-2 w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <button
              type="submit"
              className="md:col-span-2 bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition"
            >
              {editingId
                ? "Update Product"
                : "Add Product"}
            </button>

          </form>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Products
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-500">
              No products found.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left">

                    <th className="px-3 py-3 text-gray-500">
                      Product
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Category
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Price
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Stock
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Rating
                    </th>

                    <th className="px-3 py-3 text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <tr
                        key={product._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-3 py-4 font-semibold">
                          {product.name}
                        </td>

                        <td className="px-3 py-4 text-gray-500">
                          {product.category}
                        </td>

                        <td className="px-3 py-4 font-bold">
                          ₹{Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={
                              Number(
                                product.stock
                              ) <= 5
                                ? "text-red-600 font-bold"
                                : "text-green-600 font-semibold"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          ⭐{" "}
                          {product.rating || 0}
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  product
                                )
                              }
                              className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  product._id
                                )
                              }
                              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200"
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>
              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Admin;