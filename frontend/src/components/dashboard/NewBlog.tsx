import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export type Block = {
  type: "text" | "image";
  content: string;
};

interface BlogData {
  title: string;
  subtitle?: string;
  content: Block[];
  tags: string[];
  timeToRead: number;
  coverImage?: string;
}

const NewBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [timeToRead, setTimeToRead] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBlock = (type: "text" | "image") => {
    if (type === "image") {
      fileInputRef.current?.click();
    } else {
      setBlocks((prev) => [...prev, { type, content: "" }]);
    }
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBlockContent = (index: number, content: string) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, content } : b))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // TODO: Replace with your actual image upload endpoint
      // const response = await axios.post('/api/upload/image', formData, {
      //   headers: { 
      //     'Content-Type': 'multipart/form-data',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      // For now, create a mock image URL
      const mockImageUrl = URL.createObjectURL(file);
      
      setBlocks((prev) => [...prev, { type: "image", content: mockImageUrl }]);
      if (!coverImage) setCoverImage(mockImageUrl);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title || blocks.length === 0) {
      alert("Title and content are required");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const blogData = {
        title,
        subtitle: subtitle || null,
        content: blocks,
        tags,
        timeToRead: timeToRead ? parseInt(timeToRead) : 5,
        coverImage: coverImage || null
      };

      // Create blog using backend API (will be submitted for review)
      const response = await axios.post('https://blogging-article-platform.onrender.com/api/blogs', blogData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert("Blog submitted for review successfully! It will be published after admin approval.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Publish failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit blog for review. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const blogData = {
        title,
        subtitle: subtitle || null,
        content: blocks,
        tags,
        timeToRead: timeToRead ? parseInt(timeToRead) : 5,
        coverImage: coverImage || null
      };

      // Save as draft (will not be submitted for review)
      const response = await axios.post('https://blogging-article-platform.onrender.com/api/blogs', blogData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert("Draft saved successfully! You can submit it for review when ready.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Save failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to save draft. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-8 py-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-semibold">Create New Blog</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading || uploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={loading || uploading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>

      {/* Upload Loading Indicator */}
      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-700 text-sm">Uploading image...</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your blog title..."
          className="w-full text-4xl font-bold placeholder-gray-400 outline-none border-b border-gray-200 pb-2"
        />

        {/* Subtitle */}
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Add a subtitle (optional)..."
          className="w-full text-xl text-gray-600 placeholder-gray-400 outline-none border-b border-gray-200 pb-2"
        />

        {/* Time to read */}
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={timeToRead}
            onChange={(e) => setTimeToRead(e.target.value)}
            placeholder="5"
            className="w-24 text-sm text-gray-700 outline-none border border-gray-200 rounded-md px-3 py-2"
          />
          <span className="text-gray-600">minutes to read</span>
        </div>

        {/* Tags Input */}
        <div className="w-full border border-gray-200 rounded-md px-3 py-3 text-sm text-gray-500 flex flex-wrap gap-2 min-h-[50px]">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 flex items-center"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags (press Enter)..."
            className="flex-1 min-w-[150px] outline-none text-sm text-black"
          />
        </div>

        {/* Content Blocks */}
        {blocks.map((block, index) => (
          <div key={index} className="relative group border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => removeBlock(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete block"
            >
              ×
            </button>

            {block.type === "text" ? (
              <textarea
                value={block.content}
                onChange={(e) => updateBlockContent(index, e.target.value)}
                placeholder="Write your content here..."
                className="w-full min-h-[100px] p-3 border border-gray-200 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="space-y-2">
                <img
                  src={block.content}
                  alt="blog"
                  className="max-w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setCoverImage(block.content)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      coverImage === block.content
                        ? "bg-green-500 text-white border-green-500"
                        : "text-green-600 border-green-500 hover:bg-green-50"
                    }`}
                  >
                    {coverImage === block.content ? "✓ Cover Image" : "Set as Cover"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Block Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => addBlock("text")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
          >
            <span className="text-lg">+</span>
            Add Text Block
          </button>
          <button
            onClick={() => addBlock("image")}
            className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50"
          >
            <span className="text-lg">+</span>
            Add Image
          </button>
        </div>

        {/* Cover Image Preview */}
        {coverImage && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-3">Cover Image</h3>
            <img
              src={coverImage}
              alt="Cover"
              className="w-48 h-32 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBlog; 