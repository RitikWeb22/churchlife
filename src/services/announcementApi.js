const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://churchbackendlife.onrender.com/api";

export async function getAnnouncements() {
    try {
        const response = await fetch(`${BASE_URL}/announcements`, { credentials: "include" });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch announcements: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in getAnnouncements:", error);
        throw error;
    }
}

export async function createAnnouncement(payload, imageFile, bannerImageFile) {
    try {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("description", payload.description);
        formData.append("date", payload.date || "");
        formData.append("link", payload.link || "");

        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (bannerImageFile) {
            formData.append("bannerImage", bannerImageFile);
        }

        const response = await fetch(`${BASE_URL}/announcements`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create announcement: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in createAnnouncement:", error);
        throw error;
    }
}

export async function updateAnnouncement(id, payload, imageFile, bannerImageFile) {
    try {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("description", payload.description);
        formData.append("date", payload.date || "");
        formData.append("link", payload.link || "");

        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (bannerImageFile) {
            formData.append("bannerImage", bannerImageFile);
        }

        const response = await fetch(`${BASE_URL}/announcements/${id}`, {
            method: "PUT",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update announcement: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in updateAnnouncement:", error);
        throw error;
    }
}

export async function deleteAnnouncement(id) {
    try {
        const response = await fetch(`${BASE_URL}/announcements/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete announcement: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in deleteAnnouncement:", error);
        throw error;
    }
}
