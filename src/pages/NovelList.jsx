import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/NovelList.css";

const NovelList = () => {
  const [novels, setNovels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chapterCounts, setChapterCounts] = useState({});
  const [error, setError] = useState(null);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Category/getall`);
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Unable to fetch categories");
      }
    };

    const fetchNovels = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Novel/getall`);
        setNovels(response.data);
      } catch (err) {
        console.error("Error fetching novels:", err);
        setError("Unable to fetch novels");
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

    fetchCategories();
    fetchNovels();
    if (novels.length) fetchChapterCounts();
  }, [novels]);

  const getCategoryName = (categoryID) => {
    const category = categories.find((cat) => cat.categoryID === categoryID);
    return category ? category.name : "Unknown";
  };

  if (error) return <div>Error: {error}</div>;
  if (!novels.length || !categories.length) return <div>Loading...</div>;

  return (
    <div className="novel-container">
      <h1>Novel List</h1>
      <div className="novel-box">
        {novels.map((novel) => (
          <div key={novel.novelID} className="novel-item">
            <h3>{novel.name}</h3>
            <p><strong>Category:</strong> {getCategoryName(novel.categoryID)}</p>
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

export default NovelList;
