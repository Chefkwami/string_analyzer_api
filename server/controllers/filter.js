import StringAnalysis from "../model/str.js";


const parseNaturalLanguageQuery = (query) => {
    const lower = query.toLowerCase();
    const filters = {};


    if (lower.includes("palindrome") || lower.includes("palindromic")) {
        filters.is_palindrome = true;
    }


    if (lower.includes("single word") || lower.includes("one word")) {
        filters.word_count = 1;
    } else {
        const wordCountMatch = lower.match(/(\d+)\s+word/);
        if (wordCountMatch) filters.word_count = parseInt(wordCountMatch[1]);
    }


    const longerMatch = lower.match(/longer than (\d+)\s*characters?/);
    if (longerMatch) filters.min_length = parseInt(longerMatch[1]) + 1;

    const shorterMatch = lower.match(/shorter than (\d+)\s*characters?/);
    if (shorterMatch) filters.max_length = parseInt(shorterMatch[1]) - 1;

    const exactMatch = lower.match(/exactly (\d+)\s*characters?/);
    if (exactMatch) {
        filters.min_length = parseInt(exactMatch[1]);
        filters.max_length = parseInt(exactMatch[1]);
    }

    const containsMatch = lower.match(/contain(?:s)?(?: the letter)?\s+([a-z])/);
    if (containsMatch) filters.contains_character = containsMatch[1];


    if (lower.includes("first vowel")) {
        filters.contains_character = "a";
    }

    return filters;
};


export const filterByNaturalLanguage = async(req, res) => {
    try {
        const { query } = req.query;


        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid 'query' parameter",
            });
        }


        const filters = parseNaturalLanguageQuery(query);

        if (Object.keys(filters).length === 0) {
            return res.status(422).json({
                success: false,
                message: "Could not interpret query meaningfully.",
                interpreted_query: { original: query },
            });
        }

        const mongoQuery = {};

        if (filters.is_palindrome !== undefined)
            mongoQuery["properties.is_palindrome"] = filters.is_palindrome;

        if (filters.word_count !== undefined)
            mongoQuery["properties.word_count"] = filters.word_count;

        if (filters.min_length || filters.max_length) {
            mongoQuery["properties.length"] = {};
            if (filters.min_length)
                mongoQuery["properties.length"].$gte = filters.min_length;
            if (filters.max_length)
                mongoQuery["properties.length"].$lte = filters.max_length;
        }

        if (filters.contains_character) {
            mongoQuery.value = new RegExp(filters.contains_character, "i");
        }

        console.log("🧩 Parsed filters:", filters);
        console.log("🧮 MongoDB Query:", JSON.stringify(mongoQuery, null, 2));

        // Fetch matching records
        const results = await StringAnalysis.find(mongoQuery);


        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching strings found.",
                interpreted_query: {
                    original: query,
                    parsed_filters: filters,
                },
            });
        }


        return res.status(200).json({
            success: true,
            count: results.length,
            data: results.map((doc) => ({
                value: doc.value,
                properties: {
                    ...doc.properties,
                    sha256_hash: doc.properties.sha256_hash,
                },
                created_at: doc.createdAt,
            })),
            interpreted_query: {
                original: query,
                parsed_filters: filters,
            },
        });
    } catch (error) {
        console.error("Error filtering by natural language:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};