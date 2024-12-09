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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {readingHistory.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg transition-shadow"
          >
            <Link
              to={`/novel/${item.novelId}`}
              className="text-blue-500 font-bold text-lg hover:underline"
            >
              {item.novelName}
            </Link>
            <p className="text-gray-600">
              Chapter Number: {item.chapterNumber || "N/A"}
            </p>
            <p className="text-gray-600">
              Last Read Date: {new Date(item.lastReadDate).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
