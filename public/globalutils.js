/*
    Used for varoius javascript functions/variables that
    are helpful for multiple pages
*/

// The server address, changing this will change which
// address all fetch requests use
// If you choose to host on a port other than port 80
// make sure to change it here too, not just in the
// server code
const serverAddress = 'http://localhost';

// Whether an object is empty
const isEmpty = obj => Object.keys(obj).length === 0;

// Finds the user ID cookie value
const locateID = cookie => cookie.match(/simplecmsloggedin=(\d+)/).toString().substring(18, cookie.length);
