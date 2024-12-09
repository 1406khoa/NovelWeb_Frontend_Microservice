import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa"; // Import các icon cần thiết
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Trash } from 'lucide-react';

const NovelDetails = () => {
  const { id } = useParams(); // Lấy id của novel từ URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Lấy thông tin đăng nhập từ AuthContext
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
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

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
        setChapters(chaptersResponse.data);

        // Kiểm tra novel này có trong danh sách favorite không (chỉ nếu đã đăng nhập)
        if (user) {
          const favoriteResponse = await axios.get(
            `http://localhost:5000/api/User/${user.userId}/favorite-novels`,
            { headers }
          );
          const favoriteNovelIds = favoriteResponse.data;
          setIsFavorite(favoriteNovelIds.includes(parseInt(id)));
        }

        // Lấy danh sách comment
        const commentResponse = await axios.get(
          `http://localhost:5000/api/Comment/${id}`,
          { headers }
        );
        console.log("Comment Response:", commentResponse.data); // Kiểm tra dữ liệu nhận về từ API
        const commentsData = commentResponse.data;
        const mappedComments = commentsData.map((comment) => ({
          commentID: comment.commentID,
          content: comment.content,
          createdDate: comment.createdDate,
          userName: comment.userName || "Anonymous",
          userId: comment.userID, // Kiểm tra có trường này hay không
        }));
        setComments(mappedComments);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching novel details:", error);
        setLoading(false);
      }
    };

    fetchNovelDetails();
  }, [id, user]);

  // Hàm thêm comment
  const handlePostComment = async () => {
    if (!user) {
      alert("You need to log in to post a comment.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        novelID: id,
        userID: user.userId, // Sử dụng userID từ thông tin đăng nhập của user
        userName: user.username,
        content: newComment,
      };

      const response = await axios.post(
        `http://localhost:5000/api/Comment`,
        payload,
        { headers }
      );

      console.log("Response from posting comment:", response); // Kiểm tra dữ liệu trả về

      // Sau khi post thành công, thêm bình luận vào danh sách và đảm bảo có "Delete" cho comment vừa mới thêm
      setComments((prevComments) => [
        ...prevComments, // Giữ nguyên các comment cũ
        {
          ...response.data,
          userId: response.data.userID, // Đảm bảo userId là chính xác
        },
      ]);      
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };



  // Hàm xóa comment
  const handleDeleteComment = async (commentID) => {
    console.log("Deleting comment with ID:", commentID);

    // Kiểm tra nếu commentID hợp lệ
    if (commentID === undefined || commentID === null || commentID <= 0) {
      console.error("Invalid comment ID:", commentID);
      return; // Dừng thực hiện nếu commentID không hợp lệ
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`http://localhost:5000/api/Comment/${commentID}`, { headers });

      if (response.status === 204) {
        setComments((prevComments) => {
          const updatedComments = prevComments.filter((comment) => comment.commentID !== commentID);
          console.log("Updated comments after delete:", updatedComments);
          return updatedComments;
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };




  // Hàm thêm novel vào danh sách favorite
  const handleAddToFavorites = async () => {
    if (!user) {
      alert("You need to log in to add to favorites.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `http://localhost:5000/api/User/${user.userId}/favorite-novels/${id}`,
        {},
        { headers }
      );

      setIsFavorite(true);
    } catch (error) {
      console.error("Error adding novel to favorites:", error);
    }
  };

  // Hàm xóa novel khỏi danh sách favorite
  const handleRemoveFromFavorites = async () => {
    if (!user) {
      alert("You need to log in to remove from favorites.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `http://localhost:5000/api/User/${user.userId}/favorite-novels/${id}`,
        { headers }
      );

      setIsFavorite(false);
    } catch (error) {
      console.error("Error removing novel from favorites:", error);
    }
  };

  // Hàm quay lại trang profile
  const handleBack = () => {
    navigate(-1);
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
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-blue-600 transition-colors"
            title="Go back to your profile"
          >
            <FaArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <h1 className="text-3xl font-bold mb-4">{novel.title}</h1>
          <p className="text-lg text-gray-700 mb-2">Author: {novel.author}</p>
          <p className="text-gray-600 mb-4">{novel.description}</p>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">List of Chapters:</h3>
            <ul className="list-inside pl-5">
              {chapters.length > 0 ? (
                chapters.map((chapter, index) => (
                  <li key={chapter.chapterID}>
                    <button
                      onClick={async () => {
                        if (user) {
                          try {
                            const token = localStorage.getItem("token");
                            const headers = { Authorization: `Bearer ${token}` };

                            // Payload để gửi đến API History
                            const payload = {
                              userID: user.userId,
                              NovelID: parseInt(id),
                              ChapterID: chapter.chapterID,
                            };

                            // Gửi yêu cầu POST để lưu lịch sử
                            await axios.post(
                              "http://localhost:5000/api/History",
                              payload,
                              { headers }
                            );

                            // Chuyển hướng đến trang chi tiết chapter
                            navigate(`/chapter/${chapter.chapterID}`);
                          } catch (error) {
                            console.error("Failed to save history:", error);
                            alert("Error saving history. Please try again.");
                          }
                        } else {
                          alert("You need to log in to view this chapter.");
                        }
                      }}
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


<div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Comments</h2>
  {comments && comments.length > 0 ? (
    comments.map((comment, index) => (  // Sử dụng slice để không thay đổi mảng gốc
      <div key={`${comment.commentID}-${index}`} className="mb-4 border-b pb-4">
        <p>
          <strong>{comment.userName || "Anonymous"}</strong>:{" "}
          {comment.content}
        </p>
        <small className="text-gray-500">
          {new Date(comment.createdDate).toLocaleString()}
        </small>

        {/* Debugging: log thông tin user và comment */}
        {console.log("User ID:", user?.userId, "Comment User ID:", comment.userId)}
        {console.log("Comment ID:", comment.commentID)} {/* Log commentID ở đây */}

        {/* Chỉ hiển thị nút "Delete" nếu người dùng hiện tại là chủ sở hữu của bình luận */}
        {user?.userId === comment.userId && (
          <button
            onClick={() => handleDeleteComment(comment.commentID)}
            className="text-red-500 mt-2 h-3 w-3"
          >
           <Trash />
          </button>
        )}
      </div>

              ))

            ) : (
              <p>No comments yet.</p>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetails;
