import axios from "axios";

// ------------------------------
// Base API URL Setup
// ------------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ------------------------------
// CSRF Token Helper with Caching
// ------------------------------
let cachedCsrfToken = null;

export const getCsrfToken = async () => {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const { data } = await api.get("/csrf-token");
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
};

// Optionally, you might want to clear the cache on certain error responses.
// For example, in an interceptor you can check if error.response.status === 403,
// and then reset cachedCsrfToken = null.

// ------------------------------
// Axios Wrapper for Consistent API Calls
// ------------------------------
const apiCall = async (method, url, data = {}, extraHeaders = {}) => {
  try {
    const headers = { ...extraHeaders };
    if (method.toLowerCase() !== "get") {
      const csrfToken = await getCsrfToken();
      headers["x-csrf-token"] = csrfToken;
    }

    const config = {
      method,
      url,
      data,
      headers,
    };

    const response = await api(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`API Error: ${method.toUpperCase()} ${url}`, error.response.data);
    } else {
      console.error(`API Error: ${method.toUpperCase()} ${url}`, error.message);
    }

    // Reset CSRF token if forbidden error
    if (error.response && error.response.status === 403) {
      cachedCsrfToken = null;
    }

    throw error;
  }
};

    // Optionally clear the CS
// ------------------------------
// Books Endpoints
// ------------------------------
export const getBooks = async () => {
  return apiCall("get", "/books");
};

export const getBookById = async (id) => {
  return apiCall("get", `/books/${id}`);
};

export const createBook = async (bookData, images = []) => {
  const formData = new FormData();
  Object.keys(bookData).forEach((key) => formData.append(key, bookData[key]));
  images.forEach((imgFile) => formData.append("images", imgFile));

  return apiCall("post", "/books", formData, {
    // Do not set Content-Type manually for FormData.
  });
};

export const updateBook = async (id, bookData, images = []) => {
  const formData = new FormData();
  Object.keys(bookData).forEach((key) => formData.append(key, bookData[key]));
  images.forEach((img) => formData.append("images", img));

  return apiCall("put", `/books/${id}`, formData);
};

export const deleteBook = async (id) => {
  return apiCall("delete", `/books/${id}`);
};

// ------------------------------
// Payment & Borrow Endpoints for Books
// ------------------------------
export const borrowBook = async (borrowData) => {
  return apiCall("post", "/books/borrow", borrowData, {
    "Content-Type": "application/json",
  });
};

// ------------------------------
// Categories Endpoints
// ------------------------------
export const getCategories = async () => {
  return apiCall("get", "/categories");
};

export const addCategory = async (name) => {
  return apiCall("post", "/categories", { name }, { "Content-Type": "application/json" });
};

export const removeCategory = async (name) => {
  return apiCall("delete", `/categories/${name}`);
};

export const getBooksByCategory = async (category) => {
  return apiCall("get", `/books/category/${category}`);
};

// ------------------------------
// Users & Auth Endpoints
// ------------------------------
export const getUsers = async () => {
  return apiCall("get", "/auth");
};

export const loginUser = async (loginData) => {
  return apiCall("post", "/auth/login", loginData, { "Content-Type": "application/json" });
};

export const registerUser = async (registerData) => {
  return apiCall("post", "/auth/register", registerData, { "Content-Type": "application/json" });
};

export const deleteUser = async (id) => {
  return apiCall("delete", `/users/${id}`);
};

export const updateUserRole = async (id, role) => {
  return apiCall("put", `/users/${id}/role`, { role }, { "Content-Type": "application/json" });
};

export const updateUser = async (id, data) => {
  return apiCall("put", `/users/${id}`, data, { "Content-Type": "application/json" });
};

// ------------------------------
// OTP & Google Auth Endpoints
// ------------------------------
export const sendOTP = async (data) => {
  return apiCall("post", "/auth/send-otp", data, { "Content-Type": "application/json" });
};

export const verifyOTP = async (data) => {
  return apiCall("post", "/auth/verify-otp", data, { "Content-Type": "application/json" });
};

// ------------------------------
// File Upload Endpoint
// ------------------------------
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiCall("post", "/upload", formData);
};

// ------------------------------
// Import Books Endpoint
// ------------------------------
export const importBooks = async (books) => {
  return apiCall("post", "/books/import", books, { "Content-Type": "application/json" });
};

// ------------------------------
// Announcements & Event Registrations Endpoints
// ------------------------------
export const createAnnouncement = async (payload, imageFile) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("date", payload.date);
  formData.append("link", payload.link);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return apiCall("post", "/announcements", formData);
};

export const createRegistration = async (regData) => {
  return apiCall("post", "/event-registrations", regData, { "Content-Type": "application/json" });
};

export const getRegistrations = async () => {
  return apiCall("get", "/event-registrations");
};

export const deleteRegistration = async (id) => {
  return apiCall("delete", `/event-registrations/${id}`);
};

// ------------------------------
// Church Calendar Endpoints
// ------------------------------
export const getChurchCalendars = async () => {
  return apiCall("get", "/calendars");
};

export const createCalendar = async (calendarData, imageFile) => {
  const formData = new FormData();
  formData.append("title", calendarData.title);
  formData.append("date", calendarData.date);
  formData.append("price", calendarData.price);
  formData.append("isBanner", calendarData.isBanner || false);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return apiCall("post", "/calendars", formData);
};

