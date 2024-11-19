const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const bookingsFile = 'bookings.json';

// Load existing bookings or initialize an empty array if the file doesn’t exist
const getBookings = () => {
    if (fs.existsSync(bookingsFile)) {
        const fileContent = fs.readFileSync(bookingsFile, 'utf-8');
        return fileContent ? JSON.parse(fileContent) : [];
    } else {
        return [];
    }
};

// Save a new booking
app.post('/book', (req, res) => {
    const { class: selectedClass, week, day, time } = req.body;
    const newBooking = { class: selectedClass, week, day, time };

    const bookings = getBookings();
    bookings.push(newBooking);

    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
    res.send({ message: 'Booking saved successfully!' });
});

// Get bookings for a specific week and day
app.get('/bookings', (req, res) => {
    const { week, day } = req.query; // Get week and day from query parameters
    const bookings = getBookings();

    // Filter bookings by the selected week and day (if provided)
    const filteredBookings = bookings.filter(booking => 
        (week ? booking.week === week : true) && 
        (day ? booking.day === day : true)
    );
    res.json(filteredBookings); // Send the filtered bookings as JSON
});

// Serve the home page by default when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
