const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com";

/**
 * Fetch all important links.
 * GET /important-links
 * @returns {Promise<Object[]>} An array of important link objects.
 * @throws {Error} If the request fails.
 */
export async function getImportantLinks() {
    const response = await fetch(`${BASE_URL}/important-links`, { credentials: "include" });
    if (!response.ok) {
        throw new Error("Failed to fetch important links");
    }
    return await response.json();
}

/**
 * Create a new important link.
 * POST /important-links
 * @param {Object} payload - The data for the new link.
 * @returns {Promise<Object>} The created link object.
 * @throws {Error} If the request fails.
 */
export async function createImportantLink(payload) {
    const response = await fetch(`${BASE_URL}/important-links`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error("Failed to create link");
    }
    return await response.json();
}

/**
 * Update an existing important link.
 * PUT /important-links/:id
 * @param {string} id - The ID of the link to update.
 * @param {Object} payload - The updated data for the link.
 * @returns {Promise<Object>} The updated link object.
 * @throws {Error} If the request fails.
 */
export async function updateImportantLink(id, payload) {
    const response = await fetch(`${BASE_URL}/important-links/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error("Failed to update link");
    }
    return await response.json();
}

/**
 * Delete an important link.
 * DELETE /important-links/:id
 * @param {string} id - The ID of the link to delete.
 * @returns {Promise<Object>} The deletion result.
 * @throws {Error} If the request fails.
 */
export async function deleteImportantLink(id) {
    const response = await fetch(`${BASE_URL}/important-links/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to delete link");
    }
    return await response.json();
}
