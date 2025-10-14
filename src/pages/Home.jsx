import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./home.css";

const HomeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="home-header">
      {/* Logo */}
      <div className="home-logo">
        <a href="/">
        <img
          src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/8gxGtPEVqtv0pHte3WSh/media/68da47adf00445478b6d27e4.png"
          alt="Company Logo"
          />
          </a>
      </div>

      {/* Navigation Buttons */}
      <div className="home-buttons">
        <button
          onClick={() => navigate("/posts")}
          className={`nav-btn ${
            location.pathname === "/posts" ? "active" : ""
          }`}
        >
          All Posts
        </button>

        <button
          onClick={() => navigate("/posts/create")}
          className={`nav-btn ${
            location.pathname === "/posts/create" ? "active" : ""
          }`}
        >
          Add Post
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;
