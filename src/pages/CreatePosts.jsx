import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IoIosAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { fetchCategories, createPost, getPostById, updatePostById } from "@/services/Posts";
import { showErrorToast, showSuccessToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import HomeHeader from "./Home";
import { useParams } from "react-router-dom";
import "./home.css"
import PresignedVideoUploader from "@/components/PresignedVideoUploader";
const CreatePosts = () => {
  const [videoUploading, setVideoUploading] = useState(false);

  const { id } = useParams()
  const [post, setPost] = useState({
    title: "",
    body: "",
    tags: [],
    categories: [],
    featuredImageFile: null, // uploaded file
    featuredImageUrl: "",     // existing image URL
    featured_video: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  console.log("post data", post)
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  // Fetch post data if updating
  useEffect(() => {
    if (id) {
      setLoading(true);
      getPostById(id)
        .then((data) => {
          let videoKey = "";
          if (data.featured_video) {

            videoKey = data.featured_video.split(".com/")[1].split("?")[0].trim();
          }

          setPost({
            title: data?.title || "",
            body: data?.body || "",
            tags: data?.tags || [],
            categories: data?.categories?.map((c) => c.id) || [],
            featuredImageFile: null,
            featuredImageUrl: data?.featured_image || "",
            featured_video: videoKey,
          });
          setFormKey((prev) => prev + 1);
        })
        .catch(() => showErrorToast("Failed to fetch post data"))
        .finally(() => setLoading(false));
    }
  }, [id]);




  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then((data) => data && setAllCategories(data))
      .catch((error) =>
        showErrorToast(
          error.response?.data?.message || error.message || "Something went wrong!"
        )
      );
  }, []);

  // Tags functions
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !post.tags.includes(trimmed)) {
      setPost((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };
  const handleRemoveTag = (tag) => {
    setPost((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // Categories functions
  const handleToggleCategory = (categoryId) => {
    setPost((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleRemoveCategory = (categoryId) => {
    setAllCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setPost((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  };

  // Publish function
  const handlePublish = async () => {
    if (!post.title || !post.body || post.categories.length === 0) {
      return showErrorToast("Title, content and at least one category are required!");
    }

    try {
      setLoading(true);
      let res;

      if (id) {
        // Update existing post
        res = await updatePostById(id, post);
        showSuccessToast("Post updated successfully!");
      } else {
        // Create new post

        console.log("postdsscs", post)
        res = await createPost(post);
        showSuccessToast("Post created successfully!");
      }

      console.log("Response:", res);

      // Reset form only if creating new post
      if (!id) {
        setResetKey(prev => prev + 1);
        setTagInput("");
        setPost({
          title: "",
          body: "",
          tags: [],
          categories: [],
          featuredImageFile: null,
          featuredImageUrl: "",
          featured_video: ""
        });
      }

    } catch (error) {
      showErrorToast(
        error.response?.data?.message || error.message || "Failed to save post"
      );
    } finally {
      setLoading(false);
    }
  };




  return  (
    <div className="add-post-container">
      <HomeHeader />
      <h3 className="add-post-heading">Add Post</h3>

      {loading ? (
        <Spinner size={40} />
      ) : (
        <div className="add-post-grid" key={formKey}>
          {/* Left Section */}
          <div className="add-post-left">
            {/* Title */}
            <input
              placeholder="Add title"
              value={post?.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="post-title-input"
            />

            {/* Rich Text Editor */}
            <div className="editor-container">
              <ReactQuill
                key={resetKey}
                theme="snow"
                value={post?.body}
                onChange={(body) => setPost({ ...post, body })}
                modules={modules}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "link",
                  "image",
                  "video",
                ]}
                placeholder="Write your post here..."
              />
            </div>

            {/* Featured Image */}
            <div className="featured-image-container">
              {post?.featuredImageFile || post?.featuredImageUrl ? (
                <img
                  src={
                    post.featuredImageFile
                      ? URL.createObjectURL(post.featuredImageFile)
                      : post.featuredImageUrl
                  }
                  alt="Featured"
                  className="featured-image"
                />
              ) : (
                <label htmlFor="featured-upload" className="featured-upload-label">
                  Set Featured Image
                  <input
                    id="featured-upload"
                    type="file"
                    accept="image/*"
                    className="file-input-hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      file &&
                        setPost((prev) => ({
                          ...prev,
                          featuredImageFile: file,
                          featuredImageUrl: "",
                        }));
                    }}
                  />
                </label>
              )}

              {(post.featuredImageFile || post.featuredImageUrl) && (
                <button
                  type="button"
                  onClick={() =>
                    setPost((prev) => ({
                      ...prev,
                      featuredImageFile: null,
                      featuredImageUrl: "",
                    }))
                  }
                  className="remove-image-btn"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Featured Video */}
            <PresignedVideoUploader
              videoUrl={post.featured_video}
              onUploadStart={() => setVideoUploading(true)}
              onUploadComplete={(url) => {
                setPost((prev) => ({
                  ...prev,
                  featured_video: url ? url.split(".com/")[1] : "",
                }));
                setVideoUploading(false);
              }}
              onUploadError={() => setVideoUploading(false)}
            />
          </div>

          {/* Right Section */}
          <div className="add-post-right">
            {/* Publish */}
            <div className="publish-section">
              <h4 className="publish-title">Publish</h4>
              <button
                className={`publish-btn ${
                  loading || videoUploading ? "disabled" : ""
                }`}
                onClick={handlePublish}
                disabled={loading || videoUploading}
              >
                {loading ? <Spinner size={40} /> : id ? "Update Post" : "Publish"}
              </button>
            </div>

            {/* Tags */}
            <div className="tags-section">
              <h4 className="section-title">Tags</h4>
              <div className="tags-input-row">
                <input
                  className="tag-input"
                  value={tagInput}
                  placeholder="Enter tag"
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  className="add-tag-btn"
                  onClick={handleAddTag}
                >
                  <IoIosAdd className="add-icon" /> Add
                </button>
              </div>
              <div className="tags-list">
                {post.tags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    <span className="tag-text">{tag}</span>
                    <IoClose
                      className="remove-tag-icon"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="categories-section">
              <h4 className="section-title">Categories</h4>
              <div className="category-list">
                {allCategories?.map((category) => (
                  <label key={category?.id} className="category-item">
                    <div className="category-checkbox">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={post?.categories.includes(category?.id)}
                        onChange={() => handleToggleCategory(category?.id)}
                      />
                      {category?.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePosts;
