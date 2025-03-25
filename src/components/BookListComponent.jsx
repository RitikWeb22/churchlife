import React, { useState, useEffect } from "react";
import { getBooks } from "../services/api";
import BookCard from "../components/BookCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookListComponent = ({ onViewBook, filters = {} }) => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // Show 12 items per page, so on a large screen (lg) you'll see 4 cards per row
  const itemsPerPage = 12;
  // Local state for search input
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      if (Array.isArray(data)) {
        setBooks(data);
      } else if (data && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        console.error("Unexpected books format:", data);
        setBooks([]);
      }
    } catch (error) {
      toast.error("Failed to fetch books");
    }
  };

  // Filter books using the local search query (if provided), then fall back to external filters.
  const filteredBooks = books.filter((book) => {
    // Search filter: local searchQuery takes precedence
    if (searchQuery) {
      if (
        !book.title ||
        !book.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
    } else if (filters.search) {
      if (
        !book.title ||
        !book.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
    }
    // Category filter: Check if book.category exactly matches (case-insensitive)
    if (filters.category) {
      if (
        !book.category ||
        book.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
    }
    // Availability filter: Assuming book.stock determines availability
    if (filters.availability) {
      if (filters.availability === "in-stock" && !(book.stock > 0)) {
        return false;
      }
      if (filters.availability === "out-of-stock" && !(book.stock <= 0)) {
        return false;
      }
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredBooks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Book List
      </h1>

      {/* Search Filter */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search books by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset pagination on new search
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
        />
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentBooks.map((book) => (
          <BookCard key={book._id || book.id} book={book} onView={onViewBook} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 mx-1 rounded transition-colors ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookListComponent;
