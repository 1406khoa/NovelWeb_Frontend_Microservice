import axios from "axios";
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserId } from "../helpers/utils";
import FavoriteNovels from "./FavoriteNovels";
import FollowingList from "./FollowingList";
import History from './History';
import SuggestedUsers from "./SuggestedUsers";
import { Mail, Edit2, BookOpen, Users, UserPlus, HistoryIcon } from 'lucide-react';
import '../index.css';

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
  const [noMoreSuggestions, setNoMoreSuggestions] = useState(false);

  // Tab hiển thị thực tế (để animation mượt mà)
  const [displayTab, setDisplayTab] = useState(activeTab);

  // Dùng để xác định hướng chuyển tab (lật trang)
  const TABS_ORDER = ["favorites", "following", "suggestions", "history"];
  const currentTabIndex = TABS_ORDER.indexOf(displayTab);
  const newTabIndex = TABS_ORDER.indexOf(activeTab);
  const isForward = newTabIndex > currentTabIndex;

  // Thêm ref để xác định vị trí của các tab và animate indicator
  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Classes cho animation lật trang
  // Sử dụng rotateY và translateX để mô phỏng hiệu ứng lật
  const [animationClass, setAnimationClass] = useState('opacity-100 translate-x-0 rotate-y-0');

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
          const followingResponse = await axios.get(
            `http://localhost:5000/api/User/${getUserId(user)}/followed-users`,
            { headers }
          );
          const isUserFollowing = followingResponse.data.some(
            (follow) => follow.followedUserID === parseInt(id)
          );
          setIsFollowing(isUserFollowing);
        } else {
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
        setFollowings((prev) => prev.filter((usr) => usr.id !== parseInt(id)));
      } else {
        await axios.post(
          `http://localhost:5000/api/User/follow-user?userId=${currentUserId}&followUserId=${id}`,
          {},
          { headers }
        );
        setIsFollowing(true);
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

      const userToFollow = suggestedUsers.find((u) => u.id === suggestedUserId);
      if (userToFollow) {
        setFollowings((prev) => [...prev, userToFollow]);
      }

      setSuggestedUsers((prev) => prev.filter((u) => u.id !== suggestedUserId));

      if (suggestedUsers.length === 1) {
        setNoMoreSuggestions(true);
      }
    } catch (error) {
      console.error("Error following suggested user:", error);
    }
  };

  // Hiệu ứng lật trang khi activeTab thay đổi
  useEffect(() => {
    // Xác định hướng chuyển tab (trái -> phải hay phải -> trái)
    // Nếu isForward = true, di chuyển từ phải sang trái (newTab ở bên phải)
    // Ngược lại di chuyển từ trái sang phải.
    
    // Trước tiên, fade out và xoay nội dung cũ
    const outClass = isForward
      ? "opacity-0 -translate-x-[50%] rotate-y-10"
      : "opacity-0 translate-x-[50%] rotate-y--10";

    const inClass = "opacity-100 translate-x-0 rotate-y-0";

    setAnimationClass(outClass);
    const timeout = setTimeout(() => {
      setDisplayTab(activeTab);
      requestAnimationFrame(() => {
        setAnimationClass(inClass);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeTab, isForward]);

  // Animate indicator di chuyển dưới các tab
  const updateIndicator = (tab) => {
    const button = tabsRef.current[tab];
    if (button) {
      const parent = button.parentElement;
      if (parent) {
        const parentLeft = parent.getBoundingClientRect().left;
        const buttonRect = button.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - parentLeft,
          width: buttonRect.width,
        });
      }
    }
  };

  useEffect(() => {
    // Khi displayTab (tab thực tế hiển thị) thay đổi, cập nhật indicator
    // Cũng có thể cập nhật trực tiếp từ activeTab vì displayTab đổi sau animation
    requestAnimationFrame(() => {
      updateIndicator(activeTab);
    });
    const handleResize = () => {
      updateIndicator(activeTab);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);

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
          <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="pt-10 pb-8 px-8">
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
                <p id="user-name" className="text-2xl font-bold text-gray-900 mb-2">
                  {profileData.username}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
              </div>
              {id && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-lg ${isFollowing
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
              {!id && (
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Update Information
                </button>
              )}
            </div>

            <div className="border-b border-gray-200 relative">
              {/* Indicator động */}
              <div
                className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
              <nav className="flex gap-8 relative">
                {!id && (
                  <button
                    ref={(el) => el && (tabsRef.current.favorites = el)}
                    onClick={() => setActiveTab("favorites")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${activeTab === "favorites"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    Favorite Novels ({favoriteNovels.length})
                  </button>
                )}
                {!id && (
                  <button
                    ref={(el) => el && (tabsRef.current.following = el)}
                    onClick={() => setActiveTab("following")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${activeTab === "following"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <Users className="h-5 w-5" />
                    Followings ({following.length})
                  </button>
                )}
                {!id && (
                  <button
                    ref={(el) => el && (tabsRef.current.suggestions = el)}
                    onClick={() => setActiveTab("suggestions")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${activeTab === "suggestions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <UserPlus className="h-5 w-5" />
                    People You May Know
                  </button>
                )}
                {!id && (
                  <button
                    ref={(el) => el && (tabsRef.current.history = el)}
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${activeTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <HistoryIcon className="h-4 w-4" />
                    Reading History
                  </button>
                )}
              </nav>
            </div>

            {/* Container cho phần nội dung, có perspective để 3D rõ hơn */}
            <div className="pt-6 relative overflow-hidden" style={{ perspective: '1000px' }}>
              {/* Nội dung tab với animation */}
              <div
                className={`transition-all duration-300 ease-in-out transform ${animationClass}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {!id && displayTab === "favorites" && (
                  <FavoriteNovels novels={favoriteNovels} />
                )}
                {!id && displayTab === "following" && (
                  <FollowingList following={following} />
                )}
                {!id && displayTab === "suggestions" && (
                  <SuggestedUsers
                    users={suggestedUsers}
                    onFollow={handleFollowSuggestedUser}
                    loading={loadingSuggestions}
                  />
                )}
                {!id && displayTab === "history" && (
                  <History userId={getUserId(user)} />
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
    </div>
  );
};

export default ProfilePage;
