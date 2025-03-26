import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHomeConfig, updateHomeConfig } from "../services/api";
import { FaHome, FaBullhorn, FaListUl, FaCalendarAlt } from "react-icons/fa";

const HomeManagementModern = () => {
  const baseURL ="https://churchlife.vercel.app/api";

  const [activeTab, setActiveTab] = useState("home");
  const [mainText, setMainText] = useState("Welcome to the Church Life");
  const [sections, setSections] = useState([]);
  const [latestUpdatesInput, setLatestUpdatesInput] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [eventCalendarPdf, setEventCalendarPdf] = useState(null);
  const [previewEventCalendarPdf, setPreviewEventCalendarPdf] = useState("");
  const [previewEventCalendarBanner, setPreviewEventCalendarBanner] =
    useState("");

  const makeFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return baseURL + path;
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getHomeConfig();
        setMainText(data.mainText || "Welcome to the Church Life");
        if (Array.isArray(data.sections)) {
          const mappedSections = data.sections.map((section) => ({
            ...section,
            image: makeFullUrl(section.image),
          }));
          setSections(mappedSections);
        }
        if (data.bannerTitle) setBannerTitle(data.bannerTitle);
        if (data.banner) setBannerImagePreview(makeFullUrl(data.banner));
        if (data.eventCalendar) {
          setPreviewEventCalendarPdf(makeFullUrl(data.eventCalendar.pdf));
          setPreviewEventCalendarBanner(makeFullUrl(data.eventCalendar.banner));
        }
        if (data.latestUpdates && Array.isArray(data.latestUpdates)) {
          setLatestUpdatesInput(data.latestUpdates.join(", "));
        }
      } catch (error) {
        console.error("Failed to load home configuration", error);
        toast.error("Failed to load home configuration");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (bannerImage) {
      const objectUrl = URL.createObjectURL(bannerImage);
      setBannerImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [bannerImage]);

  const handleSaveHome = async () => {
    const configData = {
      mainText,
      sections,
      bannerTitle,
    };
    const files = {};
    if (bannerImage) files.banner = bannerImage;
    try {
      await updateHomeConfig(configData, files);
      toast.success("Home configuration updated successfully!");
    } catch (error) {
      console.error("Error updating home configuration:", error);
      toast.error("Error updating configuration. Please try again.");
    }
  };

  const handleSaveLatestUpdates = async () => {
    // Split the input by comma and create an array
    const updatesArray = latestUpdatesInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    const configData = {
      latestUpdates: updatesArray, // Pass array directly
    };
    try {
      await updateHomeConfig(configData, {});
      toast.success("Latest updates updated successfully!");
      // Refresh config to update state
      const updatedData = await getHomeConfig();
      if (updatedData.latestUpdates) {
        setLatestUpdatesInput(updatedData.latestUpdates.join(", "));
      }
    } catch (error) {
      console.error("Error updating latest updates:", error);
      toast.error("Error updating latest updates. Please try again.");
    }
  };

  const handleEventCalendarSave = async () => {
    console.log("EventCalendarPdf file:", eventCalendarPdf);
    const configData = {};
    const files = {};
    if (eventCalendarPdf) {
      files.eventCalendarPdf = eventCalendarPdf;
    }
    try {
      await updateHomeConfig(configData, files);
      toast.success("Event Calendar updated successfully!");
      const updatedData = await getHomeConfig();
      if (updatedData.eventCalendar) {
        setPreviewEventCalendarPdf(makeFullUrl(updatedData.eventCalendar.pdf));
        setPreviewEventCalendarBanner(
          makeFullUrl(updatedData.eventCalendar.banner)
        );
      }
      setEventCalendarPdf(null);
    } catch (error) {
      console.error("Error updating event calendar:", error);
      toast.error("Error updating event calendar. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Home & Event Calendar Management
      </h1>

      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === "home"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("home")}
        >
          Home & Sections
        </button>
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === "event"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("event")}
        >
          Event Calendar
        </button>
      </div>

      {activeTab === "home" && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaHome className="text-2xl text-blue-500" />
              <h2 className="text-2xl font-semibold">Main Welcome Text</h2>
            </div>
            <textarea
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
              placeholder="Enter the welcome text"
            ></textarea>
            <div className="mt-4">
              <button
                className="btn btn-success px-10"
                onClick={handleSaveHome}
              >
                Save Home Configuration
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaBullhorn className="text-2xl text-red-500" />
              <h2 className="text-2xl font-semibold">Latest Updates</h2>
            </div>
            <input
              type="text"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={latestUpdatesInput}
              onChange={(e) => setLatestUpdatesInput(e.target.value)}
              placeholder="e.g. New sermon uploaded!, Weekly newsletter released!, Upcoming event: Community Picnic"
            />
            <div className="mt-4">
              <button
                className="btn btn-info px-10"
                onClick={handleSaveLatestUpdates}
              >
                Save Latest Updates
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaListUl className="text-2xl text-green-500" />
              <h2 className="text-2xl font-semibold">Sections</h2>
            </div>
            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="border p-4 bg-white dark:bg-gray-800 rounded"
                  >
                    <h3 className="font-bold">{section.title}</h3>
                    <p>{section.text}</p>
                    {section.image && (
                      <img
                        src={section.image}
                        alt={section.title}
                        className="mt-2 w-full h-40 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No sections available.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "event" && (
        <div className="space-y-8">
          <div className="flex items-center space-x-2 mb-4">
            <FaCalendarAlt className="text-2xl text-purple-500" />
            <h2 className="text-2xl font-semibold">
              Event Calendar Management
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">
                Upload Event Calendar PDF:
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    console.log(
                      "Selected EventCalendarPdf:",
                      e.target.files[0]
                    );
                    setEventCalendarPdf(e.target.files[0]);
                  }
                }}
                className="file-input file-input-bordered w-full dark:bg-gray-700"
              />
            </div>
            <button
              className="btn btn-warning"
              onClick={handleEventCalendarSave}
            >
              Update Event Calendar
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Event Calendar Preview
            </h3>
            <div className="w-full max-w-md" style={{ height: "300px" }}>
              {previewEventCalendarPdf ? (
                <iframe
                  src={previewEventCalendarPdf}
                  title="Event Calendar PDF"
                  width="100%"
                  height="100%"
                  className="border rounded-lg"
                />
              ) : (
                <p className="text-gray-500">No PDF available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default HomeManagementModern;
