import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa"; // Import các icon cần thiết

const NovelDetails = () => {
  const { id } = useParams(); // Lấy id của novel từ URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]); // Trạng thái để lưu chapters
  const [isFavorite, setIsFavorite] = useState(false); // Trạng thái favorite
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  useEffect(() => {
    const fetchNovelDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Lấy chi tiết novel
        const novelResponse = await axios.get(
          `http://localhost:5000/api/Novel/getbyid/${id}`,
          { headers }
        );
        const n = novelResponse.data;
        const mappedNovel = {
          id: n.novelID,
          title: n.name,
          author: n.author,
          description: n.description,
          categoryID: n.categoryID,
        };
        setNovel(mappedNovel);

        // Lấy danh sách chapters cho novel này
        const chaptersResponse = await axios.get(
          `http://localhost:5000/api/Chapter/Novel/${id}`,
          { headers }
        );
        setChapters(chaptersResponse.data); // Lưu danh sách chapters

        // Kiểm tra novel này có trong danh sách favorite không
        const favoriteResponse = await axios.get(
          `http://localhost:5000/api/User/${user.userId}/favorite-novels`,
          { headers }
        );
        const favoriteNovelIds = favoriteResponse.data; // Giả sử trả về mảng ID [3,2,1,...]
        setIsFavorite(favoriteNovelIds.includes(parseInt(id)));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching novel details:", error);
        setLoading(false);
      }
    };

    fetchNovelDetails();
  }, [id, user.userId]);

  // Hàm thêm novel vào danh sách favorite
  const handleAddToFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Gọi API thêm novel vào favorite
      await axios.post(
        `http://localhost:5000/api/User/${user.userId}/favorite-novels/${id}`,
        {},
        { headers }
      );

      // Cập nhật trạng thái favorite
      setIsFavorite(true);
    } catch (error) {
      console.error("Error adding novel to favorites:", error);
    }
  };

  // Hàm xóa novel khỏi danh sách favorite
  const handleRemoveFromFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Gọi API xóa novel khỏi favorite
      await axios.delete(
        `http://localhost:5000/api/User/${user.userId}/favorite-novels/${id}`,
        { headers }
      );

      // Cập nhật trạng thái favorite
      setIsFavorite(false);
    } catch (error) {
      console.error("Error removing novel from favorites:", error);
    }
  };

  // Hàm quay lại trang profile
  const handleBack = () => {
    navigate(-1); // Quay lại trang profile
  };

  if (loading) {
    return <div className="text-center mt-20">Loading novel details...</div>;
  }

  if (!novel) {
    return <div className="text-center mt-20">Novel not found.</div>;
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Nút Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-blue-600 transition-colors"
            title="Go back to your profile"
          >
            <FaArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          {/* Thông tin Novel */}
          <h1 className="text-3xl font-bold mb-4">{novel.title}</h1>
          <p className="text-lg text-gray-700 mb-2">Author: {novel.author}</p>
          <p className="text-gray-600 mb-4">{novel.description}</p>

          {/* List Chapters */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">List of Chapters:</h3>
            <ul className="list-inside pl-5">
              {chapters.length > 0 ? (
                chapters.map((chapter, index) => (
                  <li key={chapter.chapterID}>Chapter {index + 1}: {chapter.title || `Untitled`}</li>
                ))
              ) : (
                <li>No chapters available</li>
              )}
            </ul>
          </div>

          {/* Nút Add/Remove Favorites */}
          {isFavorite ? (
            <button
              onClick={handleRemoveFromFavorites}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <FaHeart /> Remove from Favorites
            </button>
          ) : (
            <button
              onClick={handleAddToFavorites}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <FaRegHeart /> Add to Favorites
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovelDetails;
