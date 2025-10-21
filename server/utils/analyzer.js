import crypto from "crypto";


export const computeSHA256 = (text) => {
    return crypto.createHash("sha256").update(text).digest("hex");
};

export const normalizeText = (text) => text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().trim();

export const isPalindrome = (text) => {
    const normalized = normalizeText(text);
    const reversed = normalized.split("").reverse().join("");
    return normalized === reversed;
};

export const uniqueCharacters = (text) => {
    return new Set(normalizeText(text)).size;
};

export const countWords = (text) => {
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
};



export const getChrFrequency = (text) => {
    const freq = {};
    for (const char of normalizeText(text)) {
        freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
};