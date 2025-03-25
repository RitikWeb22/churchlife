import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooksByCategory } from "../services/api";
import BookCard from "../components/BookCard";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Convert the URL parameter to a proper category string,
  // e.g., "morning-revival" becomes "Morning Revival"
  const formatCategory = (cat) => {
    if (!cat) return "";
    return cat
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formattedCategory = formatCategory(category);

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      try {
        const data = await getBooksByCategory(formattedCategory);
        setBooks(data);
      } catch (error) {
        toast.error("Failed to fetch books by category");
        console.error("Error fetching books by category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formattedCategory) {
      fetchBooksByCategory();
    }
  }, [formattedCategory]);

  const handleViewBook = (book) => {
    const bookId = book._id || book.id;
    if (!bookId) {
      console.error("Book id is undefined", book);
      return;
    }
    navigate(`/books/${bookId}`);
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) => {
    if (searchQuery) {
      return (
        book.title &&
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-gray-600">Loading books...</p>
      </div>
    );
  }
  if (!filteredBooks.length)
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          No books found in "{formattedCategory}"
        </h2>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between flex-col lg:flex-row ">
        <h1 className="text-2xl  font-bold mb-6 text-center text-gray-800 dark:text-gray-300">
          {formattedCategory} Books
        </h1>
        {/* Search Input */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search books by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>
      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book._id || book.id}
            book={book}
            onView={handleViewBook}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
