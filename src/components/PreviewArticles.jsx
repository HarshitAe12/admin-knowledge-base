import React, { useEffect } from "react";
import Spinner from "@/components/Spinner";
import { useFullPost } from "@/services/useFullPost";
import './style.css'
const PreviewArticles = ({ isOpen, onClose, post }) => {
  const { fullPost, loading } = useFullPost(post?.id, isOpen);

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
   <div className="modal-overlay">
  <div className="modal-container">
    <button onClick={onClose} className="modal-close">&times;</button>

    <div className="modal-content">
      {loading ? (
        <div className="spinner-wrapper">
          <Spinner size={40} />
        </div>
      ) : fullPost ? (
        <>
          <h1 className="modal-title">{fullPost.title}</h1>

          {/* Categories */}
          {fullPost.categories?.length > 0 && (
            <div className="modal-categories">
              {fullPost.categories.map((cat) => (
                <span key={cat.id} className="modal-category">
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {fullPost.tags?.length > 0 && (
            <div className="modal-tags">
              {fullPost.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`modal-tag ${idx % 2 === 0 ? "tag-blue" : "tag-green"}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Media Section */}
          {(fullPost.featured_video || fullPost.featured_image) && (
            <div className="modal-media">
              {fullPost.featured_video && (
                <div className={`media-item ${fullPost.featured_image ? "half-width" : ""}`}>
                  <video
                    src={fullPost.featured_video}
                    controls
                    className="media-video"
                  />
                </div>
              )}

              {fullPost.featured_image && (
                <div className={`media-item ${fullPost.featured_video ? "half-width" : ""}`}>
                  <img
                    src={fullPost.featured_image}
                    alt={fullPost.title || "Featured Image"}
                    className="media-image"
                  />
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div
            className="modal-body"
            dangerouslySetInnerHTML={{ __html: fullPost.body }}
          />
        </>
      ) : (
        <div className="modal-error">Failed to load post.</div>
      )}
    </div>
  </div>
</div>

  );
};

export default PreviewArticles;
