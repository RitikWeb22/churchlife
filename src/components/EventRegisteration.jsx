import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { createRegistration } from "../services/api"; // or wherever your POST function is
import { getFormFields } from "../services/eventFieldsApi";
import { getEventBanner } from "../services/eventBannerApi";
import "react-toastify/dist/ReactToastify.css";

const MergedRegistrationForm = () => {
  // Dynamic fields array from backend
  const [dynamicFields, setDynamicFields] = useState([]);
  // Holds the user’s input for each dynamic field
  const [dynamicData, setDynamicData] = useState({});

  // For the advanced "Event" field: store the selected event object to show below the dropdown
  const [selectedEventObj, setSelectedEventObj] = useState(null);

  // Banner state
  const [banner, setBanner] = useState({ title: "", image: "" });
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: fetch dynamic fields and banner
  useEffect(() => {
    async function fetchDynamicFields() {
      try {
        const fields = await getFormFields();
        setDynamicFields(fields);

        // Initialize dynamicData with empty strings
        const initialDynamic = {};
        fields.forEach((field) => {
          initialDynamic[field.label] = "";
        });
        setDynamicData(initialDynamic);
      } catch (error) {
        console.error("Error fetching dynamic fields:", error);
        toast.error("Failed to load form fields");
      }
    }

    async function fetchBanner() {
      try {
        const data = await getEventBanner();
        let imageUrl =
          data.image ||
          "https://via.placeholder.com/1200x400?text=Event+Registration";
        setBanner({
          title: data.title || "",
          image: imageUrl,
        });
        setBannerImageUrl(`${imageUrl}?t=${Date.now()}`); // cache-buster
      } catch (error) {
        console.error("Error fetching banner:", error);
        toast.error("Failed to load banner");
      }
    }

    fetchDynamicFields();
    fetchBanner();
  }, []);

  // Handle changes for non-event fields
  const handleDynamicChange = (e, fieldLabel) => {
    setDynamicData((prev) => ({ ...prev, [fieldLabel]: e.target.value }));
  };

  // Called when user picks an event from the "Event" dropdown
  const handleEventSelect = (field, eventName) => {
    // 1) Find the matching event object from field.options
    const eventObj = field.options.find((opt) => opt.name === eventName);
    // 2) Store the entire event object in dynamicData
    if (eventObj) {
      setDynamicData((prev) => ({ ...prev, [field.label]: eventObj }));
      setSelectedEventObj(eventObj);
    } else {
      // Reset if user selects empty
      setDynamicData((prev) => ({ ...prev, [field.label]: "" }));
      setSelectedEventObj(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: check required fields
    for (let field of dynamicFields) {
      if (field.required) {
        const val = dynamicData[field.label];
        // If it's an Event field, ensure we have an object
        if (field.label === "Event" && field.type === "dropdown") {
          if (!val || typeof val !== "object") {
            toast.error("Please select a valid event.");
            return;
          }
        } else if (!val || !val.toString().trim()) {
          toast.error(`Please fill in the required field: ${field.label}`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      // Submit dynamicData to your backend
      await createRegistration({ dynamicData });
      toast.success("Registration submitted successfully!");

      // Reset form
      const resetData = {};
      dynamicFields.forEach((f) => {
        resetData[f.label] = "";
      });
      setDynamicData(resetData);
      setSelectedEventObj(null);
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error(error.message || "Error submitting registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
      {/* Banner Section */}
      <div
        className="relative bg-center bg-cover h-64 flex items-center justify-center"
        style={{ backgroundImage: `url('${bannerImageUrl}')` }}
      >
        <div className="bg-black bg-opacity-10 absolute inset-0" />
        <h1 className="relative z-10 text-4xl text-white font-bold">
          {banner.title}
        </h1>
      </div>

      {/* Registration Form */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register for an Event
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {dynamicFields.map((field) => {
              const value = dynamicData[field.label];

              // If it's an Event dropdown with object-based options
              if (
                field.type === "dropdown" &&
                field.label === "Event" &&
                field.options?.[0] &&
                typeof field.options[0] === "object"
              ) {
                return (
                  <div key={field._id}>
                    <label className="block text-lg font-medium mb-1">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      value={
                        value && typeof value === "object" ? value.name : ""
                      }
                      onChange={(e) => handleEventSelect(field, e.target.value)}
                      className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select an event</option>
                      {field.options.map((opt, idx) => (
                        <option key={idx} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

                    {/* Show the advanced data below the dropdown if user selected an event */}
                    {selectedEventObj &&
                      value &&
                      typeof value === "object" &&
                      selectedEventObj.name === value.name && (
                        <div className="mt-3 p-3 border rounded bg-gray-50 dark:bg-gray-700">
                          {selectedEventObj.date && (
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                selectedEventObj.date
                              ).toLocaleDateString()}
                            </p>
                          )}
                          <p>
                            <strong>Place:</strong>{" "}
                            {selectedEventObj.placeType === "physical"
                              ? selectedEventObj.placeName || "Physical Venue"
                              : "Online"}
                          </p>
                          {selectedEventObj.amount && (
                            <p>
                              <strong>Amount:₹</strong>{" "}
                              {selectedEventObj.amount}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                );
              }

              // If it's a normal dropdown
              if (field.type === "dropdown") {
                return (
                  <div key={field._id}>
                    <label className="block text-lg font-medium mb-1">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => handleDynamicChange(e, field.label)}
                      className="select select-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Otherwise, text/email
              return (
                <div key={field._id}>
                  <label className="block text-lg font-medium mb-1">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type === "email" ? "email" : "text"}
                    value={value || ""}
                    onChange={(e) => handleDynamicChange(e, field.label)}
                    placeholder={`Enter ${field.label}`}
                    className="input input-bordered w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              );
            })}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Register Now"}
            </button>
          </form>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default MergedRegistrationForm;
