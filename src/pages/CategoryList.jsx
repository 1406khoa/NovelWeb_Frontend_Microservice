import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CategoryList.css";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state cho từ khóa tìm kiếm
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/Category/getall`);
        setCategories(response.data);
      } catch (err) {
        setError("Unable to fetch categories");
      }
    };
    fetchCategories();
  }, [BACKEND_URL]);

  // Lọc danh sách categories dựa trên từ khóa tìm kiếm
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (id) => {
    navigate(`/categories/${id}`); // Điều hướng tới trang chi tiết category
  };

  if (error) return <div>Error: {error}</div>;
  if (!categories.length) return <div>Loading categories...</div>;

  return (
    <div className="category-container">
      <div className="header">
        <h1>Category List</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa tìm kiếm
          placeholder="Search categories..."
          className="search-input"
        />
      </div>
      <div className="category-box">
        {filteredCategories.map((category) => (
          <div key={category.categoryID} className="category-item">
            <h3>{category.name}</h3>
            <button onClick={() => handleCategoryClick(category.categoryID)}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
