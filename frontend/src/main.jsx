import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <App />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </CartProvider>
  </React.StrictMode>
);