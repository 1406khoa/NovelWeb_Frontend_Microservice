import { useNavigate } from "react-router-dom";

const FollowingList = ({ following }) => {
  const navigate = useNavigate();

  if (following.length === 0) {
    return <p className="text-center text-gray-500">No followings yet</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {following.map((follower) => (
        <div
          key={follower.id}
          className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition"
          onClick={() => navigate(`/user/${follower.id}`)} // Điều hướng tới UserProfilePage
        >
          <h3>{follower.username}</h3>
        </div>
      ))}
    </div>
  );
};

export default FollowingList;
