import React, { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { IoIosEye } from "react-icons/io";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { deletePost } from "@/services/Posts";
import { showSuccessToast, showErrorToast } from "@/components/Toast";
import PreviewArticles from "./PreviewArticles";
import PlaceholderImage from "@/assets/images.png";
import "./style.css"; 

const CustomCardUi = ({ posts = [], onDelete }) => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);

  const openPreview = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

const handleDownloadVideo = (videoUrl, title) => {
  try {
    // Create a temporary <a> tag
    const a = document.createElement("a");
    a.href = videoUrl;

    // This line *requests* a direct download (same as “Save video as…”)
    // Works only if the video URL is from the same origin or has proper CORS headers
    a.setAttribute("download", title ? `${title.replace(/\s+/g, "_")}.mp4` : "video.mp4");

    // Optional: open directly in new tab if browser ignores "download"
    a.target = "_blank";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showSuccessToast("Video download started!");
  } catch (error) {
    console.error("Error downloading video:", error);
    showErrorToast("Failed to download video");
  }
};



  // const handleDownloadVideo = async (videoUrl, title) => {
  //   try {
  //     showSuccessToast("Video download started! Please check your downloads.");

  //     const response = await fetch(videoUrl, { mode: "cors" });
  //     if (!response.ok) {
  //       showErrorToast("Failed to fetch video");
  //       return;
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = title ? `${title.replace(/\s+/g, "_")}.mp4` : "featured_video.mp4";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     showErrorToast("Failed to download video. Please check if the file is accessible.");
  //   }
  // };

  if (!posts.length) {
    return <p className="no-posts">No posts found.</p>;
  }

  return (
    <div className="card-grid">
      {posts.map((post) => {
        const categories = Array.isArray(post.categories) ? post.categories : [];
        const tags = Array.isArray(post.tags) ? post.tags : [];

        return (
          <div className="custom-card">
      {/* Featured Media */}
      {post.featured_image ? (
        <img src={post.featured_image} alt={post.title || "Post Image"} style={{objectFit:"fill"}} className="card-media" />
      ) : post.featured_video ? (
        <video
          src={post.featured_video}
          alt={post.title || "Post Video"}
          className="card-media"
          controls
        />
      ) : (
        <img src={PlaceholderImage} alt="No Featured Assets" className="card-media" />
      )}
   

           {/* {
              post.featured_video ? (
        <video
          src={post.featured_video}
          alt={post.title || "Post Video"}
          className="card-media"
          controls
        />
      )  : post.featured_image ? (
        <img src={post.featured_image} alt={post.title || "Post Image"} className="card-media" />
      ) : (
        <img src={PlaceholderImage} alt="No Featured Assets" className="card-media" />
      )} */}

      {/* Card Content */}
      <div className="card-content">
        {/* Meta */}
        <div className="card-meta">
          <div className="categories">
            {categories.slice(0, 1).map((cat) => (
              <span key={cat.id} className="category" style={{fontSize:"10px"}}>
                {cat.name}
              </span>
            ))}
            {categories.length > 1 && (
              <span className="more-count">+{categories.length - 1}</span>
            )}
          </div>

          <div className="post-date">
            {new Date(post?.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Title */}
      <h3 className="post-title">
  {(post.title && post.title.length > 30)
    ? post.title.slice(0, 30) + "..."
    : post.title || "Untitled Post"}
</h3>


        {/* Tags */}
       <div className="tags">
  {tags.slice(0, 2).map((tag, i) => (
    <span key={i} style={{fontSize:"12px"}} className={`tag ${i % 2 === 0 ? "tag-blue" : "tag-green"}`}>
      {tag}
    </span>
  ))}
  {tags.length > 2 && <span className="tag tag-gray">+{tags.length - 2}</span>}
</div>

      </div>

      {/* Actions */}
      <div className="card-actions">
        <button onClick={() => navigate(`/posts/${post?.id}`)} className="icon-btn" title="Preview Post">
          <IoIosEye size={22} />
        </button>

        {post.featured_video && (
          <button
            onClick={() => handleDownloadVideo(post.featured_video, post.title)}
            className="icon-btn"
            title="Download Featured Video"
          >
            <FaDownload size={18} />
          </button>
        )}

        <button
          className="icon-btn"
          title="Edit Post"
          onClick={() => navigate(`/posts/update/${post.id}`)}
        >
          <FiEdit size={20} />
        </button>

        <button
          className="icon-btn delete"
          title="Delete Post"
          onClick={async () => {
            try {
              await deletePost(post.id);
              onDelete(post.id);
              showSuccessToast("Post deleted successfully!");
            } catch (err) {
              console.error(err);
              showErrorToast("Failed to delete post");
            }
          }}
        >
          <FiTrash2 size={20} />
        </button>
      </div>
     
    </div>
        );
      })}
    </div>
  );
};

export default CustomCardUi;
