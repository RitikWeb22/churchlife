import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileImport,
  FaSearch,
  FaLayerGroup,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  addCategory,
  removeCategory,
  importBooks,
} from "../services/api";
import * as XLSX from "xlsx";
import EditModal from "../components/EditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states for add/edit and delete
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Form states for book add/edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImages, setFormImages] = useState([]);

  // Ref for file input (Excel import)
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // Fetch books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      if (Array.isArray(data)) {
        setBooks(data);
      } else if (data?.books && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Fetch books error:", error);
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const cats = data.map((cat) => cat.name?.trim() || cat);
      setCategories(cats);
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addCategory(newCategory.trim());
      toast.success("Category added successfully!");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Add category error:", error);
      toast.error("Failed to add category");
    }
  };

  const handleRemoveCategory = async (categoryName) => {
    if (!window.confirm(`Remove category "${categoryName}"?`)) return;
    try {
      await removeCategory(categoryName);
      toast.success(`Category "${categoryName}" removed!`);
      fetchCategories();
    } catch (error) {
      console.error("Remove category error:", error);
      toast.error("Failed to remove category");
    }
  };

  const openModal = (book = null) => {
    setModalData(book);
    if (book) {
      setFormTitle(book.title);
      setFormDescription(book.description || "");
      setFormPrice(book.price);
      setFormStock(book.stock);
      setFormCategory(book.category);
      setFormImages([]);
    } else {
      setFormTitle("");
      setFormDescription("");
      setFormPrice("");
      setFormStock("");
      setFormCategory("");
      setFormImages([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleAddOrEditBook = async () => {
    const bookData = {
      title: formTitle,
      description: formDescription,
      price: Number(formPrice),
      stock: Number(formStock),
      category: formCategory,
    };

    try {
      if (modalData) {
        console.log("Updating book:", modalData._id, bookData);
        await updateBook(modalData._id, bookData, formImages);
        toast.success("Book updated successfully!");
      } else {
        console.log("Creating book:", bookData);
        await createBook(bookData, formImages);
        toast.success("Book added successfully!");
      }
      fetchBooks();
      closeModal();
    } catch (error) {
      console.error("Add/Edit book error:", error);
      toast.error("Failed to add/update book");
    }
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      console.log("Deleting book:", bookToDelete._id || bookToDelete.id);
      await deleteBook(bookToDelete._id || bookToDelete.id);
      toast.success("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Delete book error:", error);
      toast.error("Failed to delete book");
    }
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const handleImportBooks = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let jsonData = XLSX.utils.sheet_to_json(worksheet);
      jsonData = jsonData.map((item) => ({
        title: item.title || "Unknown Title",
        author: item.author || "Unknown Author",
        isbn: item.isbn || "N/A",
        description: item.description || "No description available",
        stock: item.stock || 0,
        price: item.price || 0,
        category: (item.category || "Uncategorized").trim(),
      }));
      await importBooks(jsonData);
      toast.success("Books imported successfully!");
      fetchBooks();
      fetchCategories();
    } catch (error) {
      console.error("File import error:", error);
      toast.error("Failed to import books");
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchFilter =
      !filter ||
      (book.category && book.category.toLowerCase() === filter.toLowerCase());
    const matchSearch = book.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 container mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 mb-6 shadow-md">
        <h1 className="text-4xl font-bold text-white flex items-center gap-2">
          <FaLayerGroup size={36} />
          Book Management
        </h1>
      </div>

      {/* Action Row: Import & Add Book in one line */}
      <div className="flex flex-col  lg:flex-row  items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative  w-full sm:max-w-md ">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search books..."
            className="input input-bordered w-full pl-10 shadow-md focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary flex items-center gap-1 shadow-md transition transform hover:scale-105"
            onClick={handleImportBooks}
          >
            <FaFileImport /> Import Books
          </button>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            className="btn btn-primary flex items-center gap-2 shadow-md transition transform hover:scale-105"
            onClick={() => openModal()}
          >
            <FaPlus /> Add Book
          </button>
        </div>
      </div>

      {/* Category Row: Add / List */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Categories</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-4">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white  dark:bg-gray-700 p-4 rounded shadow flex items-center justify-around"
                >
                  <span className="font-medium">{cat}</span>
                  <button
                    className="btn btn-sm btn-error flex items-center gap-1"
                    onClick={() => handleRemoveCategory(cat)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No categories found.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New Category"
            className="input input-bordered shadow-md"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            className="btn btn-success flex items-center gap-1 shadow-md transition transform hover:scale-105"
            onClick={handleAddCategory}
          >
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Book Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <table className="table table-auto w-full border-collapse shadow-lg">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Stock</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id} className="border-b dark:border-gray-600">
                  <td className="p-3">{book.title}</td>
                  <td className="p-3">{book.category}</td>
                  <td className="p-3">₹{book.price}</td>
                  <td className="p-3">{book.stock}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="btn btn-sm btn-warning flex items-center gap-1"
                      onClick={() => openModal(book)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-error flex items-center gap-1"
                      onClick={() => handleDeleteClick(book)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    No books match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <EditModal
          title={modalData ? "Edit Book" : "Add Book"}
          onSubmit={handleAddOrEditBook}
          onCancel={closeModal}
        >
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          ></textarea>
          <input
            type="number"
            className="input input-bordered w-full mb-2"
            placeholder="Price"
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
          />
          <input
            type="number"
            className="input input-bordered w-full mb-2"
            placeholder="Stock"
            value={formStock}
            onChange={(e) => setFormStock(e.target.value)}
          />
          <select
            className="select select-bordered w-full mb-2"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="file"
            multiple
            className="file-input file-input-bordered w-full mb-2"
            onChange={(e) => setFormImages(Array.from(e.target.files))}
          />
        </EditModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          message="Are you sure you want to delete this book?"
          onConfirm={confirmDeleteBook}
          onCancel={() => {
            setShowDeleteModal(false);
            setBookToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default BookManagement;
