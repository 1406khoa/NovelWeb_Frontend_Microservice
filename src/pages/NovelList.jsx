import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/NovelList.css";
const NovelList = () => {
  const [novels, setNovels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Lấy danh sách thể loại từ API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Category/getall`);
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Unable to fetch categories");
      }
    };

    // Lấy danh sách tiểu thuyết từ API
    const fetchNovels = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Novel/getall`);
        setNovels(response.data);
      } catch (err) {
        console.error("Error fetching novels:", err);
        setError("Unable to fetch novels");
      }
    };

    fetchCategories();
    fetchNovels();
  }, []);

  // Tìm tên thể loại từ categoryID
  const getCategoryName = (categoryID) => {
    const category = categories.find((cat) => cat.categoryID === categoryID);
    return category ? category.name : "Unknown"; // Nếu không tìm thấy, trả về "Unknown"
  };

  if (error) return <div>Error: {error}</div>;
  if (!novels.length || !categories.length) return <div>Loading...</div>;

  return (
    <div className="novel-container">
      <h1 >Novel List</h1>
      <div className="novel-box">
      {novels.map((novel) => (
        <div key={novel.novelID} className="novel-item">
          <h3>{novel.name}</h3>
          <p><strong>Author:</strong> {novel.author}</p>
          <p><strong>Category:</strong> {getCategoryName(novel.categoryID)}</p> {/* Hiển thị thể loại */}
          <p><strong>Description:</strong> {novel.description}</p>
        </div>
      ))}
      </div>
      
    </div>
  );
};

export default NovelList;