export const updateCalendar = async (id, calendarData, imageFile) => {
  const formData = new FormData();
  formData.append("title", calendarData.title);
  formData.append("date", calendarData.date);
  formData.append("price", calendarData.price);
  formData.append("isBanner", calendarData.isBanner || false);
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return apiCall("put", `/calendars/${id}`, formData);
};

export const deleteCalendar = async (id) => {
  return apiCall("delete", `/calendars/${id}`);
};

export const purchaseCalendar = async (purchaseData, screenshotFile) => {
  const formData = new FormData();
  formData.append("calendarId", purchaseData.calendarId);
  formData.append("calendarTitle", purchaseData.calendarTitle);
  formData.append("purchaserName", purchaseData.purchaserName);
  formData.append("contact", purchaseData.contact);
  formData.append("price", purchaseData.price);
  formData.append("paymentMethod", purchaseData.paymentMethod);
  if (purchaseData.paymentMethod === "Online") {
    formData.append("collectorName", purchaseData.collectorName);
    if (screenshotFile) {
      formData.append("screenshot", screenshotFile);
    }
  }
  return apiCall("post", "/calendar-purchases", formData);
};

export const getPurchases = async () => {
  return apiCall("get", "/calendar-purchases");
};

// ------------------------------
// Contact Endpoints
// ------------------------------
export const createContact = async (contactData) => {
  return apiCall("post", "/contacts", contactData, { "Content-Type": "application/json" });
};

export const getContacts = async () => {
  return apiCall("get", "/contacts");
};

export const deleteContact = async (id) => {
  return apiCall("delete", `/contacts/${id}`);
};

// ------------------------------
// Contact Banner Endpoints
// ------------------------------
export const getContactBanner = async () => {
  return apiCall("get", "/contact-banner");
};

export const uploadContactBanner = async (bannerFile) => {
  const formData = new FormData();
  formData.append("banner", bannerFile);
  return apiCall("post", "/contact-banner", formData);
};

// ------------------------------
// Home Page Config Endpoints
// ------------------------------
export const getHomeConfig = async () => {
  console.log("GET", API_BASE_URL + "/home");
  return apiCall("get", "/home");
};

export const updateHomeConfig = async (data, files = {}) => {
  const formData = new FormData();

  if (data.mainText !== undefined) {
    formData.append("mainText", data.mainText);
  }
  if (data.sections !== undefined) {
    const sectionsValue =
      typeof data.sections === "string" ? data.sections : JSON.stringify(data.sections);
    formData.append("sections", sectionsValue);
  }
  if (data.bannerTitle !== undefined) {
    formData.append("bannerTitle", data.bannerTitle);
  }
  if (data.latestUpdates !== undefined) {
    const updatesValue =
      typeof data.latestUpdates === "string" ? data.latestUpdates : JSON.stringify(data.latestUpdates);
    formData.append("latestUpdates", updatesValue);
  }
  if (files.eventCalendarPdf) {
    formData.append("eventCalendarPdf", files.eventCalendarPdf);
  } else {
    console.warn("No eventCalendarPdf file found in files object");
  }

  return apiCall("put", "/home", formData);
};

export const updateHomeText = async (data) => {
  return apiCall("patch", "/home/text", data, { "Content-Type": "application/json" });
};

// ------------------------------
// Phone-based Verification Endpoints
// ------------------------------
export const checkNumberExists = async (phone) => {
  try {
    await apiCall("post", "/auth/verify-phone", { phone }, { "Content-Type": "application/json" });
    return true;
  } catch (error) {
    return false;
  }
};

export const updatePassword = async (phoneNumber, newPassword) => {
  return apiCall("post", "/auth/reset-password", { phone: phoneNumber, password: newPassword }, { "Content-Type": "application/json" });
};

export const createUser = async (userData) => {
  return apiCall("post", "/auth/create-user", userData, { "Content-Type": "application/json" });
};

// ------------------------------
// Dynamic Form Fields (Event Fields) Endpoints
// ------------------------------
export const getFormFields = async () => {
  return apiCall("get", "/event-fields");
};

export const createFormField = async (fieldData) => {
  return apiCall("post", "/event-fields", fieldData, { "Content-Type": "application/json" });
};

export const updateFormField = async (id, fieldData) => {
  return apiCall("put", `/event-fields/${id}`, fieldData, { "Content-Type": "application/json" });
};

export const deleteFormField = async (id) => {
  return apiCall("delete", `/event-fields/${id}`);
};

export const updateFieldOrder = async (orderArray) => {
  return apiCall("put", "/event-fields/order", orderArray, { "Content-Type": "application/json" });
};

// ------------------------------
// Import Users (Excel) Endpoints
// ------------------------------
export const importUsers = async (file, token) => {
  const formData = new FormData();
  formData.append("excel", file);
  return apiCall("post", "/auth/import-users", formData, {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  });
};

// ------------------------------
// New: Add Phone Number (Admin Pre-Populate)
// ------------------------------
export const addPhoneNumber = async (phoneData, token) => {
  return apiCall("post", "/auth/add-phone", phoneData, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });
};

// ------------------------------
// Stats Endpoints
// ------------------------------
export const getStats = async () => {
  return apiCall("get", "/stats");
};

export const updateStats = async (statsData) => {
  return apiCall("put", "/stats", statsData, { "Content-Type": "application/json" });
};

export default api;
