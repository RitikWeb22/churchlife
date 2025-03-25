// services/eventRegistrationsApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com/api";

/**
 * Helper: Fetch CSRF token.
 * @returns {Promise<string>} The CSRF token.
 * @throws {Error} If the token retrieval fails.
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
 * Fetch all event registrations.
 * GET /api/event-registrations
 * @returns {Promise<Object[]>} Array of registration objects.
 * @throws {Error} If fetching fails.
 */
export async function getRegistrations() {
    try {
        const response = await axios.get(`${API_BASE}/event-registrations`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching event registrations:", error.response?.data || error.message);
        throw new Error("Failed to fetch event registrations");
    }
}

/**
 * Delete an event registration by ID.
 * DELETE /api/event-registrations/:id
 * @param {string} regId - The ID of the registration to delete.
 * @returns {Promise<Object>} Response data.
 * @throws {Error} If deletion fails.
 */
export async function deleteRegistration(regId) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await axios.delete(`${API_BASE}/event-registrations/${regId}`, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting event registration:", error.response?.data || error.message);
        throw new Error("Failed to delete event registration");
    }
}

// Optionally, add a createRegistration endpoint if needed.
