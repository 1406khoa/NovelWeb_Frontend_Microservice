import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import FavoriteNovels from "./FavoriteNovels";
import FollowingList from "./FollowingList";
import SuggestedUsers from "./SuggestedUsers";
import { FaArrowLeft } from "react-icons/fa";
import { getUserId } from "../helpers/utils";

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
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Thêm state này để ngăn gọi fetchSuggestedUsers liên tục khi không còn gợi ý
  const [noMoreSuggestions, setNoMoreSuggestions] = useState(false);

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
        categoryID: n.categoryID,
      };
    });

    const novels = await Promise.all(novelDetailPromises);
    return novels;
  };

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

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const currentUserId = getUserId(user);

      const response = await axios.get(`http://localhost:5000/api/User/GetUsers`, { headers });
      let allUsers = response.data;

      const followedUserIds = following.map((f) => f.id);

      // Lọc bỏ chính user hiện tại và những user đã follow
      allUsers = allUsers.filter(
        (u) => u.userID !== currentUserId && !followedUserIds.includes(u.userID)
      );

      const suggestions = allUsers.map((u) => ({
        id: u.userID,
        username: u.username,
        email: u.email
      }));

      setSuggestedUsers(suggestions);
      setLoadingSuggestions(false);

      // Nếu không có suggestion nào, đánh dấu noMoreSuggestions để không gọi lại
      if (suggestions.length === 0) {
        setNoMoreSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      setLoadingSuggestions(false);
    }
  }, [user, following]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userId = id || getUserId(user);
        if (!userId || userId === 0) {
          console.error("Invalid user ID:", userId);
          setProfileData(null);
          return;
        }

        const userResponse = await axios.get(
          `http://localhost:5000/api/User/GetUserById/${userId}`,
          { headers }
        );
        setProfileData(userResponse.data);

        if (id) {
          // Đang xem user khác
          const followingResponse = await axios.get(
            `http://localhost:5000/api/User/${getUserId(user)}/followed-users`,
            { headers }
          );
          const isUserFollowing = followingResponse.data.some(
            (follow) => follow.followedUserID === parseInt(id)
          );
          setIsFollowing(isUserFollowing);
        } else {
          // Profile chính
          const favoriteResponse = await axios.get(
            `http://localhost:5000/api/User/${userId}/favorite-novels`,
            { headers }
          );
          const favoriteNovelIds = favoriteResponse.data;
          const favoriteNovelsData = await fetchFavoriteNovelsDetails(
            favoriteNovelIds
          );
          setFavoriteNovels(favoriteNovelsData);

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

    if (user) {
      fetchData();
    }
  }, [id, user]);

  // Chỉ gọi fetchSuggestedUsers nếu chưa noMoreSuggestions
  useEffect(() => {
    if (
      activeTab === "suggestions" &&
      user &&
      !id &&
      suggestedUsers.length === 0 &&
      !loadingSuggestions &&
      !noMoreSuggestions
    ) {
      fetchSuggestedUsers();
    }
  }, [activeTab, user, id, suggestedUsers.length, loadingSuggestions, noMoreSuggestions, fetchSuggestedUsers]);

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

        // Cập nhật danh sách following tại chỗ
        setFollowings((prev) => prev.filter((usr) => usr.id !== parseInt(id)));
      } else {
        await axios.post(
          `http://localhost:5000/api/User/follow-user?userId=${currentUserId}&followUserId=${id}`,
          {},
          { headers }
        );
        setIsFollowing(true);

        // Thêm user vừa follow vào danh sách following (nếu biết thông tin user)
        // Nếu profileData đã có user đó, sử dụng profileData để thêm vào following
        if (profileData) {
          setFollowings((prev) => [
            ...prev,
            { id: parseInt(id), username: profileData.username, email: profileData.email }
          ]);
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  const handleFollowSuggestedUser = async (suggestedUserId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const currentUserId = getUserId(user);

      await axios.post(
        `http://localhost:5000/api/User/follow-user?userId=${currentUserId}&followUserId=${suggestedUserId}`,
        {},
        { headers }
      );

      // Tìm user được follow trong danh sách suggested
      const userToFollow = suggestedUsers.find((u) => u.id === suggestedUserId);
      if (userToFollow) {
        // Thêm user đó vào following ngay lập tức
        setFollowings((prev) => [...prev, userToFollow]);
      }

      // Xóa user vừa follow khỏi suggestedUsers
      setSuggestedUsers((prev) => prev.filter((u) => u.id !== suggestedUserId));

      // Nếu sau khi xóa user này xong mà suggestedUsers trống, không nhất thiết fetch lại
      // noMoreSuggestions sẽ set nếu fetch trả về rỗng
      // Nếu bạn muốn sau khi follow hết user vẫn fetch 1 lần để đảm bảo không còn user,
      // bạn có thể để logic như cũ. Tuy nhiên hiện tại noMoreSuggestions sẽ ngăn fetch lại.
      if (suggestedUsers.length === 1) {
        // Vừa xóa xong user cuối cùng, set noMoreSuggestions = true để không fetch thêm
        setNoMoreSuggestions(true);
      }
    } catch (error) {
      console.error("Error following suggested user:", error);
    }
  };

  if (!profileData) {
    return (
      <div className="text-center mt-20 text-red-500">
        Failed to load profile data.
      </div>
    );
  }

  const showBackButton = id || location.state?.fromUpdate;

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="pt-20 pb-8 px-8">
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
                {!id && (
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                      activeTab === "suggestions"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    People You May Know
                  </button>
                )}
              </nav>
            </div>

            <div className="pt-6">
              {!id && activeTab === "favorites" && (
                <FavoriteNovels novels={favoriteNovels} />
              )}
              {!id && activeTab === "following" && (
                <FollowingList following={following} />
              )}
              {!id && activeTab === "suggestions" && (
                <SuggestedUsers
                  users={suggestedUsers}
                  onFollow={handleFollowSuggestedUser}
                  loading={loadingSuggestions}
                />
              )}
              {id && (
                <div className="text-center text-gray-500">
                  You cannot access this user's additional tabs.
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
