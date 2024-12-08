// utils.js
export const getUserId = (user) => {
    if (!user) return null;
    console.log(user);
    return user.userId || user.userID || null;
  };
  