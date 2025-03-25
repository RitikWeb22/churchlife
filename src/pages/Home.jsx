import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../Contexts/AuthContext";
import { getHomeConfig, getBooks } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = React.useContext(AuthContext);

  // Home config states
  const [mainText, setMainText] = useState("Welcome to the Church Life");
  const [bgLight, setBgLight] = useState("/bg.png");
  const [bgDark, setBgDark] = useState("/dark.jpg");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [sections, setSections] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([
    "New sermon uploaded!",
    "Weekly newsletter released!",
    "Upcoming event: Community Picnic",
  ]);

  const BooksImages = ["/book1.jpg", "/book2.jpg", "/book3.jpg", "/book4.jpg"];
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAlert, setSearchAlert] = useState("");

  // Fetch home config and books
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeData, booksData] = await Promise.all([
          getHomeConfig(),
          getBooks(),
        ]);
        setMainText(homeData.mainText || "Welcome to the Church Life");
        if (homeData.lightBg) setBgLight(homeData.lightBg);
        if (homeData.darkBg) setBgDark(homeData.darkBg);
        if (homeData.bannerTitle) setBannerTitle(homeData.bannerTitle);
        if (homeData.banner) setBannerImage(homeData.banner);
        if (Array.isArray(homeData.sections)) setSections(homeData.sections);
        if (Array.isArray(homeData.latestUpdates)) {
          setLatestUpdates(homeData.latestUpdates);
        }
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Navigate to book details when Enter is pressed
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const matchedBook = books.find((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedBook) {
        setSearchAlert(""); // Clear any previous alert
        navigate(`/books/${matchedBook._id}`);
      } else {
        setSearchAlert(`No book found for "${searchTerm}"`);
      }
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-100 bg-indigo-200 to-blue-200 dark:from-gray-900 dark:to-gray-900 text-black dark:text-white">
      {/* Marquee for latest updates if user is logged in */}
      {user && (
        <div className="bg-red-700 dark:bg-red-600 py-2 font-semibold text-white overflow-hidden">
          <Marquee pauseOnHover gradient gradientColor={[185, 28, 28]}>
            {latestUpdates.map((update, index) => (
              <span key={index} className="mx-4 inline-block text-xl">
                {update}
              </span>
            ))}
          </Marquee>
        </div>
      )}

      {/* Hero Section with fade-in animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="py-10"
      >
        <div className="flex lg:items-center justify-center min-h-screen md:items-start   ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-8 py-10 md:py-20 max-w-7xl">
            {/* Left: Book Images (hidden on small screens) */}
            <div className="card1 hidden  md:flex flex-col justify-center items-center -mt-20 gap-4">
              <div className="lg:grid grid-cols-1 sm:grid-cols-2 gap-4 w-[50%]">
                {BooksImages.length > 0 ? (
                  BooksImages.map((BooksImage, index) => (
                    <div key={index} className="rounded">
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <img
                          src={BooksImage}
                          alt="books"
                          className={`min-w-full object-contain h-auto mb-2 rounded transform transition duration-300 hover:scale-105 ${
                            index === 0 ? "mt-20" : index === 3 ? "-mt-20" : ""
                          }`}
                        />
                      </motion.div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center">
                    No books available.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Main Welcome Text & Book Search */}
            <div className="card2 flex  flex-col justify-start  p-4 md:p-8">
              <h2 className="text-3xl font-bold mb-6">{mainText}</h2>
              <label htmlFor="search" className="font-semibold mb-2">
                Search Books (Press Enter):
              </label>
              <input
                id="search"
                type="text"
                placeholder="Type a book title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchAlert(""); // Clear alert on new input
                }}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded focus:outline-none text-black dark:text-white"
              />
              {/* Search alert message */}
              {searchAlert && (
                <p className="mt-2 text-red-500 text-sm">{searchAlert}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default Home;
