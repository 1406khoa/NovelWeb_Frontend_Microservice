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
  const [comments, setComments] = useState([]); // Thêm state lưu trữ danh sách comment
  const [newComment, setNewComment] = useState(""); // Thêm state cho comment mới

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
        // console.log(mappedNovel);

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
        // console.log(favoriteNovelIds);

        // Lấy danh sách comment
        const commentResponse = await axios.get(
          `http://localhost:5000/api/Comment/${id}`,
          { headers }
        );
        // Ánh xạ dữ liệu comment
        const commentsData = commentResponse.data;
        const mappedComments = commentsData.map((comment) => ({
          commentID: comment.commentID,
          content: comment.content,
          createdDate: comment.createdDate,
          userName: comment.userName || "Anonymous", // Nếu userName không có, gán "Anonymous"
        }));
        setComments(mappedComments);
        console.log("Mapped Comments:", mappedComments);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching novel details:", error);
        setLoading(false);
      }
    };

    fetchNovelDetails();
  }, [id, user.userId]);

  // Hàm thêm comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return; // Không gửi comment rỗng

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Gửi comment mới đến backend, bao gồm tên người dùng
      const payload = {
        novelID: id,
        userID: user.userId,
        userName: user.username,  // Gửi tên người dùng
        content: newComment,
      };

      console.log("Payload:", payload.userName);
      const response = await axios.post(
        `http://localhost:5000/api/Comment`,
        payload,
        { headers }
      );

      // Kiểm tra xem comment từ backend có chứa đúng UserName không
      console.log("Response from backend:", response.data);

      // Cập nhật danh sách comment sau khi gửi thành công
      setComments(prevComments => [response.data, ...prevComments]);  // Đảm bảo không bị overwrite

      setNewComment(""); // Reset input
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  //Ham xoa comment
  const handleDeleteComment = async (commentID) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Gửi yêu cầu xoá comment từ backend
      await axios.delete(`http://localhost:5000/api/Comment/${commentID}`, { headers });

      // Sau khi xoá thành công, cập nhật lại danh sách comment
      setComments(comments.filter(comment => comment.commentID !== commentID));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };


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
    navigate("/novels/"); // Quay lại trang profile
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
        <li key={chapter.chapterID}>
          <button
            onClick={() => navigate(`/chapter/${chapter.chapterID}`)}
            className="text-blue-600 hover:underline"
          >
            Chapter {index + 1}
          </button>
        </li>
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

          {/* Form để gửi comment mới */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Write your comment here..."
            />
            <button
              onClick={handlePostComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Post Comment
            </button>
          </div>

          {/* Danh sách comment */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            {comments && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={`${comment.commentID}-${index}`} className="mb-4 border-b pb-4">
                  <p>
                    <strong>{comment.userName || "Anonymous"}</strong>: {comment.content}
                  </p>
                  <small className="text-gray-500">
                    {new Date(comment.createdDate).toLocaleString()}
                  </small>
                  <button
                    onClick={() => handleDeleteComment(comment.commentID)} // Gọi hàm xoá khi nhấn nút
                    className="text-red-500 mt-2"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetails;
