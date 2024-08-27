const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;  // 9876 as specified in the problem statement

app.use(express.json());

const windowSize = 15; //custom window size
let windowPrevState = [];
let windowCurrState = [];

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    let numbers = [];

    try {
        // Fetch numbers from the appropriate API based on numberid
        switch (numberid) {
            case 'p': // Prime numbers
                numbers = await getNumbersFromAPI('primes');
                break;
            case 'f': // Fibonacci numbers
                numbers = await getNumbersFromAPI('fibo');
                break;
            case 'e': // Even numbers
                numbers = await getNumbersFromAPI('even');
                break;
            case 'r': // Random numbers
                numbers = await getNumbersFromAPI('rand');
                break;
            default:
                return res.status(400).json({ error: 'Invalid number ID' });
        }

        
        numbers = [...new Set(numbers)];

        // if the API response took longer than 500 ms
        if (numbers.length === 0) {
            return res.status(500).json({ error: 'No numbers retrieved from API' });
        }

        // Update the window state
        windowPrevState = [...windowCurrState];
        windowCurrState = [...windowPrevState, ...numbers].slice(-windowSize);

        //  average of the numbers in the current state
        const avg = calculateAverage(windowCurrState);

        //  response
        return res.json({
            windowPrevState,
            windowCurrState,
            numbers,
            avg
        });
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return res.status(500).json({ error: 'Failed to fetch numbers' });
    }
});

async function getNumbersFromAPI(endpoint) {
    const url = `http://20.244.56.144/test/${endpoint}`;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NzQxODY0LCJpYXQiOjE3MjQ3NDE1NjQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjllMDdmMDBhLTFlMzMtNGE5Zi04MjQzLWZhZDAzNTE1MWMxYSIsInN1YiI6InNkZXZ1bGFwQGdpdGFtLmluIn0sImNvbXBhbnlOYW1lIjoiR0lUQU0iLCJjbGllbnRJRCI6IjllMDdmMDBhLTFlMzMtNGE5Zi04MjQzLWZhZDAzNTE1MWMxYSIsImNsaWVudFNlY3JldCI6IldGVHBXYkVqQkxOVFlKaWIiLCJvd25lck5hbWUiOiJEZXZ1bGFwYWxsaSBTYWkgU3VyeWEgU2FrZXRoIiwib3duZXJFbWFpbCI6InNkZXZ1bGFwQGdpdGFtLmluIiwicm9sbE5vIjoiVlUyMUNTRU4wMTAwNDQ4In0.wLPqgc_GE5-gISQq5jLsrxHt2O7N2gBggs-ER8e1iwE';
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 500
        });

        // Log the full response for debugging
        console.log(`API Response from ${endpoint}:`, response.data);

        // Check if the response contains numbers and return them
        if (response.data && Array.isArray(response.data.numbers) && response.data.numbers.length > 0) {
            return response.data.numbers;
        } else {
            console.error(`No numbers found in the response from ${endpoint}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching numbers from ${endpoint}:`, error.message);
        return [];
    }
}


function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
