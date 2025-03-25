import React, { useState, useEffect } from "react";
import { createAnnouncement } from "../services/announcementApi";

const AnnouncementsPage = () => {
  // Banner state
  const [banner, setBanner] = useState({ title: "", image: "" });
  const [bannerError, setBannerError] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsError, setAnnouncementsError] = useState(null);

  // Important Links state
  const [importantLinks, setImportantLinks] = useState([]);
  const [linksError, setLinksError] = useState(null);

  // "Read More" modal state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchBanner();
    fetchAnnouncements();
    fetchImportantLinks();
  }, []);

  // ─────────────────────────────────────────────────────────
  // BANNER FETCH
  // ─────────────────────────────────────────────────────────
  const fetchBanner = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/banner`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch banner");
        }
        return res.json();
      })
      .then((data) => setBanner(data))
      .catch((err) => {
        console.error(err);
        setBannerError(err.message);
      });
  };

  // ─────────────────────────────────────────────────────────
  // ANNOUNCEMENTS FETCH
  // ─────────────────────────────────────────────────────────
  const fetchAnnouncements = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/announcements`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch announcements");
        }
        return res.json();
      })
      .then((data) => setAnnouncements(data))
      .catch((err) => {
        console.error(err);
        setAnnouncementsError(err.message);
      });
  };

  // ─────────────────────────────────────────────────────────
  // IMPORTANT LINKS FETCH
  // ─────────────────────────────────────────────────────────
  const fetchImportantLinks = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/important-links`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch important links");
        }
        return res.json();
      })
      .then((data) => setImportantLinks(data))
      .catch((err) => {
        console.error(err);
        setLinksError(err.message);
      });
  };

  // ─────────────────────────────────────────────────────────
  // MODAL HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleReadMore = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  // Hero banner style
  const bannerStyle = {
    backgroundImage: banner.image
      ? `url('${banner.image}')`
      : `url('https://via.placeholder.com/1200x400?text=No+Banner+Found')`,
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      {/* Hero Banner */}
      <header
        className="relative bg-center bg-cover bg-no-repeat h-64 flex items-center justify-center text-white"
        style={bannerStyle}
      >
        <div className="bg-black bg-opacity-10 absolute inset-0" />
        <div className="relative text-center p-4">
          {bannerError ? (
            <p className="text-red-400 text-xl">
              Error loading banner: {bannerError}
            </p>
          ) : (
            <>
              {/* Uncomment the following if needed */}
              {/* <h1 className="text-4xl font-bold">{banner.title || ""}</h1> */}
              {/* <p className="text-lg text-gray-200 mt-2">
                Stay updated with the latest news and events
              </p> */}
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Announcements: right 3 columns on md+ screens */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-3xl font-bold text-center mb-4">
                Latest Updates
              </h2>

              {announcementsError && (
                <p className="text-red-500 text-center mb-4">
                  Error: {announcementsError}
                </p>
              )}

              {/* Announcements grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                {announcements.length === 0 && !announcementsError && (
                  <p className="text-center col-span-full">
                    No announcements found.
                  </p>
                )}

                {announcements.map((announcement) => (
                  <div
                    key={announcement._id || announcement.id}
                    className="bg-white flex flex-col justify-between dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                  >
                    {announcement.image && (
                      <figure className="h-48  overflow-hidden">
                        <img
                          src={announcement.image}
                          alt={announcement.title}
                          className="w-full h-full object-cover"
                        />
                      </figure>
                    )}
                    <div className="p-4 space-y-2">
                      <h2 className="text-xl font-semibold">
                        {announcement.title}
                      </h2>
                      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                        {announcement.description?.length > 100
                          ? announcement.description.slice(0, 100) + "..."
                          : announcement.description}
                      </p>
                      {announcement.date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Event Date:{" "}
                          {new Date(announcement.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                      {announcement.createdAt && (
                        <p className="text-xs text-gray-400">
                          Posted on:{" "}
                          {new Date(announcement.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          className="btn btn-md btn-primary mt-2"
                          onClick={() => handleReadMore(announcement)}
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Links: left 1 column on md+ screens */}
            <div className="md:col-span-2 py-12 space-y-4">
              <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-4 border border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Important Links</h2>

                {linksError && (
                  <p className="text-red-500 mb-2">Error: {linksError}</p>
                )}

                {importantLinks.length === 0 && !linksError && (
                  <p className="text-sm text-gray-600">
                    No important links found.
                  </p>
                )}

                {/* Add group class */}
                <div className="marquee-container h-[400px] overflow-hidden relative pt-4 group">
                  <div className="marquee-content absolute w-full animate-verticalMarquee space-y-4">
                    {importantLinks.map((item) => {
                      const linkUrl = item.url?.startsWith("http")
                        ? item.url
                        : `https://${item.url}`;
                      return (
                        <div
                          key={item._id}
                          className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow p-4 flex items-center justify-between"
                        >
                          <span className="text-lg font-medium text-blue-600 dark:text-blue-300">
                            <a href={linkUrl} target="_blank" rel="noreferrer">
                              {item.title}
                            </a>
                          </span>
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm px-10 bg-blue-600 text-white hover:bg-blue-500"
                          >
                            Visit
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Read More Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl p-6 rounded-xl shadow-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Fixed Image */}
              {selectedAnnouncement.image && (
                <div className="flex items-center justify-center max-h-[400px] overflow-hidden">
                  <img
                    src={selectedAnnouncement.image}
                    alt={selectedAnnouncement.title}
                    className="w-full object-contain rounded-lg"
                  />
                </div>
              )}
              {/* Right Column: Scrollable Text */}
              <div className="h-[400px] overflow-y-auto">
                <h2 className="text-3xl font-bold">
                  {selectedAnnouncement.title}
                </h2>
                {selectedAnnouncement.createdAt && (
                  <p className="text-sm text-gray-500">
                    Posted on:{" "}
                    {new Date(
                      selectedAnnouncement.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {selectedAnnouncement.date && (
                  <p className="text-sm text-gray-500">
                    Event Date:{" "}
                    {new Date(selectedAnnouncement.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedAnnouncement.description}
                </p>
                {selectedAnnouncement.link && (
                  <a
                    href={
                      selectedAnnouncement.link.startsWith("http")
                        ? selectedAnnouncement.link
                        : `https://${selectedAnnouncement.link}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit Link
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
