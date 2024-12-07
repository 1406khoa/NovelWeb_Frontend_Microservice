import React from "react";
import { Link } from "react-router-dom";

const FavoriteNovels = ({ novels }) => {
  if (!novels || novels.length === 0 ) {
    return <div className="text-center text-gray-500">No favorite novels yet</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {novels.map((novel) => (
        <div key={novel.id} className="p-4 bg-white rounded-lg shadow-sm">
          {/* Title clickable */}
          <Link
            to={`/novel/${novel.id}`}
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            {novel.title}
          </Link>
          <p className="text-sm text-gray-600">By: {novel.author}</p>
        </div>
      ))}
    </div>
  );
};

export default FavoriteNovels;
