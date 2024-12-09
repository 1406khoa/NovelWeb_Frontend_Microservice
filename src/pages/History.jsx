import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const History = ({ userId }) => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm lấy thông tin Novel và Chapter
  const fetchNovelAndChapterDetails = async (history) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const updatedHistory = await Promise.all(
        history.map(async (item) => {
          // Lấy thông tin Novel
          const novelResponse = await axios.get(
            `http://localhost:5000/api/Novel/getbyid/${item.NovelID}`,
            { headers }
          );
          const novel = novelResponse.data;

          // Lấy thông tin Chapter (nếu ChapterID tồn tại)
          let chapterNumber = null;
          if (item.ChapterID) {
            const chapterResponse = await axios.get(
              `http://localhost:5000/api/Chapter/${item.ChapterID}`,
              { headers }
            );
            chapterNumber = chapterResponse.data.chapterNumber;
          }

          return {
            ...item,
            novelName: novel.name,
            chapterNumber,
            novelId: novel.novelID,
            author: novel.author,
          };
        })
      );

      setReadingHistory(updatedHistory);
    } catch (err) {
      console.error("Error fetching novel or chapter details:", err);
      setError("Failed to fetch novel or chapter details.");
    }
  };

  // Lấy lịch sử đọc
  useEffect(() => {
    const fetchReadingHistory = async () => {
      if (!userId) {
        setError("User ID is required to fetch reading history.");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          `http://localhost:5000/api/History/${userId}`,
          { headers }
        );

        await fetchNovelAndChapterDetails(response.data);
      } catch (err) {
        setError("Failed to fetch reading history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadingHistory();
  }, [userId]);

  if (loading) {
    return <div>Loading reading history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (readingHistory.length === 0) {
    return <div>No reading history available.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Reading History</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {readingHistory.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm">
            {/* Title clickable */}
            <Link
              to={`/novels/${item.novelId}`}
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {item.novelName}
            </Link>
            <p className="text-sm text-gray-600">By: {item.author}</p>
            <p className="text-sm text-gray-600">
              Chapter: {item.chapterNumber || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              Last Read: {new Date(item.lastReadDate).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
