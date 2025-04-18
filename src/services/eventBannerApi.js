import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com";

/**
 * Fetches the Event Banner.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} - The event banner data.
 * @throws {Error} - If the request fails.
 */
export async function getEventBanner(token) {
    try {
        const response = await axios.get(`${BASE_URL}/event-banner`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching event banner:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch event banner");
    }
}

/**
 * Updates the Event Banner.
 * @param {string} title - The title of the banner.
 * @param {File} imageFile - The image file for the banner.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} - The updated event banner data.
 * @throws {Error} - If the request fails.
 */
export async function updateEventBanner(title, imageFile, token) {
    try {
        const formData = new FormData();
        formData.append("title", title);
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await axios.put(`${BASE_URL}/event-banner`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating event banner:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update event banner");
    }
}
