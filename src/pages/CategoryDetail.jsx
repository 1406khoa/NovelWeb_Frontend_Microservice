import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate

const CategoryDetail = () => {
  const { id } = useParams(); // Lấy categoryID từ URL
  const [novels, setNovels] = useState([]);
  const [chapterCounts, setChapterCounts] = useState({});
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    const fetchNovelsByCategory = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/Novel/getbycategoryid/${id}`
        );
        setNovels(response.data);
      } catch (err) {
        console.error("Error fetching novels:", err);
        setError("Unable to fetch novels for this category");
      }
    };

    const fetchChapterCounts = async () => {
      const counts = {};
      for (const novel of novels) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/Chapter/Novel/${novel.novelID}`
          );
          counts[novel.novelID] = response.data.length; // Lấy số lượng chapters
        } catch (err) {
          console.error(`Error fetching chapters for novel ${novel.novelID}:`, err);
          counts[novel.novelID] = 0;
        }
      }
      setChapterCounts(counts);
    };

    fetchNovelsByCategory();
    if (novels.length) fetchChapterCounts();
  }, [id, novels, BACKEND_URL]);

  if (error) return <div>Error: {error}</div>;
  if (!novels.length) return <div>Loading novels...</div>;

  return (
    <div className="category-detail-container">
      <h1>Category Details</h1>
      <div className="novel-box">
        {novels.map((novel) => (
          <div key={novel.novelID} className="novel-item">
            {novel.imageUrl && (
              <img
                src={novel.imageUrl}
                alt={novel.name}
                style={{
                  width: "300px",
                  height: "350px",
                  marginRight: "15px", // Khoảng cách giữa ảnh và nội dung
                }}
              />
            )}
            <h3>{novel.name}</h3>
            <p>
              <strong>Number of Chapters:</strong>{" "}
              {chapterCounts[novel.novelID] || "Loading..."}
            </p>

            <button
              onClick={() => navigate(`/novels/${novel.novelID}`)} // Điều hướng
              className="view-details-button"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDetail;
