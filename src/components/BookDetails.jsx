import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRightArrowLeft, FaPlus, FaMinus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

const BookDetails = ({ book: initialBook }) => {
  const [localBook, setLocalBook] = useState(initialBook);
  const [mainImage, setMainImage] = useState("");

  // Payment / Form state (added email field)
  const [paymentMethod, setPaymentMethod] = useState("borrow");
  const [language, setLanguage] = useState("English");
  const [file, setFile] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [borrowDate, setBorrowDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [formData, setFormData] = useState({
    yourName: "",
    contactNumber: "",
    email: "",
    collectorName: "",
  });

  const navigate = useNavigate();

  // Update localBook when initialBook changes
  useEffect(() => {
    setLocalBook(initialBook);
  }, [initialBook]);

  // Set main image if available
  useEffect(() => {
    if (localBook?.images?.length > 0) {
      setMainImage(localBook.images[0]);
    }
  }, [localBook]);

  const categoryLower = (localBook?.category || "").trim().toLowerCase();
  const stock = Number(localBook?.stock) || 0;

  // Set default payment method based on category
  useEffect(() => {
    if (categoryLower === "library") {
      setPaymentMethod("borrow");
    } else {
      setPaymentMethod("cash");
    }
  }, [categoryLower]);

  // Compute maximum return date: 1 month from borrow date
  const computedMaxReturnDate = new Date(borrowDate.getTime());
  computedMaxReturnDate.setMonth(borrowDate.getMonth() + 1);

  const handleReturnDateChange = (date) => {
    if (date > computedMaxReturnDate) {
      toast.error("Return date cannot be more than 1 month from borrow date.");
      setReturnDate(null);
    } else if (date < borrowDate) {
      toast.error("Return date cannot be before borrow date.");
      setReturnDate(null);
    } else {
      setReturnDate(date);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (quantity < stock) {
        setQuantity(quantity + 1);
      } else {
        toast.error("Out of Stock");
      }
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Render stock message based on category and stock level
  const renderStockMessage = () => {
    if (categoryLower === "library") {
      if (stock === 0) return "In Circulation!";
      return null;
    } else {
      if (stock === 0) return "Out of Stock!";
      if (stock > 0 && stock <= 10) return "Limited Stock! Hurry up!";
      return null;
    }
  };

  const stockMessage = renderStockMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations including email
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.yourName || !formData.contactNumber) {
      toast.error("Please fill in your name and contact number.");
      return;
    }
    if (paymentMethod === "online" && !formData.collectorName) {
      toast.error("Please fill in the collector's name for online payments.");
      return;
    }
    if (paymentMethod === "borrow" && !returnDate) {
      toast.error("Please select a return date for borrow transactions.");
      return;
    }
    if (paymentMethod !== "borrow" && quantity > stock) {
      toast.error("Selected quantity exceeds available stock.");
      return;
    }
    if (paymentMethod === "borrow" && stock === 0) {
      toast.error("This book is in circulation. You can't borrow it again.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("bookId", localBook._id);
    formDataToSend.append("bookName", localBook.title);
    formDataToSend.append("userName", formData.yourName);
    formDataToSend.append("contactNumber", formData.contactNumber);
    formDataToSend.append("email", formData.email); // Append email field
    formDataToSend.append("language", language);
    formDataToSend.append("paymentMethod", paymentMethod);

    if (paymentMethod !== "borrow") {
      formDataToSend.append("price", localBook.price);
      formDataToSend.append("quantity", quantity);
    }

    if (paymentMethod === "online") {
      formDataToSend.append("collectorName", formData.collectorName);
      if (file) {
        formDataToSend.append("screenshot", file);
      }
    }

    if (paymentMethod === "borrow") {
      formDataToSend.append("borrowDate", borrowDate.toISOString());
      formDataToSend.append("returnDate", returnDate.toISOString());
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payments`,
        { method: "POST", body: formDataToSend }
      );

      if (response.ok) {
        if (paymentMethod === "borrow") {
          toast.success("Congratulations, you successfully borrowed the book!");
          setLocalBook((prev) => {
            if (!prev) return prev;
            const newStock = Math.max(0, Number(prev.stock) - 1);
            return { ...prev, stock: newStock };
          });
        } else {
          toast.success(
            "Congratulations, you successfully purchased the book!"
          );
        }
      } else {
        toast.error("Error recording payment.");
      }
    } catch (error) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div
        className={`flex flex-col ${
          categoryLower !== "library" ? "md:flex-row gap-8" : "gap-8"
        }`}
      >
        {categoryLower !== "library" && (
          <div className="w-full md:w-1/2">
            <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt="Main Book"
                  className="object-contain w-full h-full"
                />
              ) : (
                <p className="text-gray-600">No Image Available</p>
              )}
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {localBook?.images?.map((image, index) => (
                <div
                  key={index}
                  className="w-20 h-20 border border-gray-300 dark:border-gray-600 rounded overflow-hidden cursor-pointer hover:opacity-80"
                  onClick={() => setMainImage(image)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`w-full ${
            categoryLower !== "library" ? "md:w-1/2" : ""
          } bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl space-y-6`}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {localBook.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            <strong>Category:</strong> {localBook.category}
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            <strong>Price:</strong> ₹{localBook.price}
          </p>
          <p className="text-md text-gray-700 dark:text-gray-300">
            {localBook.description || "No description available."}
          </p>

          {stockMessage && (
            <div className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">
              {stockMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Details */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Name:
              </label>
              <input
                type="text"
                name="yourName"
                placeholder="Enter your name"
                value={formData.yourName}
                onChange={(e) =>
                  setFormData({ ...formData, yourName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                Contact Number:
              </label>
              <input
                type="text"
                name="contactNumber"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            {/* Email Field (moved below contact) */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                Email:
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                Language:
              </label>
              <select
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* Payment Mode Selection */}
            {categoryLower !== "library" ? (
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Payment:
                </label>
                <select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="cash">Cash Purchase</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            ) : (
              <input type="hidden" name="paymentMethod" value="borrow" />
            )}

            {/* Additional Fields for Online Payment */}
            {paymentMethod === "online" && (
              <>
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Collector's Name:
                  </label>
                  <input
                    type="text"
                    name="collectorName"
                    placeholder="Enter collector's name"
                    value={formData.collectorName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        collectorName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Upload Screenshot:
                  </label>
                  <input
                    type="file"
                    name="screenshot"
                    onChange={handleFileChange}
                    className="w-full file-input file-input-bordered dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            {/* Borrow Dates for Library Books */}
            {paymentMethod === "borrow" && categoryLower === "library" && (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="space-y-2 w-full">
                  <label className="block text-md font-semibold text-gray-900 dark:text-gray-100">
                    Borrow Date:
                  </label>
                  <DatePicker
                    selected={borrowDate}
                    onChange={setBorrowDate}
                    minDate={new Date()}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                </div>
                <FaArrowRightArrowLeft
                  size={30}
                  className="text-gray-500 dark:text-gray-400"
                />
                <div className="space-y-2 w-full">
                  <label className="block text-md font-semibold text-gray-900 dark:text-gray-100">
                    Return Date:
                  </label>
                  <DatePicker
                    selected={returnDate}
                    onChange={handleReturnDateChange}
                    minDate={borrowDate}
                    maxDate={computedMaxReturnDate}
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                </div>
              </div>
            )}

            {/* Quantity Selection for Purchases */}
            {paymentMethod !== "borrow" && (
              <div className="flex items-center gap-3 mt-4">
                <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Quantity:
                </label>
                <button
                  type="button"
                  className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleQuantityChange("decrease")}
                >
                  <FaMinus />
                </button>
                <span className="px-2">{quantity}</span>
                <button
                  type="button"
                  className="p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleQuantityChange("increase")}
                >
                  <FaPlus />
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-colors"
              disabled={paymentMethod === "borrow" && stock === 0}
            >
              {paymentMethod === "borrow"
                ? "Borrow Now"
                : paymentMethod === "cash"
                ? "Cash Purchase"
                : "Online Payment"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default BookDetails;
