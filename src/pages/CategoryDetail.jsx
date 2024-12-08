import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const CategoryDetail = () => {
  const { id } = useParams(); // Lấy categoryID từ URL
  const [novels, setNovels] = useState([]);
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchNovelsByCategory = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Novel/getbycategoryid/${id}`);
        setNovels(response.data);
      } catch (err) {
        setError("Unable to fetch novels for this category");
      }
    };
    fetchNovelsByCategory();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!novels.length) return <div>Loading novels...</div>;

  return (
    <div className="category-detail-container">
      <h1>Category Details</h1>
      <div className="novel-box">
        {novels.map((novel) => (
          <div key={novel.novelID} className="novel-item">
            <h3>{novel.name}</h3>
            <p><strong>Author:</strong> {novel.author}</p>
            <p><strong>Description:</strong> {novel.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDetail;
