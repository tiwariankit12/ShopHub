import { useEffect, useState } from "react";
import {
  FaBars,
  FaBoxOpen,
  FaHome,
  FaSignOutAlt,
  FaShoppingCart,
  FaStore,
  FaTimes,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount } = useCart();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    try {
      setUser(
        storedUser ? JSON.parse(storedUser) : null
      );
    } catch (error) {
      console.error(
        "User data parse failed:",
        error
      );
      setUser(null);
    }

    setMenuOpen(false);
  }, [location.pathname]);

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `flex items-center gap-2 font-semibold transition ${
      isActive(path)
        ? "text-indigo-600"
        : "text-gray-700 hover:text-indigo-600"
    }`;

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
      isActive(path)
        ? "bg-indigo-50 text-indigo-600"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-indigo-600"
          >
            <FaStore />
            <span>ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">

            <Link
              to="/"
              className={linkClass("/")}
            >
              <FaHome />
              Home
            </Link>

            {user && (
              <Link
                to="/orders"
                className={linkClass("/orders")}
              >
                <FaBoxOpen />
                My Orders
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={linkClass("/admin")}
                >
                  <FaUsers />
                  Admin
                </Link>

                <Link
                  to="/admin/orders"
                  className={linkClass(
                    "/admin/orders"
                  )}
                >
                  <FaBoxOpen />
                  All Orders
                </Link>

                <Link
                  to="/admin/users"
                  className={linkClass(
                    "/admin/users"
                  )}
                >
                  <FaUsers />
                  Users
                </Link>
              </>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className={`${linkClass(
                "/cart"
              )} relative`}
            >
              <FaShoppingCart />

              <span>Cart</span>

              {cartCount > 0 && (
                <span className="absolute -top-3 -right-4 min-w-5 h-5 px-1 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-4">

                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <FaUser className="text-indigo-600" />
                  <span>{user.name}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800"
              >
                <FaUser />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            {menuOpen ? (
              <FaTimes size={20} />
            ) : (
              <FaBars size={20} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4">

            <div className="flex flex-col gap-2">

              <Link
                to="/"
                className={mobileLinkClass("/")}
              >
                <FaHome />
                Home
              </Link>

              {user && (
                <Link
                  to="/orders"
                  className={mobileLinkClass(
                    "/orders"
                  )}
                >
                  <FaBoxOpen />
                  My Orders
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={mobileLinkClass(
                      "/admin"
                    )}
                  >
                    <FaUsers />
                    Admin
                  </Link>

                  <Link
                    to="/admin/orders"
                    className={mobileLinkClass(
                      "/admin/orders"
                    )}
                  >
                    <FaBoxOpen />
                    All Orders
                  </Link>

                  <Link
                    to="/admin/users"
                    className={mobileLinkClass(
                      "/admin/users"
                    )}
                  >
                    <FaUsers />
                    Users
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                className={`${mobileLinkClass(
                  "/cart"
                )} justify-between`}
              >
                <span className="flex items-center gap-3">
                  <FaShoppingCart />
                  Cart
                </span>

                {cartCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-700 font-semibold">
                    <FaUser className="text-indigo-600" />
                    {user.name}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold text-left"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={mobileLinkClass(
                    "/login"
                  )}
                >
                  <FaUser />
                  Login
                </Link>
              )}

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;