import { useState, useEffect, useCallback, useRef } from "react";
import { getPostById } from "@/services/Posts";

export const useFullPost = (postId, isOpen) => {
  const [fullPost, setFullPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef({}); 

  const fetchPost = useCallback(async () => {
    if (!postId ) return;

   
    if (cache.current[postId]) {
      setFullPost(cache.current[postId]);
      return;
    }

    setLoading(true);
    try {
      const data = await getPostById(postId);
      setFullPost(data);
      cache.current[postId] = data; 
    } catch (err) {
      console.error("Failed to fetch full post:", err);
      setFullPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, isOpen]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { fullPost, loading };
};
