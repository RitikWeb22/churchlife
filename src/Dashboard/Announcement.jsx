import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getBanner, updateBanner } from "../services/bannerApi";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/announcementApi";
import {
  getImportantLinks,
  createImportantLink,
  updateImportantLink,
  deleteImportantLink,
} from "../services/importantLinksApi";

import EditModal from "../components/EditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ViewModal from "../components/ViewModal";

const BannerAndAnnouncementManagement = () => {
  // Banner states
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [existingBannerImage, setExistingBannerImage] = useState("");

  // Announcement states
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  // Form fields
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");
  const [announcementImageFile, setAnnouncementImageFile] = useState(null);

  // Important Links states
  const [links, setLinks] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Delete & View modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "announcement" or "link"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchBannerData();
    refreshAnnouncements();
    fetchAllLinks();
  }, []);

  // Banner functions
  const fetchBannerData = async () => {
    try {
      const data = await getBanner();
      if (data) {
        setBannerTitle(data.title || "");
        setExistingBannerImage(data.image || "");
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      toast.error("Failed to fetch banner info.");
    }
  };

  const handleBannerImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImageFile(e.target.files[0]);
    }
  };

  const handleUpdateBanner = async () => {
    try {
      await updateBanner(bannerTitle, bannerImageFile);
      toast.success("Banner updated successfully!");
      fetchBannerData();
      setBannerImageFile(null);
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner.");
    }
  };

  // Announcement functions
  const refreshAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      console.log("Fetched announcements:", data);
      setAnnouncements(data);
    } catch (error) {
      console.error("Error refreshing announcements:", error);
      toast.error("Failed to fetch announcements.");
    }
  };

  const openAnnouncementModal = (announcement = null) => {
    setIsAnnouncementModalOpen(true);
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementTitle(announcement.title);
      setAnnouncementDescription(announcement.description);
      setAnnouncementDate(
        announcement.date
          ? new Date(announcement.date).toISOString().slice(0, 10)
          : ""
      );
      setAnnouncementLink(announcement.link || "");
      setAnnouncementImageFile(null);
    } else {
      setEditingAnnouncement(null);
      setAnnouncementTitle("");
      setAnnouncementDescription("");
      setAnnouncementDate("");
      setAnnouncementLink("");
      setAnnouncementImageFile(null);
    }
  };

  const closeAnnouncementModal = () => {
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleAnnouncementSubmit = async () => {
    if (!announcementTitle.trim()) {
      toast.error("Title is required.");
      return;
    }
    const payload = {
      title: announcementTitle,
      description: announcementDescription,
      date: announcementDate,
      link: announcementLink,
    };
    console.log(
      "Submitting announcement:",
      payload,
      "Image:",
      announcementImageFile
    );
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(
          editingAnnouncement._id,
          payload,
          announcementImageFile
        );
        toast.success("Announcement updated!");
      } else {
        await createAnnouncement(payload, announcementImageFile);
        toast.success("Announcement created!");
      }
      refreshAnnouncements();
      closeAnnouncementModal();
    } catch (error) {
      console.error("Error submitting announcement:", error);
      toast.error("Failed to save announcement.");
    }
  };

  const handleAnnouncementImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAnnouncementImageFile(e.target.files[0]);
    }
  };

  // Important Links functions
  const fetchAllLinks = async () => {
    try {
      const data = await getImportantLinks();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("Failed to fetch important links.");
    }
  };

  const openLinkModal = (linkItem = null) => {
    setIsLinkModalOpen(true);
    if (linkItem) {
      setEditingLink(linkItem);
      setLinkTitle(linkItem.title);
      setLinkUrl(linkItem.url);
    } else {
      setEditingLink(null);
      setLinkTitle("");
      setLinkUrl("");
    }
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleLinkSubmit = async () => {
    if (!linkTitle.trim()) {
      toast.error("Link title is required.");
      return;
    }
    if (!linkUrl.trim()) {
      toast.error("Link URL is required.");
      return;
    }
    try {
      if (editingLink) {
        await updateImportantLink(editingLink._id, {
          title: linkTitle,
          url: linkUrl,
        });
        toast.success("Link updated!");
      } else {
        await createImportantLink({ title: linkTitle, url: linkUrl });
        toast.success("Link added!");
      }
      fetchAllLinks();
      closeLinkModal();
    } catch (error) {
      console.error("Error submitting link:", error);
      toast.error("Failed to save link.");
    }
  };

  // Delete and view modals
  const openDeleteModal = (target, type) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteType("");
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "announcement") {
        await deleteAnnouncement(deleteTarget._id);
        toast.info("Announcement deleted.");
        refreshAnnouncements();
      } else if (deleteType === "link") {
        await deleteImportantLink(deleteTarget._id);
        toast.info("Link deleted.");
        fetchAllLinks();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item.");
    }
    closeDeleteModal();
  };

  const openViewAnnouncementModal = (announcement) => {
    setViewAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewAnnouncement(null);
    setIsViewModalOpen(false);
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Banner Management */}
      <h1 className="text-3xl font-bold mb-4">Banner Management</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Banner Title:</label>
          <input
            type="text"
            className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Current Banner Image:
          </label>
          {existingBannerImage ? (
            <img
              src={existingBannerImage}
              alt="Banner"
              className="w-48 h-24 object-cover rounded"
            />
          ) : (
            <p>No banner image set.</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Upload New Banner Image:
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onChange={handleBannerImageChange}
          />
        </div>
        <button className="btn btn-primary" onClick={handleUpdateBanner}>
          Update Banner
        </button>
      </div>

      {/* Announcement Management */}
      <h1 className="text-3xl font-bold mb-4">Announcement Management</h1>
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => openAnnouncementModal()}
        >
          <FaPlus />
          Add Announcement
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded shadow mb-8">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Event Date</th>
              <th>Link</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt="Announcement"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>
                    {item.description?.length > 30
                      ? item.description.slice(0, 30) + "..."
                      : item.description}
                  </td>
                  <td>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "No date"}
                  </td>
                  <td>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "No link"
                    )}
                  </td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => openViewAnnouncementModal(item)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-warning flex items-center gap-1"
                      onClick={() => openAnnouncementModal(item)}
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error flex items-center gap-1"
                      onClick={() => openDeleteModal(item, "announcement")}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Important Links Management */}
      <h1 className="text-3xl font-bold mb-4">Important Links Management</h1>
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => openLinkModal()}
        >
          <FaPlus />
          Add Link
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded shadow mb-8">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length > 0 ? (
              links.map((linkItem) => (
                <tr key={linkItem._id}>
                  <td>{linkItem.title}</td>
                  <td>
                    <a
                      href={linkItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {linkItem.url}
                    </a>
                  </td>
                  <td className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm btn-warning flex items-center gap-1"
                      onClick={() => openLinkModal(linkItem)}
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error flex items-center gap-1"
                      onClick={() => openDeleteModal(linkItem, "link")}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No important links found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal for Announcements */}
      {isAnnouncementModalOpen && (
        <EditModal
          title={editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
          onSubmit={handleAnnouncementSubmit}
          onCancel={closeAnnouncementModal}
        >
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Title"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            rows="3"
            placeholder="Description"
            value={announcementDescription}
            onChange={(e) => setAnnouncementDescription(e.target.value)}
          ></textarea>
          <input
            type="date"
            className="input input-bordered w-full mb-2"
            value={announcementDate}
            onChange={(e) => setAnnouncementDate(e.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Link (Optional)"
            value={announcementLink}
            onChange={(e) => setAnnouncementLink(e.target.value)}
          />
          <input
            type="file"
            className="file-input file-input-bordered w-full mb-2"
            onChange={handleAnnouncementImageChange}
          />
        </EditModal>
      )}

      {/* Edit Modal for Important Links */}
      {isLinkModalOpen && (
        <EditModal
          title={editingLink ? "Edit Link" : "Add Link"}
          onSubmit={handleLinkSubmit}
          onCancel={closeLinkModal}
        >
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Link Title"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Link URL (https://example.com)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </EditModal>
      )}

      {/* View Modal for Announcement */}
      {isViewModalOpen && viewAnnouncement && (
        <ViewModal title={viewAnnouncement.title} onClose={closeViewModal}>
          {viewAnnouncement.image ? (
            <img
              src={viewAnnouncement.image}
              alt={viewAnnouncement.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <p>No image available.</p>
          )}
          {viewAnnouncement.date && (
            <p className="text-sm text-gray-500 mb-2">
              Event Date:{" "}
              {new Date(viewAnnouncement.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
          {viewAnnouncement.createdAt && (
            <p className="text-xs text-gray-400 mb-2">
              Posted on:{" "}
              {new Date(viewAnnouncement.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
          )}
          <p className="text-gray-700">{viewAnnouncement.description}</p>
          {viewAnnouncement.link && (
            <a
              href={viewAnnouncement.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline mt-4 block"
            >
              Visit Link
            </a>
          )}
        </ViewModal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          message={`Are you sure you want to delete this ${
            deleteType === "announcement" ? "announcement" : "link"
          }?`}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default BannerAndAnnouncementManagement;
