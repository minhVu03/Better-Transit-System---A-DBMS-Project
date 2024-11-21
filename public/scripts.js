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
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    console.log("HEHE");

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

async function projectFeedbackTable(event) {
    event.preventDefault();

    const projectedAttribute1 = document.getElementById('a1').value;
    const projectedAttribute2 = document.getElementById('a2').value;
    const projectedAttribute3 = document.getElementById('a3').value;
    const projectedAttribute4 = document.getElementById('a4').value;
    const combinedString = [projectedAttribute1, projectedAttribute2, projectedAttribute3, projectedAttribute4]
        .filter(value => value !== "None") // Filter out "None" values
        .join(',');
    console.log(combinedString)
    // TODO make sure to remove any duplicates from this list
    const response = await fetch('/project-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attributes: combinedString
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('projectResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data projected successfully!";
        fetchTableData();
//        displayProjectedFeedback()
    } else {
        messageElement.textContent = "Error projecting data!";
    }
}
// TODO THIS FUNCTION WILL BE CALLED IN projectFeedbackTable(event)
async function displayProjectedFeedback() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}


// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();

    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// SELECTION
async function selectionStops(event) {
    event.preventDefault();

    const selectedAttribute1 = document.getElementById('sa1').value;
//    const projectedAttribute2 = document.getElementById('a2').value;
//    const projectedAttribute3 = document.getElementById('a3').value;
//    const projectedAttribute4 = document.getElementById('a4').value;

    console.log(selectedAttribute1)

    const response = await fetch('/select-stops', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attributes: selectedAttribute1
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('selectResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data selected successfully!";
        fetchTableData();
//        displayProjectedFeedback()
    } else {
        messageElement.textContent = "Error selecting data!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}


//async function populateConditionDropdownSelection() {
//    const selectedAttribute = document.getElementById("a1").value;
//    const conditionDropdownOptions = [selectedAttribute];
//    const selectedAttribute2 = document.getElementByID("a2").value;
//    if (selectedAttribute2 != "None"){
//        conditionDropdownOptions.push(selectedAttribute2);
//    }
//    const selectedAttribute3 = document.getElementById("a3").value;
//    if (selectedAttribute3 != "None"){
//        conditionDropdownOptions.push(selectedAttribute3);
//    }
//    const selectedAttribute4 = document.getElementById("a4").value;
//    if (selectedAttribute4 != "None"){
//        conditionDropdownOptions.push(selectedAttribute4);
//    }
//
//    const selectedConditionAttribute = document.getElementById("conditionAttribute");
//    selectedAttribute.forEach((optionText) => {
//        const option = document.createElement("option");
//        option.value = optionText;
//        option.textContent = optionText;
//        selectedConditionAttribute.appendChild(option);
//        });
//}
//document.getElementById("selectAttributes").addEventListener("change", populateConditionDropdownSelection);




// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    // checkDbConnection();
    // fetchTableData();
    // document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    // document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    // document.getElementById("countDemotable").addEventListener("click", countDemotable);

    // document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);

    document.getElementById("insertPeople").addEventListener("submit", insertPeople);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency. //example code
function fetchTableData() {
    fetchAndDisplayUsers();
}


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

// Populate the Dropdown with existing tables to show the table
document.addEventListener('DOMContentLoaded', () => {
    populateTableDropdown();

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

 
//insert new records into People table
async function insertPeople(event) {
    event.preventDefault();
    const tableName = document.getElementById('tableName').value;
    const customerID = document.getElementById('customerID').value;
    const peopleName = document.getElementById('peopleName').value;
    const transitCardNumber = document.getElementById('transitCardNumber').value;

    
    const response = await fetch('/insert-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                tableName: tableName,
                columns: ["customerID", "peopleName", "transitCardNumber"],
                values: [
                    [customerID, peopleName, transitCardNumber]
                ]
            }
        )
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}