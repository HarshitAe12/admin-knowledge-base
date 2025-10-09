import React, { useEffect } from "react";
import Spinner from "@/components/Spinner";
import { useFullPost } from "@/services/useFullPost";

const PreviewArticles = ({ isOpen, onClose, post }) => {
  const { fullPost, loading } = useFullPost(post?.id, isOpen);

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold z-10"
        >
          &times;
        </button>

        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-[70vh]">
              <Spinner size={10} />
            </div>
          ) : fullPost ? (
            <>
              <h1 className="text-3xl font-bold mb-4">{fullPost.title}</h1>
              {/* Categories */}
              {fullPost.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {fullPost.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1 text-sm font-medium text-white bg-[#ff6f3c] rounded-full shadow-sm"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              {/* Tags */}
              {fullPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {fullPost.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        idx % 2 === 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Video */}
              {fullPost.featured_video && (
                <video src={fullPost.featured_video} controls className="w-full rounded-md mb-6" />
              )}
              {/* Image */}
              {fullPost.featured_image && (
                <img
                  src={fullPost.featured_image}
                  alt={fullPost.title || "Featured Image"}
                  className="w-full rounded-md mb-6"
                />
              )}
              {/* Body */}
              <div
                className="prose max-w-full text-gray-700"
                dangerouslySetInnerHTML={{ __html: fullPost.body }}
              />
            </>
          ) : (
            <div className="text-gray-500 h-[70vh] flex justify-center items-center">
              Failed to load post.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewArticles;
