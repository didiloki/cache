const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cacheSchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    ttl: {
        type: String,
        default: 5
    }
})

mongoose.model('caches', cacheSchema);