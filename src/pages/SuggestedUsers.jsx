import React from 'react';
import { FaUserPlus, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SuggestedUsers = ({ users, onFollow, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading suggestions...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaUsers className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => navigate(`/user/${user.id}`)}
          >
            <h3 className="font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow(user.id);
            }}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaUserPlus className="h-4 w-4" />
            <span>Follow</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default SuggestedUsers;
