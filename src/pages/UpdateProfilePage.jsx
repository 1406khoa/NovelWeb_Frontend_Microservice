import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import { AuthContext } from "../context/AuthContext";

const UpdateProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext); // Lấy refreshUser từ AuthContext
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      const headers = { Authorization: `Bearer ${token}` };

      // Gửi request update profile
      await axios.put("http://localhost:5000/api/User/UpdateProfile", formData, { headers });

      // Sau khi update thành công, gọi lại GetUserById để lấy thông tin mới nhất của user
      const updatedUserResponse = await axios.get(
        `http://localhost:5000/api/User/GetUserById/${user.userId}`,
        { headers }
      );
      const updatedUser = updatedUserResponse.data;
      
      // Cập nhật AuthContext
      const newUserData = {
        userId: updatedUser.userID, // Giả sử API trả về userID
        username: updatedUser.username,
        email: updatedUser.email,
      };
      refreshUser(newUserData);

      setToastMessage("Profile updated successfully!");
      setShowToast(true);

      // Chuyển hướng về trang profile sau một chút
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage(
        error.response?.data?.Error || "Failed to update profile. Please try again."
      );
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Update Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default UpdateProfilePage;
