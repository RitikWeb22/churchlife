import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LibraryPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only Library books from the API.
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/books?category=Library`)
      .then((response) => response.json())
      .then((data) => {
        // Ensure we only use books with category "Library"
        const libraryBooks = data.filter(
          (book) => book.category && book.category.toLowerCase() === "library"
        );
        setBooks(libraryBooks);
      })
      .catch((error) => console.error("Error fetching books:", error));
  }, []);

  // Array of alphabets A to Z.
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Filter books: If searchQuery is present, filter using that; otherwise, filter by selected letter.
  const filteredBooks = books.filter((book) => {
    const title = book.title || "";
    if (searchQuery) {
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return title[0] && title[0].toUpperCase() === selectedLetter;
  });

  // Navigate to book details when a book title is clicked.
  const handleViewBook = (book) => {
    const bookId = book._id || book.id;
    if (!bookId) return;
    navigate(`/books/${bookId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-4xl py-3 font-semibold text-center text-gray-800 dark:text-gray-100">
          Library Books
        </h2>
        {/* Search Input */}
        <div className="flex justify-center w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Optionally reset letter filter when search is active
              if (e.target.value) {
                setSelectedLetter("");
              } else {
                setSelectedLetter("A");
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Alphabet Filter - only show when no search query */}
      {!searchQuery && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {alphabets.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1 border rounded transition-colors ${
                selectedLetter === letter
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-200 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Books List */}
      <div className="w-full max-w-2xl mx-auto">
        {filteredBooks.length > 0 ? (
          <ul className="space-y-2">
            {filteredBooks.map((book) => (
              <li key={book._id} className="border-b pb-2">
                <button
                  onClick={() => handleViewBook(book)}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-left w-full"
                >
                  {book.title}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No books found{" "}
            {searchQuery
              ? `matching "${searchQuery}"`
              : `for letter ${selectedLetter}`}
            .
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default LibraryPage;
