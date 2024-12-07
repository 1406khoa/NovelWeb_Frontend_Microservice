import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
    // Khôi phục thông tin user từ localStorage khi khởi tạo
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  

  const login = (token, userData) => {
    console.log("Logging in with:", userData);
    localStorage.setItem("token", token); // Lưu token vào localStorage
    localStorage.setItem("user", JSON.stringify(userData)); // Lưu thông tin user vào localStorage
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    localStorage.removeItem("user"); // Xóa thông tin user khỏi localStorage
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    // Tự động khôi phục trạng thái đăng nhập và thông tin user khi load lại trang
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
