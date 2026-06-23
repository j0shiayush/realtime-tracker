const mongoose = require("mongoose");

const trackingSessionSchema = new mongoose.Schema({
    sessionId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    pathHistory: [{
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("TrackingSession", trackingSessionSchema);