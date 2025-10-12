import React, { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import { getVideoPresignedUrl } from "@/services/Posts";
import "./style.css"
const PresignedVideoUploader = ({ videoUrl, onUploadComplete, onUploadStart, onUploadError }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(videoUrl || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUploadedUrl(videoUrl || "");
  }, [videoUrl]);

  const handlePresignedUpload = async () => {
    if (!videoFile) return showErrorToast("Please select a video first!");

    try {
      setLoading(true);
      onUploadStart && onUploadStart(); // Notify parent upload started

      // 🔹 Sanitize filename before upload
      const sanitizedFileName = videoFile.name
        .replace(/\s+/g, "_")        // Replace spaces with underscores
        .replace(/[^\w.-]/g, "");    // Remove any unsafe characters

      // 🔹 Create a new File object with cleaned name
      const cleanedFile = new File([videoFile], sanitizedFileName, { type: videoFile.type });

      // 🔹 Request a pre-signed URL using the cleaned file
      const presignedUrl = await getVideoPresignedUrl(cleanedFile);
      if (!presignedUrl) throw new Error("Failed to get pre-signed URL");

      // 🔹 Upload to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: cleanedFile,
        headers: {
          "Content-Type": cleanedFile.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // 🔹 Extract final URL (without query params)
      const finalUrl = presignedUrl.split("?")[0];
      setUploadedUrl(finalUrl);
      onUploadComplete && onUploadComplete(finalUrl);

      showSuccessToast("Video uploaded successfully!");
    } catch (error) {
      console.error("Video upload error:", error);
      onUploadError && onUploadError();
      showErrorToast(error.message || "Something went wrong during upload");
    } finally {
      setLoading(false);
    }
  };


  return (
  <div className="video-upload-container">
      {loading && (
        <div className="upload-overlay">
          <Spinner size={32} />
          <p className="upload-text">Video is uploading...</p>
        </div>
      )}

      <h4 className="upload-heading">🎥 Upload Video</h4>

      {(!videoFile && !uploadedUrl) || uploadedUrl ? (
        <div className="upload-buttons">
          <label className="choose-video-btn">
            Choose Video
            <input
              type="file"
              accept="video/*"
              disabled={loading}
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </label>

          {uploadedUrl && (
            <button
              className="remove-video-btn"
              onClick={() => {
                onUploadComplete(null);
                setVideoFile(null);
                setUploadedUrl("");
              }}
              disabled={loading}
            >
              Remove Video
            </button>
          )}
        </div>
      ) : null}

      {videoFile && !uploadedUrl && (
        <div className="selected-file-section">
          <div className="selected-file-header">
            <p className="selected-file-name">Selected: {videoFile.name}</p>
            <button
              className="upload-btn"
              onClick={handlePresignedUpload}
              disabled={loading}
            >
              {loading ? <Spinner size={6} /> : "Upload"}
            </button>
          </div>
        </div>
      )}

      {uploadedUrl && (
        <div className="video-preview">
          <video
            src={
              uploadedUrl.includes("http")
                ? encodeURI(uploadedUrl)
                : `https://trade-pilot-bucket.s3.eu-north-1.amazonaws.com/${encodeURI(uploadedUrl)}`
            }
            controls
          />
          <p className="video-url">
            <strong>URL:</strong> {uploadedUrl}
          </p>
        </div>
      )}
    </div>
  );
};

export default PresignedVideoUploader;
