import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-sm p-10 text-center max-w-lg w-full">

        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="text-yellow-500 text-7xl" />
        </div>

        <h1 className="text-7xl font-bold text-indigo-600">
          404
        </h1>

        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-500 mt-3">
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 mt-7 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl transition"
        >
          <FaHome />
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default NotFound;