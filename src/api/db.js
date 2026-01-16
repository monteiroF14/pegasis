import { ValidationError } from "./error.js";

const API_BASE_URL = "http://localhost:3000";

async function handleResponse(response) {
    if (response.ok) {
        return response.json();
    }
    
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorMessage;
        } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
        }
    } catch (e) {
        // Fallback to default errorMessage
    }
    
    throw new Error(errorMessage);
}

export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
}

export async function getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
}

export async function getBadges() {
    const response = await fetch(`${API_BASE_URL}/badges`);
    return handleResponse(response);
}

export async function getBadgeById(id) {
    const response = await fetch(`${API_BASE_URL}/badges/${id}`);
    return handleResponse(response);
}

export async function getMarketData() {
    const response = await fetch(`${API_BASE_URL}/market`);
    return handleResponse(response);
}

export async function getMarketById(id) {
    const response = await fetch(`${API_BASE_URL}/market/${id}`);
    return handleResponse(response);
}

export async function addUser(user) {
    if (!user || typeof user !== "object") {
        throw new ValidationError("Invalid user object.");
    }
    const { id, name, balance, level, xp, badgeIds, goals } = user;

    if (typeof id !== 'string' || id.trim() === '') {
        throw new ValidationError('User ID must be a non-empty string.');
    }
    if (typeof name !== 'string' || name.trim() === '') {
        throw new ValidationError('User name must be a non-empty string.');
    }
    if (typeof balance !== 'number' || balance < 0) {
        throw new ValidationError('User balance must be a non-negative number.');
    }
    if (typeof level !== 'number' || level < 0) {
        throw new ValidationError('User level must be a non-negative number.');
    }
    if (typeof xp !== 'number' || xp < 0) {
        throw new ValidationError('User XP must be a non-negative number.');
    }
    if (!Array.isArray(badgeIds) || !badgeIds.every(bid => typeof bid === 'number')) {
        throw new ValidationError('User badgeIds must be an array of numbers.');
    }
    if (!Array.isArray(goals) || !goals.every(g => 
        typeof g.description === 'string' && g.description.trim() !== '' &&
        typeof g.xp === 'number' && g.xp >= 0 &&
        typeof g.currentXp === 'number' && g.currentXp >= 0
    )) {
        throw new ValidationError('User goals must be an array of valid Goal objects.');
    }

    // NOTE: assume the API handles duplicates
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
    return handleResponse(response);
}

export async function addMarket(market) {
    if (!market || typeof market !== "object") {
        throw new ValidationError("Invalid market object.");
    }
    const { id } = market;

    if (typeof id !== 'string' && typeof id !== 'number') {
        throw new ValidationError('Market ID must be a string or number.');
    }

    // Server should handle duplicate ID checks
    const response = await fetch(`${API_BASE_URL}/market`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(market),
    });
    return handleResponse(response);
}

export async function addBadge(badge) {
    if (!badge || typeof badge !== "object") {
        throw new ValidationError("Invalid badge object.");
    }
    const { id, description, date } = badge;

    if (typeof id !== 'number') {
        throw new ValidationError('Badge ID must be a number.');
    }
    if (typeof description !== 'string' || description.trim() === '') {
        throw new ValidationError('Badge description must be a non-empty string.');
    }
    if (!(date instanceof Date) && isNaN(new Date(date).getTime())) {
        throw new ValidationError('Badge date must be a valid Date object or a parsable date string.');
    }

    // Server should handle duplicate ID checks
    const response = await fetch(`${API_BASE_URL}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badge),
    });
    return handleResponse(response);
}

export async function updateMarketFields(market) {
    if (!market || !market.id) {
        throw new ValidationError("Invalid market object for update.");
    }
    
    // Allow updating any field passed in market object
    const response = await fetch(`${API_BASE_URL}/market/${market.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(market),
    });
    return handleResponse(response);
}

export async function upsertMarket(market) {
    try {
        await getMarketById(market.id);
        return await updateMarketFields(market);
    } catch (error) {
        // If 404, add it.
        // handleResponse throws Error with status text if not ok.
        // We assume 404 means not found.
        if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
             return await addMarket(market);
        }
        throw error;
    }
}
