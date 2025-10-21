import StringAnalysis from "../model/str.js";
import {
    computeSHA256,
    countWords,
    getChrFrequency,
    isPalindrome,
    uniqueCharacters,
} from "../utils/analyzer.js";

export const analyzzeString = async(req, res) => {
    try {

        const { value } = req.body;




        // console.log("Value of:", typeof value)
        // console.log("Value of:", typeof value)


        if (!value) {
            return res.status(400).json({
                success: false,
                message: "error: Invalid request body or missing 'value' field",
            });
        }

        if (typeof value !== "string") {
            return res.status(422).json({
                success: false,
                message: "error: Invalid data type for 'value' (must be a string)"
            })
        }

        const sha256_hash = computeSHA256(value);

        const existing = await StringAnalysis.findOne({ "properties.sha256_hash": sha256_hash });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "String already exist in the system",
            });
        }

        const properties = {

            length: value.length,
            is_palindrome: isPalindrome(value),
            unique_characters: uniqueCharacters(value),
            word_count: countWords(value),
            sha256_hash: sha256_hash,
            character_frequency_map: getChrFrequency(value),
        };

        const newAnalysis = new StringAnalysis({ value, properties })
        await newAnalysis.save();
        return res.status(201).json({
            id: properties.sha256_hash,

            value,
            properties,
            createdAt: newAnalysis.createdAt
        });
    } catch (error) {
        console.log("Error Analyzing string", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
};

export const getAllStrings = async(req, res) => {
    try {

        const {
            is_palindrome,
            min_length,
            max_length,
            word_count,
            contains_character,
        } = req.query;

        if ((min_length && isNaN(min_length)) ||
            (max_length && isNaN(max_length)) ||
            (word_count && isNaN(word_count)) ||
            (contains_character && contains_character.length !== 1)) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameter values or types"
            })

        }

        const query = {}

        if (is_palindrome !== undefined) {
            query["properties.is_palindrome"] = is_palindrome === "true"
        }

        if (word_count !== undefined) {
            query["properties.word_count"] = Number(word_count);
        }

        // Match string length range
        if (min_length || max_length) {
            query["properties.length"] = {};
            if (min_length) query["properties.length"].$gte = Number(min_length);
            if (max_length) query["properties.length"].$lte = Number(max_length);
        }

        // Contains character (case-insensitive search in value)
        if (contains_character) {
            query.value = new RegExp(contains_character, "i");
        }

        // Fetch data
        const results = await StringAnalysis.find(query);

        // Prepare filters object for response
        const filters_applied = {};
        if (is_palindrome !== undefined) filters_applied.is_palindrome = is_palindrome === "true";
        if (min_length) filters_applied.min_length = Number(min_length);
        if (max_length) filters_applied.max_length = Number(max_length);
        if (word_count) filters_applied.word_count = Number(word_count);
        if (contains_character) filters_applied.contains_character = contains_character;

        // Respond
        return res.status(200).json({
            data: results.map((doc) => ({
                id: doc.properties.sha256_hash,
                value: doc.value,
                properties: doc.properties,
                created_at: doc.createdAt,
            })),
            count: results.length,
            filters_applied,
        });







    } catch (error) {
        console.log("Error fetching strings", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const specificString = async(req, res) => {
    try {

        const { string_value } = req.params;

        if (!string_value || string_value.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid string value"
            })
        }

        const sha256_hash = computeSHA256(string_value);
        const found = await StringAnalysis.findOne({
            "properties.sha256_hash": sha256_hash
        });

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "String does not exist in the system"
            })
        } {
            return res.status(200).json({
                id: found.properties.sha256_hash,
                value: found.value,
                properties: found.properties,
                created_at: found.createdAt,
            })
        }



    } catch (error) {
        console.log("Error fetching string:", error)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })

    }
}


export const deleteString = async(req, res) => {
    try {
        const { string_value } = req.params;

        if (!string_value || typeof string_value !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing string_value parameter",
            });
        }


        const existing = await StringAnalysis.findOne({ value: string_value });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "String does not exist in the system",
            });
        }


        await StringAnalysis.deleteOne({ _id: existing._id });

        return res.status(204).send();
    } catch (error) {
        console.error("Error deleting string:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};