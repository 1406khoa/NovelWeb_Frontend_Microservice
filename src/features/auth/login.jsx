import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthForm } from "../../components/AuthForm";
import { BookOpen } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";

export function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignIn) {
      // Đăng nhập
      try {
        const response = await axios.post("http://localhost:5000/api/User/Login", {
          email,
          password,
        });
        const { token, username: userName, email: userEmail, userID } = response.data;
        login(token, { userId: userID, username: userName, email: userEmail });

        setToastMessage("Login successful!");
        setShowToast(true);

        // Điều hướng sau một khoảng thời gian
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        setError("Invalid email or password.");
      }
    } else {
      // Đăng ký
    try {
      // Gọi API lấy danh sách user (hoặc gọi API check email nếu có)
      const response = await axios.get("http://localhost:5000/api/User/GetUsers");
      const users = response.data; // giả sử đây là mảng user
      
      // Kiểm tra email trùng lặp
      const emailExists = users.some((user) => user.email === email.trim());
      if (emailExists) {
        setError("Email already exists. Please choose another one.");
        return; // Dừng lại, không gửi request thêm user
      }

      // Nếu email không tồn tại, proceed tạo tài khoản
      await axios.post("http://localhost:5000/api/User/add-user", {
        username,
        email,
        password,
        role: "User",
      });

      setToastMessage("Sign up successful! Please sign in.");
      setShowToast(true);

      setTimeout(() => {
        setIsSignIn(true);
        setEmail("");
        setPassword("");
        setUsername("");
      }, 2000);

    } catch (err) {
      setError("Failed to sign up. Please check your details and try again.");
    }
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Welcome to NovelVerse</h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
          {/* Tab Navigation */}
          <div className="flex relative">
            <div
              className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
              style={{
                left: isSignIn ? "0%" : "50%",
                width: "50%",
                transform: `translateX(${isSignIn ? '0%' : '0%'})`,
              }}
            />
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-4 text-center transition-all duration-300 ${isSignIn ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-4 text-center ${!isSignIn ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          <div className="p-8 relative">
            <div className="relative perspective-1000">
              <div
                className={`backface-hidden transition-all duration-500 ease-out ${isSignIn
                  ? 'animate-flip-in opacity-100 translate-x-0'
                  : 'animate-flip-out opacity-0 -translate-x-full absolute inset-0'
                  }`}
              >
                <AuthForm
                  type="signin"
                  onSubmit={handleSubmit}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  error={error}
                />
              </div>
              <div
                className={`backface-hidden transition-all duration-500 ease-out ${!isSignIn
                  ? 'animate-flip-in opacity-100 translate-x-0'
                  : 'animate-flip-out opacity-0 translate-x-full absolute inset-0'
                  }`}
              >
                <AuthForm
                  type="signup"
                  onSubmit={handleSubmit}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  username={username}
                  setUsername={setUsername}
                  error={error}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}

export default Login;