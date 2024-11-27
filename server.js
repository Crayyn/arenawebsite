import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";

const PORT = 3000;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxhgYXLDxVnmWBbzClvlkiis-e7ZcwQgs",
    authDomain: "mtuarenawebsite.firebaseapp.com",
    databaseURL: "https://mtuarenawebsite-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "mtuarenawebsite",
    storageBucket: "mtuarenawebsite.firebasestorage.app",
    messagingSenderId: "661123771329",
    appId: "1:661123771329:web:27cc71b0cb9a8ebad2dd40",
    measurementId: "G-K7ZPBF4Y5B"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const bookingsRef = ref(database, 'bookings');

// Helper function to get bookings
const getBookings = async () => {
    const bookingsSnapshot = await get(bookingsRef);
    return bookingsSnapshot.val() || {}; // Return the raw nested structure or an empty object
};

// Save a new booking
app.post('/book', async (req, res) => {
    const { class: selectedClass, week, day, time } = req.body;
    const newBooking = { class: selectedClass, week, day, time };

    // Store booking in the nested path
    await set(child(bookingsRef, `${week}/${day}/${time}`), newBooking);

    res.send({ message: 'Booking saved successfully!' });
});

// Get bookings for a specific week and day
app.get('/bookings', async (req, res) => {
    const { week, day } = req.query;
    const bookings = await getBookings(); // Get the raw nested structure

    let filteredBookings = [];

    // If both week and day are specified, extract the specific day's bookings
    if (week && day) {
        if (bookings[week] && bookings[week][day]) {
            filteredBookings = Object.values(bookings[week][day]);
        }
    }
    // If only week is specified, aggregate bookings for all days in the week
    else if (week) {
        if (bookings[week]) {
            for (const dayBookings of Object.values(bookings[week])) {
                filteredBookings = filteredBookings.concat(Object.values(dayBookings));
            }
        }
    }
    // If no filters are specified, return all bookings
    else {
        for (const weekBookings of Object.values(bookings)) {
            for (const dayBookings of Object.values(weekBookings)) {
                filteredBookings = filteredBookings.concat(Object.values(dayBookings));
            }
        }
    }

    res.json(filteredBookings);
});


// Serve the home page by default when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
