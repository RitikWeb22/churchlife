// services/registrationConfigApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com";

/**
 * Helper: Fetch CSRF Token.
 * Sends a GET request to the CSRF endpoint and returns the token.
 * @returns {Promise<string>} The CSRF token.
 * @throws {Error} If fetching fails.
 */
export const getCsrfToken = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
        return data.csrfToken;
    } catch (error) {
        console.error("Error fetching CSRF token:", error.response?.data || error.message);
        throw new Error("Failed to fetch CSRF token");
    }
};

/**
 * Fetch the registration configuration.
 * GET /registration-config
 * @returns {Promise<Object>} The registration configuration.
 * @throws {Error} If the request fails.
 */
export async function getRegistrationConfig() {
    try {
        const response = await axios.get(`${BASE_URL}/registration-config`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching registration configuration:", error.response?.data || error.message);
        throw new Error("Failed to fetch registration configuration");
    }
}

/**
 * Update the registration configuration.
 * PUT /registration-config
 * @param {Object} configData - The new configuration data.
 * @returns {Promise<Object>} The updated registration configuration.
 * @throws {Error} If the request fails.
 */
export async function updateRegistrationConfig(configData) {
    try {
        const csrfToken = await getCsrfToken();
        const res = await axios.put(`${BASE_URL}/registration-config`, configData, {
            headers: { "x-csrf-token": csrfToken },
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.error("Error updating registration configuration:", error.response?.data || error.message);
        throw new Error("Failed to update registration configuration");
    }
}
