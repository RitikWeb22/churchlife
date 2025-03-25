// services/importantLinksApi.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com";

/**
 * Helper: Fetch CSRF token.
 * Sends a GET request to the CSRF endpoint and returns the token.
 * @returns {Promise<string>} The CSRF token.
 * @throws {Error} If fetching fails.
 */
export async function getCsrfToken() {
    const response = await fetch(`${BASE_URL}/csrf-token`, { credentials: "include" });
    if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
    }
    const data = await response.json();
    return data.csrfToken;
}

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
    const csrfToken = await getCsrfToken();
    const response = await fetch(`${BASE_URL}/important-links`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
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
    const csrfToken = await getCsrfToken();
    const response = await fetch(`${BASE_URL}/important-links/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
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
    const csrfToken = await getCsrfToken();
    const response = await fetch(`${BASE_URL}/important-links/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to delete link");
    }
    return await response.json();
}
