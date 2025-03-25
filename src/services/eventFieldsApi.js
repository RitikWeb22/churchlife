// services/eventFieldsApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com/api";

/**
 * Helper: Fetch CSRF Token.
 * Sends a GET request to the CSRF endpoint and returns the token.
 */
export const getCsrfToken = async () => {
    try {
        const { data } = await axios.get(`${API_BASE}/csrf-token`, { withCredentials: true });
        return data.csrfToken;
    } catch (error) {
        console.error("Error fetching CSRF token:", error.response?.data || error.message);
        throw new Error("Failed to fetch CSRF token");
    }
};

/**
 * Fetch all dynamic event form fields.
 * GET /api/event-fields
 *
 * @returns {Promise<Object[]>} Array of form fields.
 */
export async function getFormFields() {
    try {
        const response = await axios.get(`${API_BASE}/event-fields`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching form fields:", error.response?.data || error.message);
        throw new Error("Failed to fetch form fields");
    }
}

/**
 * Create a new event form field.
 * POST /api/event-fields
 * 
 * @param {Object} fieldData - Data for the new field (e.g., { label, type, options: [] }).
 * @returns {Promise<Object>} The created field.
 */
export async function createFormField(fieldData) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${API_BASE}/event-fields`, fieldData, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating form field:", error.response?.data || error.message);
        throw new Error("Failed to create form field");
    }
}

/**
 * Update an existing event form field.
 * PUT /api/event-fields/:id
 * 
 * @param {string} fieldId - The ID of the field to update.
 * @param {Object} fieldData - Updated data for the field.
 * @returns {Promise<Object>} The updated field.
 */
export async function updateFormField(fieldId, fieldData) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.put(`${API_BASE}/event-fields/${fieldId}`, fieldData, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating form field:", error.response?.data || error.message);
        throw new Error("Failed to update form field");
    }
}

/**
 * Delete an event form field.
 * DELETE /api/event-fields/:id
 * 
 * @param {string} fieldId - The ID of the field to delete.
 * @returns {Promise<Object>} The deletion result.
 */
export async function deleteFormField(fieldId) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.delete(`${API_BASE}/event-fields/${fieldId}`, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting form field:", error.response?.data || error.message);
        throw new Error("Failed to delete form field");
    }
}

/**
 * Update the ordering of dynamic event form fields.
 * PUT /api/event-fields/order
 * 
 * @param {Array} orderArray - An array representing the new ordering.
 * @returns {Promise<Object>} The update result.
 */
export async function updateDynamicFieldOrdering(orderArray) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.put(`${API_BASE}/event-fields/order`, orderArray, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating field ordering:", error.response?.data || error.message);
        throw new Error("Failed to update field ordering");
    }
}
