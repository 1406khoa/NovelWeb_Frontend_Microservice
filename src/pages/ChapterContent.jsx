import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ChapterContent = () => {
  const { chapterId } = useParams(); // Lấy chapterId từ URL
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Gọi API để lấy nội dung chapter
        const response = await axios.get(
          `http://localhost:5000/api/Chapter/${chapterId}`,
          { headers }
        );
        setChapter(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chapter content:", error);
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [chapterId]);

  if (loading) {
    return <div className="text-center mt-20">Loading chapter...</div>;
  }

  if (!chapter) {
    return <div className="text-center mt-20">Chapter not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 bg-white shadow-lg rounded-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          Back to Novel
        </button>
        <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
        <p className="text-gray-700 leading-relaxed">{chapter.content}</p>
      </div>
    </div>
  );
};

export default ChapterContent;
