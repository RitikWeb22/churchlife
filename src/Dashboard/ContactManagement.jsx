import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  getContacts,
  getContactBanner,
  uploadContactBanner,
  deleteContact,
} from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";

const ContactManagement = () => {
  // Contact banner state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Contacts state (fetched from backend)
  const [contacts, setContacts] = useState([]);

  // Fetch contacts and contact banner on mount
  useEffect(() => {
    fetchContactsData();
    fetchBannerData();
  }, []);

  const fetchContactsData = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    }
  };

  const fetchBannerData = async () => {
    try {
      const data = await getContactBanner();
      if (data.image) {
        setBannerPreview(data.image);
      }
    } catch (error) {
      console.error("Error fetching contact banner:", error);
      toast.error("Failed to fetch contact banner");
    }
  };

  // Handle banner image selection
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      // Show preview using a temporary URL
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // Upload contact banner image to backend
  const handleUploadBanner = async () => {
    if (!bannerFile) {
      alert("Please select a file to upload.");
      return;
    }
    try {
      const data = await uploadContactBanner(bannerFile);
      // Update preview with the URL returned from backend
      if (data && data.image) {
        setBannerPreview(data.image);
      }
      toast.success("Banner image uploaded successfully!");
      // Re-fetch contacts in case the banner data affects the contacts view
      fetchContactsData();
    } catch (error) {
      console.error("Error uploading contact banner:", error);
      toast.error("Failed to upload contact banner");
    }
  };

  // Delete contact handler using interactive toast confirmation
  const handleDeleteContact = (contactId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this contact?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="btn btn-sm btn-error"
              onClick={async () => {
                try {
                  toast.info("Deleting contact...");
                  await deleteContact(contactId);
                  toast.success("Contact deleted successfully!");
                  fetchContactsData();
                } catch (error) {
                  console.error("Error deleting contact:", error);
                  toast.error("Failed to delete contact");
                }
                closeToast();
              }}
            >
              Yes
            </button>
            <button className="btn btn-sm" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  // Export contacts data to Excel
  const exportToExcel = () => {
    if (!contacts || contacts.length === 0) {
      toast.error("No records to export");
      return;
    }
    const dataToExport = contacts.map((contact, index) => ({
      "S.No": index + 1,
      Name: contact.name,
      Email: contact.email,
      Phone: contact.phone,
      Subject: contact.subject,
      Message: contact.message,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "contacts.xlsx");
    toast.success("Contacts exported to Excel successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className="text-3xl font-bold text-center mb-6">
        Contact Management
      </h1>

      {/* Contact Banner Upload Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Contact Banner Upload</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full md:w-1/2"
            onChange={handleBannerChange}
          />
          <button
            className="btn btn-primary"
            onClick={handleUploadBanner}
            disabled={!bannerFile}
          >
            Upload Banner
          </button>
        </div>
        {bannerPreview && (
          <div className="mt-4">
            <img
              src={bannerPreview}
              alt="Contact Banner Preview"
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Contacts Table Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Details</h2>
          <button className="btn btn-success" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((contact, index) => (
                  <tr key={contact._id || contact.id}>
                    <td>{index + 1}</td>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.subject}</td>
                    <td>{contact.message}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-error flex items-center gap-1"
                        onClick={() =>
                          handleDeleteContact(contact._id || contact.id)
                        }
                      >
                        <FaTrash />
                        <span className="hidden md:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;
