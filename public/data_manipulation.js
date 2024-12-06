// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
     checkDbConnection();
     displayVehicles();

    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("insertPaymentSelection").addEventListener("submit", insertPaymentSelection);

    document.getElementById('deleteOperator').addEventListener('submit', deleteOperator);
    document.getElementById('updateVehicles').addEventListener('submit', updateVehicles);
    document.getElementById('displayVehicles').addEventListener('submit', displayVehicles);

};

//insert new records into People table
async function insertPaymentSelection(event) {
    event.preventDefault();
    const tableName = document.getElementById('tableName').value;
    const customerID = document.getElementById('customerID').value;
    const cardNumber = document.getElementById('cardNumber').value;

    const response = await fetch('/insert-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tableName: tableName,
            columns: ["customerID", "cardNumber"],
            values: [
                [customerID, cardNumber]
            ]
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        // Check if the error message contains a specific error from oracle
        if (responseData.message && responseData.message.includes('02291')) {
            messageElement.textContent = "Customer or Card Number doesn't exist! Try again!";
        } else if(responseData.message && responseData.message.includes('00001')){
            messageElement.textContent = "This Customer or Card has already been linked!";
        } else if (responseData.message && responseData.message.includes('01400')){
            messageElement.textContent = "Card Number or Customer ID missing!";
        } else {
            messageElement.textContent = responseData.message || "Error inserting data!";
        }
    }
}


// Function to delete an operator by employeeID
async function deleteOperator(event) {
    event.preventDefault(); 

    const employeeID = document.getElementById('employeeID').value;

    const response = await fetch('/delete-operator', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeID }) 
    });
    const responseData = await response.json();

    // errors
    const messageElement = document.getElementById('deleteResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Operator removed successfully!";
    } else {
        messageElement.textContent = responseData.message || "Error removing operator!";
    }
}

//created similarly to poulate Table dropdown
async function displayVehicles() {
    const tableDisplay = document.getElementById('displayVehicles');

    try {
        const response = await fetch('/getTableData?table=Vehicles');
        const data = await response.json();

        tableDisplay.innerHTML = '';

        if (data.data_status === "success") {
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
        } else if (data.data_status === "empty") {
            tableDisplay.textContent = 'No data found for Vehicles.';
        } else {
            tableDisplay.textContent = data.data_status;
        }

    } catch (error) {
        console.error('Error fetching table data:', error);
        tableDisplay.textContent = 'Error loading data.';
    }
}


async function updateVehicles(event) {
    event.preventDefault();
    
    const licensePlateNumber = document.getElementById('licensePlateNumber').value;  
    const capacity = document.getElementById('capacity').value;  
    const carbonEmission = document.getElementById('carbonEmission').value;   
    const VIN = document.getElementById('VIN').value;  

    // Object with the attributes to update IF value exists
    const updates = {};
    if (capacity) updates.capacity = capacity;  
    if (carbonEmission) updates.carbonEmission = carbonEmission; 
    if (VIN) updates.VIN = VIN;  

    const response = await fetch('/update-vehicle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            licensePlateNumber: licensePlateNumber,
            updates: updates
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateResultMsg');

    if (responseData.success) {
        displayVehicles(); //reload the table display when a row is updated
        messageElement.textContent = "Vehicle updated successfully!";
        fetchTableData();
    } else { //always want the error msg interpretation here cuz it's easier
        if (responseData.message.includes('ORA-00001')) {
            messageElement.textContent = "VIN already in use!"; 
        } else if (responseData.message.includes('non-existing')){
            messageElement.textContent = "Can't modify a non-existing vehicle!"; 
        } else {
            messageElement.textContent = responseData.message || "Error updating vehicle!";  
        }
    }
}
