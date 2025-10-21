import mongoose from "mongoose";

const analyzerSchema = new mongoose.Schema({

    value: {
        type: String,
        required: true,
    },

    properties: {
        length: Number,

        is_palindrome: Boolean,

        unique_characters: Number,

        word_count: Number,

        sha256_hash: String,

        character_frequency: Object,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

analyzerSchema.index({ "properties.sha256_hash": 1 }, { unique: true });


const StringAnalysis = mongoose.model("StringAnalysis", analyzerSchema);
export default StringAnalysis;