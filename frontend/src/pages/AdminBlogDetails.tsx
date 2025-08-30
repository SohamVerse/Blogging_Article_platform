import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlog(res.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
        navigate("/admin/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!blog) return <div className="p-8">Blog not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
      <p className="text-gray-500 mb-4">{blog.subtitle}</p>
      <div className="mb-4">
        <span className="font-semibold">Author:</span> {blog.author?.username}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Status:</span> {blog.status}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Published:</span> {blog.isPublished ? "Yes" : "No"}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Views:</span> {blog.views}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Likes:</span> {blog.likes?.length}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Content:</span>
        <div className="prose mt-2">
          {blog.content?.map((block: any, idx: number) => (
            <div key={idx}>
              {block.type === "text" ? (
                <p>{block.content}</p>
              ) : (
                <img src={block.content} alt={`block-${idx}`} className="my-2" />
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
};

export default AdminBlogDetails;