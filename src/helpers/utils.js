// utils.js
export const getUserId = (user) => {
    if (!user) return null;
    return user.userId || user.userID || null;
  };
  