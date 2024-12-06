/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    // Start loading animation.
    loadingGifElem.style.display = 'inline';

    try {
        const response = await fetch('/check-db-connection', {
            method: "GET"
        });

        // Hide the loading GIF once the response is received.
        loadingGifElem.style.display = 'none';
        statusElem.style.display = 'inline';

        // Parse the JSON response to extract only the "status" field.
        const data = await response.json();
        statusElem.textContent = data.status //change to data.db_details.user to get Oracle user name
    } catch (error) {
        loadingGifElem.style.display = 'none';
        statusElem.style.display = 'inline';
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    }
}

// Fetches data from the demotable and displays it.
// async function fetchAndDisplayUsers() {
//     const tableElement = document.getElementById('demotable');
//     const tableBody = tableElement.querySelector('tbody');

//     const response = await fetch('/demotable', {
//         method: 'GET'
//     });

//     const responseData = await response.json();
//     const demotableContent = responseData.data;

//     // Always clear old, already fetched data before new fetching process.
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }

//     demotableContent.forEach(user => {
//         const row = tableBody.insertRow();
//         user.forEach((field, index) => {
//             const cell = row.insertCell(index);
//             cell.textContent = field;
//         });
//     });
// }

// This function resets or initializes all tables.
async function resetTables() {
    const response = await fetch("/initiate-all-tables", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "All tables initiated successfully!";
        // fetchTableData();
    } else {
        alert("Error initiating tables!");
    }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
     checkDbConnection();
    //  fetchTableData();

    document.getElementById("resetTables").addEventListener("click", resetTables);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency. 
// function fetchTableData() {
//     fetchAndDisplayUsers();
// }


// Our Project
async function populateTableDropdown() {
    const dropdown = document.getElementById('tableDropdown');

    try {
        const response = await fetch('/fetchTableNames');
        const data = await response.json();

        // Clear existing options in case this is not the first load
        dropdown.innerHTML = '<option value="" disabled selected>Select a table</option>';

        // Populate dropdown with table names
        data.data.forEach(tableNameArray => {
            const option = document.createElement('option');
            option.value = tableNameArray[0];
            option.textContent = tableNameArray[0];
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching table names:', error);
    }
}

// Populate the Dropdown with existing tables to show the table ON PAGE LOAD
//Write the functions you want to run whenever the page loads here :>
document.addEventListener('DOMContentLoaded', () => {
    populateTableDropdown();
//    displayVehicles(); //always display table of Vehicles for updateVehicles feature, auto update on page load

    const dropdown = document.getElementById('tableDropdown');
    const tableDisplay = document.getElementById('tableDisplay');

    dropdown.addEventListener('change', async (event) => {
        const tableName = event.target.value;

        try {
            const response = await fetch(`/getTableData?table=${tableName}`);
            const data = await response.json();

            tableDisplay.innerHTML = '';

            // create a table dynamically if data exist, if not catch errors
            if (data.data_status == "success") {
                const table = document.createElement('table');

                // HEADERS
                const headers = Object.keys(data.table_data[0]);
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                table.appendChild(headerRow);

                // ROWS
                data.table_data.forEach(row => {
                    const tr = document.createElement('tr');
                    headers.forEach(header => {
                        const td = document.createElement('td');
                        td.textContent = row[header];
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });

                tableDisplay.appendChild(table);
            } else if (data.data_status == "empty") {
                tableDisplay.textContent = 'No data found for this table.';
            } else {
                tableDisplay.textContent = data.data_status;
            }

        } catch (error) {
            console.error('Error fetching table data:', error);
            tableDisplay.textContent = 'Error loading data.';
        }
    });
});