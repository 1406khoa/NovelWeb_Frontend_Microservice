import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import FavoriteNovels from "./FavoriteNovels";
import FollowingList from "./FollowingList";
import { FaArrowLeft } from "react-icons/fa";
import { getUserId } from "../helpers/utils"; // Import hàm helper

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [favoriteNovels, setFavoriteNovels] = useState([]);
  const [following, setFollowings] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");

  // Hàm fetch danh sách tiểu thuyết yêu thích theo ID
  const fetchFavoriteNovelsDetails = async (novelIds) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const novelDetailPromises = novelIds.map(async (novelId) => {
      const response = await axios.get(
        `http://localhost:5000/api/Novel/getbyid/${novelId}`,
        { headers }
      );
      const n = response.data;
      return {
        id: n.novelID,
        title: n.name,
        author: n.author,
        description: n.description,
        categoryID: n.categoryID
      };
    });

    const novels = await Promise.all(novelDetailPromises);
    return novels;
  };

  // Hàm fetch danh sách user follow
  const fetchFollowingUsers = async (followedUserIds) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const userDetailsPromises = followedUserIds.map(async (followedUserId) => {
      const response = await axios.get(
        `http://localhost:5000/api/User/GetUserById/${followedUserId}`,
        { headers }
      );
      const u = response.data;
      return {
        id: u.userID,
        username: u.username,
        email: u.email,
      };
    });

    const users = await Promise.all(userDetailsPromises);
    return users;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userId = id || getUserId(user); // Sử dụng hàm helper để lấy userId

        // Kiểm tra nếu userId không hợp lệ
        if (!userId || userId === 0) {
          console.error("Invalid user ID:", userId);
          setProfileData(null);
          return;
        }

        // Lấy thông tin user
        const userResponse = await axios.get(
          `http://localhost:5000/api/User/GetUserById/${userId}`,
          { headers }
        );
        setProfileData(userResponse.data);

        // Nếu đang xem user khác, kiểm tra trạng thái follow
        if (id) {
          const followingResponse = await axios.get(
            `http://localhost:5000/api/User/${getUserId(user)}/followed-users`,
            { headers }
          );
          const isUserFollowing = followingResponse.data.some(
            (follow) => follow.followedUserID === parseInt(id)
          );
          setIsFollowing(isUserFollowing);
        }

        // Chỉ fetch favorite novels khi đang xem profile chính
        if (!id) {
          // Lấy danh sách ID tiểu thuyết yêu thích
          const favoriteResponse = await axios.get(
            `http://localhost:5000/api/User/${userId}/favorite-novels`,
            { headers }
          );
          const favoriteNovelIds = favoriteResponse.data; // Mảng ID [3,2,1,...]

          // Lấy chi tiết tiểu thuyết từ ID
          const favoriteNovelsData = await fetchFavoriteNovelsDetails(favoriteNovelIds);
          setFavoriteNovels(favoriteNovelsData);

          // Lấy danh sách user follow (chỉ khi profile chính)
          const followedResponse = await axios.get(
            `http://localhost:5000/api/User/${userId}/followed-users`,
            { headers }
          );
          const followedUserIds = followedResponse.data.map(
            (follow) => follow.followedUserID
          );
          const followedUsers = await fetchFollowingUsers(followedUserIds);
          setFollowings(followedUsers);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setProfileData(null);
      }
    };

    // Chỉ gọi fetchData nếu user đã được xác thực và có thông tin
    if (user) {
      fetchData();
    }
  }, [id, user]); // Sử dụng user trong dependencies

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const currentUserId = getUserId(user);
      if (!currentUserId) {
        console.error("Current user ID is invalid.");
        return;
      }

      if (isFollowing) {
        await axios.delete(
          `http://localhost:5000/api/User/${currentUserId}/unfollow-user/${id}`,
          { headers }
        );
        setIsFollowing(false);
      } else {
        await axios.post(
          `http://localhost:5000/api/User/${currentUserId}/follow-user/${id}`,
          {},
          { headers }
        );
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  if (!profileData) {
    return <div className="text-center mt-20 text-red-500">Failed to load profile data.</div>;
  }

  // Điều kiện hiển thị nút Back:
  // - Nếu đang ở user khác (id có giá trị)
  // - Hoặc nếu location.state?.fromUpdate là true (nếu bạn muốn dùng tính năng này)
  const showBackButton = id || location.state?.fromUpdate;

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="pt-20 pb-8 px-8">
            {/* Nút Back chỉ hiển thị khi đang xem user khác hoặc từ trang UpdateProfile */}
            {showBackButton && (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 mb-4 text-gray-600 hover:text-blue-600 transition-colors"
                title="Go back to your profile"
              >
                <FaArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {profileData.username}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>{profileData.email}</span>
                </div>
              </div>
              {id && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-lg ${
                    isFollowing
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
              {!id && (
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Information
                </button>
              )}
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                {/* Chỉ hiển thị tab "Favorite Novels" và "Followings" khi không xem trang người dùng khác */}
                {!id && (
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                      activeTab === "favorites"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Favorite Novels ({favoriteNovels.length})
                  </button>
                )}
                {!id && (
                  <button
                    onClick={() => setActiveTab("following")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                      activeTab === "following"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Followings ({following.length})
                  </button>
                )}
              </nav>
            </div>

            <div className="pt-6">
              {/* Hiển thị nội dung tab */}
              {!id && activeTab === "favorites" && (
                <FavoriteNovels novels={favoriteNovels} />
              )}
              {!id && activeTab === "following" && (
                <FollowingList following={following} />
              )}
              {/* Nếu đang xem trang người dùng khác, không hiển thị gì hoặc thêm nội dung khác nếu cần */}
              {id && (
                <div className="text-center text-gray-500">
                  You cannot access this user's favorite novels and followings.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
