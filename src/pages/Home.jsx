import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80"
          alt="Library background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/75" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
          Discover Your Next
          <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
            Favorite Novel
          </span>
        </h1>
        <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Immerse yourself in a world of endless stories. From epic fantasies to heartwarming romances,
          find your perfect read today.
        </p>
        <button
          onClick={() => navigate("/novels")}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-300/50"
        >
          View Novels Now
        </button>
        <button
          onClick={() => navigate("/category")}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-300/50 "
          style = {{marginLeft: "20px"}}
        >
          View Categories Now
        </button>
      </div>
    </div>
  );
};

export default Home;
