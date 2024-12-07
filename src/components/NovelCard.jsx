import React from "react";

const NovelCard = ({ novel }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64">
        <img
          src={novel.cover}
          alt={novel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{novel.title}</h3>
        <p className="text-sm text-gray-600 mb-4">by {novel.author}</p>
        <p className="text-gray-700 mb-4 line-clamp-2">{novel.description}</p>
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200">
          Read Now
        </button>
      </div>
    </div>
  );
};

export default NovelCard;
