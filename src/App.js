import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import NovelList from "./pages/NovelList";
import Login from "./features/auth/login";
import Comment from "./pages/Comment";
import History from "./pages/History";
import FavoriteNovels from "./pages/FavoriteNovels";
import FollowingList from "./pages/FollowingList";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import NovelDetails from "./pages/NovelDetails"; // Import NovelDetails
import CategoryList from "./pages/CategoryList"; // Đảm bảo import đúng đường dẫn
import CategoryDetail from "./pages/CategoryDetail"; // Import CategoryDetail
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novels" element={<NovelList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/category" element={<CategoryList />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route
            path="/novels/:id"
            element={<NovelDetails />}/>
          <Route
            path="/comment"
            element={
              <ProtectedRoute>
                <Comment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorite-novels"
            element={
              <ProtectedRoute>
                <FavoriteNovels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/follower-list"
            element={
              <ProtectedRoute>
                <FollowingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/:id" // Route mới cho user khác
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <UpdateProfilePage />
              </ProtectedRoute>
            }
          />

          
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
