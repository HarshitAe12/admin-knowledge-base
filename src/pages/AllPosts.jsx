import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { fetchCategories, fetchPostPreview, fetchPostsByFilter } from "@/services/Posts";
import { showErrorToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import HomeHeader from "./Home";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import "./home.css"
import CustomCardUi from "@/components/CustomCardUi";
const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPosts, setTotalPosts] = useState(0);
console.log("postsas",posts)
  const loadPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await fetchPostPreview(pageNum, pageSize);
      setPosts(Array.isArray(data.results) ? data.results : []);
      setTotalPosts(data.count || 0);
    } catch (error) {
      showErrorToast(error.response?.data?.message || error.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };


  // Initial load
  useEffect(() => {
    loadPosts(page);
  }, [page]);

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Failed to fetch categories:", error));
  }, []);

  // Remove deleted post from state
  const handleDelete = (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId));

  const handleApply = async () => {
    setLoading(true);
    try {
      let data;

      // If user typed something OR selected a category → fetch all matching posts
      if (searchText || selectedCategory) {
        data = await fetchPostsByFilter({
          search: searchText,
          category: selectedCategory?.id,
          tags: searchText ? [searchText] : [],
          // Do NOT pass page or page_size → fetch all
        });

        const results = Array.isArray(data) ? data : data.results;
        setPosts(results || []);
        setTotalPosts(results?.length || 0);
      } else {
        // Normal mode → paginated posts
        setPage(1); // reset page
        data = await fetchPostPreview(1, pageSize);
        setPosts(Array.isArray(data.results) ? data.results : []);
        setTotalPosts(data.count || 0);
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || error.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };



  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <div className="posts-container">
      <HomeHeader />
      <h3 className="posts-heading">All Posts ({totalPosts})</h3>

      {/* Filter Header */}
      <div className="filter-header">
        <div className="search-box">
          <input
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title or tags"
          />
          <IoSearchSharp className="search-icon" />
        </div>

<div className="category-select">
  <select
    value={selectedCategory ? selectedCategory.id.toString() : ""}
    onChange={(e) =>
      setSelectedCategory(
        categories.find((c) => c.id.toString() === e.target.value) || null
      )
    }
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id.toString()}>
        {cat.name}
      </option>
    ))}
  </select>
</div>


        <button className="apply-btn" onClick={handleApply}>
          Apply
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <Spinner size={40} />
      ) : (
        <CustomCardUi posts={posts} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {!(searchText || selectedCategory) && totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="pagination-btn"
          >
            <IoChevronBack size={18} /> Previous
          </button>

          <span className="pagination-info">
            Page <span className="page-number">{page}</span> of{" "}
            <span className="page-number">{totalPages}</span>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="pagination-btn"
          >
            Next <IoChevronForward size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllPosts;
