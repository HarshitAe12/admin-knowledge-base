import React, { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { useFullPost } from "@/services/useFullPost";
import './article.css';
import { useParams, Link } from "react-router-dom";
import HomeHeader from "@/pages/Home";
import { fetchPostPreview } from "@/services/Posts";
import { FaRegFileAlt } from "react-icons/fa";

const PreviewArticles = () => {
  const { id } = useParams(); 
  const { fullPost, loading } = useFullPost(id);
  const [otherPosts, setOtherPosts] = useState([]);
  const [loadingOther, setLoadingOther] = useState(true);

  // Fetch other articles
  useEffect(() => {
    const loadOtherPosts = async () => {
      try {
        const posts = await fetchPostPreview();
        setOtherPosts(posts?.results ? posts.results.filter(p => p.id !== parseInt(id)) : []);
      } catch (error) {
        console.error("Failed to fetch other posts", error);
      } finally {
        setLoadingOther(false);
      }
    };
    loadOtherPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="preview-spinner-wrapper">
        <Spinner size={50} />
      </div>
    );
  }

  if (!fullPost) {
    return <div className="preview-error">Failed to load post.</div>;
  }

  return (
    <>
      <HomeHeader />
      <div className="preview-page-container">
        {/* Left Panel */}
        <div className="preview-left-panel">
          <h1 className="preview-post-title">{fullPost.title}</h1>

          {/* Categories */}
          {fullPost.categories?.length > 0 && (
            <div className="preview-post-categories">
              {fullPost.categories.map((cat) => (
                <span key={cat.id} className="preview-post-category">{cat.name}</span>
              ))}
            </div>
          )}

          {/* Tags */}
          {fullPost.tags?.length > 0 && (
            <div className="preview-post-tags">
              {fullPost.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`preview-post-tag ${idx % 2 === 0 ? "preview-tag-blue" : "preview-tag-green"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Media */}
          {(fullPost.featured_video || fullPost.featured_image) && (
            <div className="preview-post-media">
              {fullPost.featured_video && (
                <video src={fullPost.featured_video} controls className="preview-media-video" />
              )}
              {fullPost.featured_image && (
                <img src={fullPost.featured_image} alt={fullPost.title} className="preview-media-image" />
              )}
            </div>
          )}

          {/* Post Body */}
          <div
            className="preview-post-body"
            dangerouslySetInnerHTML={{ __html: fullPost.body }}
          />
        </div>

        {/* Right Panel */}
        <div className="preview-right-panel">
          <h2 className="preview-sidebar-title">Other Articles</h2>

          {loadingOther ? (
            <div className="preview-spinner-wrapper-small">
              <Spinner size={30} />
            </div>
          ) : (
            <ul className="preview-other-posts">
              {otherPosts.map((post) => (
                <li key={post.id} className="preview-other-post-item">
                  <Link to={`/posts/${post.id}`} className="preview-other-post-link">
                    <FaRegFileAlt className="preview-article-icon" />
                    <span className="preview-other-post-title">
                      {post.title.length > 50 ? post.title.slice(0, 50) + "..." : post.title}
                    </span>
                  </Link>
                  <div className="preview-other-post-meta">
                    <span className="preview-other-post-cats">
                      {post.categories?.map((c) => c.name).join(", ")}
                    </span>
                    <span className="preview-other-post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
              {otherPosts.length === 0 && <li>No other articles available</li>}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default PreviewArticles;
