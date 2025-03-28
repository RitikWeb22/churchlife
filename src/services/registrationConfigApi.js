import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com";

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
        const res = await axios.put(`${BASE_URL}/registration-config`, configData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.error("Error updating registration configuration:", error.response?.data || error.message);
        throw new Error("Failed to update registration configuration");
    }
}
