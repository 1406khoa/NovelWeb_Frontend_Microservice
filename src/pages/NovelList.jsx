import React, { useState, useMemo } from "react";
import NovelCard from "../components/NovelCard";
import { novels } from "../data/novels";
import SearchBar from "../components/SearchBar";

const NovelList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter novels based on the search query
  const filteredNovels = useMemo(() => {
    if (!searchQuery.trim()) return novels;

    const query = searchQuery.toLowerCase();
    return novels.filter(
      (novel) =>
        novel.title.toLowerCase().includes(query) ||
        novel.author.toLowerCase().includes(query) ||
        novel.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Discover Novels
          </h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NovelList;
