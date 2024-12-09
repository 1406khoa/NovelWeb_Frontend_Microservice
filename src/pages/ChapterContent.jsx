import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ChapterContent = () => {
  const { chapterId } = useParams(); // Lấy chapterId từ URL
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novelID, setNovelId] = useState(null); // ID của tiểu thuyết
  const [chapterList, setChapterList] = useState([]); // Danh sách các chương

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Lấy nội dung chương hiện tại
        const chapterResponse = await axios.get(
          `http://localhost:5000/api/Chapter/${chapterId}`,
          { headers }
        );
        setChapter(chapterResponse.data);
        setNovelId(chapterResponse.data.novelID);

        // Lấy danh sách tất cả các chương của tiểu thuyết
        const chaptersResponse = await axios.get(
          `http://localhost:5000/api/Chapter/Novel/${chapterResponse.data.novelID}`,
          { headers }
        );
        setChapterList(chaptersResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching chapter content:", error);
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [chapterId]);

  const navigateToChapter = (targetChapterId) => {
    navigate(`/chapter/${targetChapterId}`);
  };

  if (loading) {
    return <div className="text-center mt-20">Loading chapter...</div>;
  }

  if (!chapter) {
    return <div className="text-center mt-20">Chapter not found.</div>;
  }

  // Tìm chương trước và sau
  const currentIndex = chapterList.findIndex((c) => c.chapterID === parseInt(chapterId));
  const previousChapter = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 bg-white shadow-lg rounded-lg p-8">
        <button
          onClick={() => navigate(`/novels/${novelID}`)}
          className="text-blue-600 hover:underline mb-4"
        >
          Back to Novel
        </button>
        <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
        <p className="text-gray-700 leading-relaxed mb-6">{chapter.content}</p>

        {/* Điều hướng chương */}
        <div className="flex justify-between items-center mt-6">
          {previousChapter ? (
            <button
              onClick={() => navigateToChapter(previousChapter.chapterID)}
              className="text-blue-500 hover:underline"
            >
              Previous Chapter
            </button>
          ) : (
            <span className="text-gray-400">No Previous Chapter</span>
          )}

          <span className="text-gray-700 font-semibold">
             Chapter: {currentIndex + 1}
          </span>

          {nextChapter ? (
            <button
              onClick={() => navigateToChapter(nextChapter.chapterID)}
              className="text-blue-500 hover:underline"
            >
              Next Chapter
            </button>
          ) : (
            <span className="text-gray-400">No Next Chapter</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;
