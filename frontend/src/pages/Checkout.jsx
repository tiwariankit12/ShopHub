import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCart } from "../context/CartContext";
import api from "../services/api";

function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    cartTotal,
    clearCart,
  } = useCart();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const deliveryCharge =
    cartTotal >= 1000 ? 0 : 99;

  const totalAmount =
    cartTotal + deliveryCharge;

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error(
        "Please enter a valid 10-digit mobile number"
      );
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }

    if (!formData.state.trim()) {
      toast.error("Please enter your state");
      return false;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error(
        "Please enter a valid 6-digit pincode"
      );
      return false;
    }

    return true;
  };

  const handleCODOrder = async () => {
    try {
      setLoading(true);

      const response = await api.post("/orders", {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),

        shippingAddress: formData,

        paymentMethod: "cod",
      });

      clearCart();

      toast.success(
        "Order placed successfully!"
      );

      navigate("/order-success", {
        state: {
          order: response.data.order,
        },
      });
    } catch (error) {
      console.error(
        "COD order failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async () => {
    if (!showQR) {
      setShowQR(true);
      return;
    }

    const confirmed = window.confirm(
      "Have you completed the UPI payment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/orders", {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),

        shippingAddress: formData,

        paymentMethod: "upi",
      });

      clearCart();

      toast.success(
        "UPI order submitted successfully!"
      );

      navigate("/order-success", {
        state: {
          order: response.data.order,
        },
      });
    } catch (error) {
      console.error(
        "UPI order failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to place UPI order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error(
        "Please login before checkout"
      );

      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (paymentMethod === "upi") {
      await handleUPIPayment();
    } else {
      await handleCODOrder();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">

          <div className="text-5xl mb-4">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="text-gray-500 mt-2">
            Add some products before checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Complete your order details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-8">

            {/* SHIPPING */}

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House no, street, area"
                    rows="4"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>

                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>

                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>
            </div>

            {/* PAYMENT */}

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Payment Method
              </h2>

              <div className="space-y-4">

                {/* COD */}

                <label
                  className={`flex items-center gap-4 border rounded-xl p-5 cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={
                      paymentMethod === "cod"
                    }
                    onChange={(event) => {
                      setPaymentMethod(
                        event.target.value
                      );

                      setShowQR(false);
                    }}
                  />

                  <div>
                    <p className="font-bold text-gray-900">
                      Cash on Delivery
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Pay when your order arrives
                    </p>
                  </div>

                </label>

                {/* UPI */}

                <label
                  className={`flex items-center gap-4 border rounded-xl p-5 cursor-pointer transition ${
                    paymentMethod === "upi"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={
                      paymentMethod === "upi"
                    }
                    onChange={(event) => {
                      setPaymentMethod(
                        event.target.value
                      );

                      setShowQR(false);
                    }}
                  />

                  <div>
                    <p className="font-bold text-gray-900">
                      UPI Payment
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Scan QR and pay using any UPI app
                    </p>
                  </div>

                </label>

              </div>

              {/* QR */}

              {paymentMethod === "upi" &&
                showQR && (
                  <div className="mt-6 border border-indigo-200 bg-indigo-50 rounded-2xl p-6 text-center">

                    <h3 className="text-2xl font-bold text-gray-900">
                      Scan & Pay
                    </h3>

                    <p className="text-gray-600 mt-2">
                      Scan this QR code using any UPI app
                    </p>

                    <div className="bg-white rounded-2xl p-5 inline-block mt-5 shadow-sm">

                      <img
                        src="/QR.jpeg"
                        alt="ShopHub UPI Payment QR Code"
                        className="w-72 h-72 object-contain"
                        onError={(event) => {
                          console.error(
                            "QR image failed to load:",
                            event.currentTarget.src
                          );
                        }}
                      />

                    </div>

                    <div className="mt-5">

                      <p className="text-sm text-gray-500">
                        Payable Amount
                      </p>

                      <p className="text-3xl font-bold text-indigo-600 mt-1">
                        ₹
                        {totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    <div className="mt-5 bg-white rounded-xl p-5 text-left">

                      <p className="font-bold text-gray-800">
                        Payment Steps
                      </p>

                      <ol className="text-sm text-gray-600 mt-3 space-y-2 list-decimal list-inside">

                        <li>
                          Open any UPI app
                        </li>

                        <li>
                          Scan the QR code
                        </li>

                        <li>
                          Pay the exact amount
                        </li>

                        <li>
                          Return here and click "I Have Paid"
                        </li>

                      </ol>

                    </div>

                  </div>
                )}

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-24">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">

              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between gap-4"
                >

                  <div className="min-w-0">

                    <p className="font-semibold text-gray-800 truncate">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      ₹
                      {Number(
                        item.price
                      ).toLocaleString("en-IN")}{" "}
                      × {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold text-gray-900 whitespace-nowrap">
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </p>

                </div>
              ))}

            </div>

            <div className="border-t border-gray-200 pt-5 space-y-4">

              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Delivery
                </span>

                <span>
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge}`}
                </span>
              </div>

              {cartTotal < 1000 && (
                <p className="text-xs text-gray-500">
                  Add ₹
                  {(
                    1000 - cartTotal
                  ).toLocaleString(
                    "en-IN"
                  )}{" "}
                  more for free delivery.
                </p>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">

                <span className="text-xl font-bold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-bold text-indigo-600">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : paymentMethod === "upi" &&
                  showQR
                ? "I Have Paid"
                : paymentMethod === "upi"
                ? "Show UPI QR"
                : "Place Order"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Your order information is securely processed.
            </p>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Checkout;