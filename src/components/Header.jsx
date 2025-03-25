import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { getCategories } from "../services/api"; // API function to fetch categories

const Dropdown = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <li ref={dropdownRef} className="dropdown relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost flex items-center text-sm dark:text-white font-normal"
      >
        {title}
        <svg className="fill-current ml-1 w-4 h-4" viewBox="0 0 20 20">
          <path d="M5.293 7.293L10 12l4.707-4.707-1.414-1.414L10 9.172 6.707 5.879z" />
        </svg>
      </button>
      {isOpen && (
        <ul className="dropdown-content menu p-2 shadow-lg rounded-box w-48 dark:bg-gray-700 z-50 text-base-content dark:text-white bg-white text-sm">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onClick: (e) => {
                if (child.props.onClick) child.props.onClick(e);
                setIsOpen(false);
              },
            })
          )}
        </ul>
      )}
    </li>
  );
};

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const prevUserRef = useRef(user);

  // Set dark mode from localStorage on mount
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, []);

  // Fetch book categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(); // Expected to return an array of category objects
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch book categories.");
      }
    };

    fetchCategories();
  }, []);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        window.scrollY > 10
          ? headerRef.current.classList.add("shadow-lg")
          : headerRef.current.classList.remove("shadow-lg");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Toggle dark mode and persist
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    document.documentElement.setAttribute(
      "data-theme",
      newMode ? "dark" : "light"
    );
    localStorage.setItem("darkMode", newMode.toString());
  };

  // Protected route handler
  const handleProtectedClick = (e) => {
    if (!user) {
      e.preventDefault();
      toast.error("Please login to access this page");
      navigate("/auth");
    }
  };

  // Helper function: generate slug from name if not provided
  const getSlug = (cat) => {
    return cat.slug ? cat.slug : cat.name.toLowerCase().replace(/\s+/g, "-");
  };

  // Generate dynamic links for "All Books" dropdown based on fetched categories.
  const allBooksLinks = categories.map((cat) => {
    const slug = getSlug(cat);
    return (
      <li key={slug}>
        <Link
          to={slug === "library" ? "/library" : `/books/category/${slug}`}
          onClick={handleLinkClick}
          className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
        >
          {cat.name}
        </Link>
      </li>
    );
  });

  const menuItems = (
    <>
      <li>
        <Link
          to="/"
          onClick={handleLinkClick}
          className="text-base-content dark:text-white hover:text-blue-500 text-sm"
        >
          Home
        </Link>
      </li>
      <Dropdown title="All Books">{allBooksLinks}</Dropdown>
      <Dropdown title="Resources">
        <li>
          <Link
            to="https://agodman.com/gospel-tracts-booklets/free-gospel-resources-bibles-for-america/"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Gospel Tracts
          </Link>
        </li>
        <li>
          <a
            href="/hymns.pdf"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Hymns
          </a>
        </li>
        <li>
          <Link
            to="https://text.recoveryversion.bible/"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Recovery Version Bible
          </Link>
        </li>
        <li>
          <Link
            to="https://www.bible.com/hi/bible/1682/JHN.1.HINCLBSI"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Hindi Bible
          </Link>
        </li>
        <li>
          <a
            href="https://www.ministrybooks.org/"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Ministry Books
          </a>
        </li>
        <li>
          <a
            href="https://www.amanaliterature.in/?srsltid=AfmBOoqVIeOvHdsKm42AYOiDkMtsi26YNmIel_zmqWjOJBVSGMH3L5Em"
            target="_blank"
            onClick={handleLinkClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Amana Literature
          </a>
        </li>
      </Dropdown>
      <Dropdown title="Church Events & Calendar">
        <li>
          <Link
            to="/event-calender"
            onClick={handleProtectedClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Church Event Calendar
          </Link>
        </li>
        <li>
          <Link
            to="/event-register-form"
            onClick={handleProtectedClick}
            className="hover:bg-base-200 dark:hover:bg-base-300 rounded text-sm"
          >
            Event Registrations
          </Link>
        </li>
      </Dropdown>
      <li>
        <Link
          to="/announcements"
          onClick={handleProtectedClick}
          className="text-base-content dark:text-white hover:text-blue-500 text-sm"
        >
          Announcements
        </Link>
      </li>
      <li>
        <Link
          to="/contact"
          onClick={handleLinkClick}
          className="text-base-content dark:text-white hover:text-blue-500 text-sm"
        >
          Contact
        </Link>
      </li>
      {user && user.role && user.role.toLowerCase() === "admin" && (
        <li>
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className="text-base-content dark:text-white hover:text-blue-500 text-sm"
          >
            Admin Dashboard
          </Link>
        </li>
      )}
      <li>
        {user ? (
          <div className="flex items-center space-x-2">
            <span className="text-base-content dark:text-white text-sm">
              {user.fullName}
            </span>
            <button
              onClick={() => {
                logout();
                handleLinkClick();
              }}
              className="btn btn-primary btn-sm text-sm"
            >
              <IoLogOutOutline />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            onClick={handleLinkClick}
            className="btn btn-outline btn-primary text-sm"
          >
            Login
          </Link>
        )}
      </li>
      <li className="flex items-center space-x-2">
        <button onClick={toggleDarkMode} className="btn btn-ghost text-sm">
          {isDarkMode ? (
            <MdLightMode size={20} color="yellow" />
          ) : (
            <MdDarkMode size={20} />
          )}
        </button>
      </li>
    </>
  );

  useEffect(() => {
    if (prevUserRef.current && !user) {
      toast.info("Logged out successfully!");
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      toast.success("Logged in successfully!");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <header
      ref={headerRef}
      className="navbar sticky  top-0 z-30 dark:from-gray-800 dark:to-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 dark:text-white transition-shadow"
    >
      <div className="navbar-start">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="w-14  lg:mx-10 mx-2 py-2"
        >
          <img
            className="w-full rounded-full"
            src={"/logo.png"}
            alt="Church Logo"
          />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal items-center p-2 text-sm">
          {menuItems}
        </ul>
      </div>
      <div className="navbar-end lg:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          className="btn btn-ghost text-sm"
        >
          {isMenuOpen ? (
            <FiX size={24} className="text-base-content dark:text-white" />
          ) : (
            <FiMenu size={24} className="text-base-content dark:text-white" />
          )}
        </button>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-base-100 dark:bg-base-200 shadow-md z-50">
          <ul className="menu menu-vertical p-4 text-sm">{menuItems}</ul>
        </div>
      )}
    </header>
  );
};

export default Header;
