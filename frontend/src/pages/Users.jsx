import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error("Users fetch failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user) => {
    const newRole =
      user.role === "admin" ? "user" : "admin";

    try {
      setUpdatingId(user._id);

      const response = await api.put(
        `/users/${user._id}/role`,
        {
          role: newRole,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                role: response.data.user.role,
              }
            : item
        )
      );

      toast.success(
        `Role changed to ${newRole}`
      );
    } catch (error) {
      console.error(
        "Role update failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user._id);

      await api.delete(`/users/${user._id}`);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );

      toast.success("User deleted successfully");
    } catch (error) {
      console.error(
        "User delete failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-700">
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Users
              </h1>

              <p className="text-gray-500 mt-2">
                Manage registered ShopHub users
              </p>
            </div>

            <div className="bg-indigo-50 text-indigo-600 px-5 py-3 rounded-xl font-bold">
              {users.length} Users
            </div>
          </div>

          {/* Users */}
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl">👥</div>

              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                No Users Found
              </h2>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b border-gray-200 text-left">

                    <th className="px-4 py-4 text-gray-600">
                      #
                    </th>

                    <th className="px-4 py-4 text-gray-600">
                      Name
                    </th>

                    <th className="px-4 py-4 text-gray-600">
                      Email
                    </th>

                    <th className="px-4 py-4 text-gray-600">
                      Role
                    </th>

                    <th className="px-4 py-4 text-gray-600">
                      Joined
                    </th>

                    <th className="px-4 py-4 text-gray-600">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => {
                    const isCurrentUser =
                      currentUser?._id === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-4 py-4 font-semibold">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {user.name}

                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {user.email}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-500">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">

                            {/* Role Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleRoleChange(user)
                              }
                              disabled={
                                isCurrentUser ||
                                updatingId === user._id ||
                                deletingId === user._id
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                user.role === "admin"
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {updatingId === user._id
                                ? "Updating..."
                                : user.role === "admin"
                                ? "Make User"
                                : "Make Admin"}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteUser(user)
                              }
                              disabled={
                                isCurrentUser ||
                                updatingId === user._id ||
                                deletingId === user._id
                              }
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === user._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Users;