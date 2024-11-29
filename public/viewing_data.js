
async function projectFeedbackTable(event) {
    event.preventDefault();

    const projectedAttribute1 = document.getElementById('a1').value;
    const projectedAttribute2 = document.getElementById('a2').value;
    const projectedAttribute3 = document.getElementById('a3').value;
    const projectedAttribute4 = document.getElementById('a4').value;

    const selectedColumns = [projectedAttribute1, projectedAttribute2, projectedAttribute3, projectedAttribute4]
        .filter(value => value !== "None");
    const uniqueSelectedColumns = [...new Set(selectedColumns)];
    const combinedString = uniqueSelectedColumns.join(',');
    console.log(combinedString)

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
        displayProjectedFeedback(responseData, uniqueSelectedColumns);
    } else {
        messageElement.textContent = "Error projecting data!";
    }
}

async function displayProjectedFeedback(data, selectedColumns) {
    const projectTableContent = data.data
    const tableElement = document.getElementById('projectTableDisplay');
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');
    const headRow = tableHead.querySelector('tr');

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (headRow) {
        headRow.innerHTML = '';
    }


    selectedColumns.forEach(column => {
        const colCell = document.createElement("th");
        colCell.textContent = column;
        headRow.appendChild(colCell);
        })

    projectTableContent.rows.forEach(tuple => {
        const row = tableBody.insertRow();
        tuple.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });
}

// SELECTION
async function selectionStops(event) {
    event.preventDefault();
    const selectedAttributes = getSelectionAttributes();
    const selectedAttributesStr = selectedAttributes.join(',');
    const messageElement = document.getElementById('selectResultMsg');

    const conditions = [];
    var firstConditionAttribute = document.getElementById("conditionAttribute").value;
    var firstConditionComparison = document.getElementById("comparison").value;

    var firstConditionValue = document.getElementById("conditionValue").value;
    if (firstConditionAttribute == '' || firstConditionComparison == '' || firstConditionValue == '') {
        messageElement.textContent = 'Please fill in empty fields';
        return;
    }

    if (firstConditionAttribute == 'stopID' || firstConditionAttribute == 'maxCapacity') {
        if (isNaN(Number(firstConditionValue))) {
            messageElement.textContent = "Cannot filter by string value";
            return;
        } else {
            firstConditionValue = Number(firstConditionValue);
        }
    } else {

        firstConditionValue = "'" + firstConditionValue + "'";
    }

    const firstCondition = firstConditionAttribute + " " + firstConditionComparison + " " + firstConditionValue;
    conditions.push(firstCondition);

    const extraConditions = document.getElementById("extraConditions");
    if (extraConditions.children.length > 0) {
        for (let i = 1; i <= extraConditions.children.length; i++) {
            const andOr = document.getElementById("andOr" + i);
            var extraConditionAttribute = document.getElementById("extraConditionAttributeDropdown" + i).value;
            var extraConditionComparison = document.getElementById("extraConditionComparisonDropdown" + i).value;
            var extraConditionValue = document.getElementById("extraConditionText" + i).value;
            if (extraConditionAttribute == '' || extraConditionComparison == '' || extraConditionValue == '' || andOr == '') {
                messageElement.textContent = 'Please fill in empty fields';
                return;
            }
            if (extraConditionAttribute == 'stopID' || extraConditionAttribute == 'maxCapacity') {
                if (isNaN(Number(extraConditionValue))) {
                    messageElement.textContent = 'Cannot filter by string value';
                    return;
                } else {
                    extraConditionValue = Number(extraConditionValue);
                }
            } else {
                extraConditionValue = "'" + extraConditionValue + "'";
            }

            const extraCondition = andOr.value + " " + extraConditionAttribute + " " + extraConditionComparison + " " + extraConditionValue + " ";
            conditions.push(extraCondition);
        }
    }
    const uniqueConditions = [...new Set(conditions)];
    const conditionsStr = uniqueConditions.join(' ');

    const response = await fetch('/select-stops', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            selectedAttributes: selectedAttributesStr,
            condition: conditionsStr
        })
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.innerHTML = "";
        messageElement.textContent = "Data selected successfully!";
        displaySelectedTable(responseData, selectedAttributes);
    } else {
        messageElement.textContent = "Error selecting data!";
    }
}

async function displaySelectedTable(data, columns) {
    const selectedTableContent = data.data
    const tableElement = document.getElementById('selectTableDisplay');
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');
    const headRow = tableHead.querySelector('tr');

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (headRow) {
        headRow.innerHTML = '';
    }

    columns.forEach(column => {
        const colCell = document.createElement("th");
        colCell.textContent = column;
        headRow.appendChild(colCell);
        });

    if (selectedTableContent.rows.length > 0) {
        selectedTableContent.rows.forEach(tuple => {
        const row = tableBody.insertRow();
        tuple.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
            });
        });
    };

}
// SELECTION HELPER FUNCTIONS
function getSelectionAttributes(){
// determines which attributes user wants to SELECT for selection query
    const selectedAttribute = document.getElementById("sa1").value;
    const conditionDropdownOptions = [selectedAttribute];
    const selectedAttribute2 = document.getElementById("sa2").value;
    if (selectedAttribute2 !== "None"){
        conditionDropdownOptions.push(selectedAttribute2);
    }
    const selectedAttribute3 = document.getElementById("sa3").value;
    if (selectedAttribute3 !== "None"){
        conditionDropdownOptions.push(selectedAttribute3);
    }
    const selectedAttribute4 = document.getElementById("sa4").value;
    if (selectedAttribute4 !== "None"){
        conditionDropdownOptions.push(selectedAttribute4);
    }

    const uniqueConditionalDropdownOptions = [...new Set(conditionDropdownOptions)];
    return uniqueConditionalDropdownOptions;
}

function addOptionsToDropdown(dropdownMenu, options) {
    // populates given dropdownMenu with given options
    dropdownMenu.innerHTML = '';
    const defaultOption = document.createElement("option");
    dropdownMenu.appendChild(defaultOption);
    options.forEach(optionText => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    dropdownMenu.appendChild(option);
    });
    return dropdownMenu;
};

function determineComparisonOptions(selectedAttribute) {
    // given selectedAttribute, determines which comparison option matches
    const comparisonDropdownOptions = [];
    if ((selectedAttribute === "stopAddress") || (selectedAttribute === "stopName")) {
        comparisonDropdownOptions.push("=");
    } else {
        comparisonDropdownOptions.push("=");
        comparisonDropdownOptions.push("<");
        comparisonDropdownOptions.push(">");
        comparisonDropdownOptions.push("<=");
        comparisonDropdownOptions.push(">=");
        comparisonDropdownOptions.push("<>");
    }
    return comparisonDropdownOptions;
}

async function populateComparisonDropdownSelection() {
    // populates main comparison dropdown menu with given attribute
    const selectedAttribute = document.getElementById("conditionAttribute").value;
    const comparisonDropdownOptions = determineComparisonOptions(selectedAttribute);

    const comparisonDropdown = addOptionsToDropdown(document.getElementById("comparison"), comparisonDropdownOptions);
}

async function addMoreConditions() {
// adds more filtering condition/WHERE input
    extraConditions = document.getElementById("extraConditions");
    const extraInput = document.createElement("div");
    const conditionIDNumber = extraConditions.children.length + 1;
    // AND/OR

    const andOrDropdown = addOptionsToDropdown(document.createElement("select"), ['AND', 'OR']);
    andOrDropdown.id = "andOr" + conditionIDNumber;

    extraInput.appendChild(andOrDropdown);
    // attribute field

    const extraConditionAttributeDropdown = addOptionsToDropdown(document.createElement("select"),
                                                                 ["stopAddress", "maxCapacity", "stopID",
                                                                  "stopName"]);
    extraConditionAttributeDropdown.id = "extraConditionAttributeDropdown" + conditionIDNumber;
    extraInput.appendChild(extraConditionAttributeDropdown);

    const extraConditionComparisonDropdown = document.createElement("select");

    extraConditionAttributeDropdown.addEventListener("change", () => {
        populateExtraComparisonDropdownSelection(extraConditionAttributeDropdown.id , extraConditionComparisonDropdown);
      });
    async function populateExtraComparisonDropdownSelection(selectedAttributeId, comparisonDropdownMenu) {
        const selectedAttribute = document.getElementById(selectedAttributeId);
        const comparisonDropdownOptions = determineComparisonOptions(selectedAttribute.value);
        comparisonDropdownMenu = addOptionsToDropdown(comparisonDropdownMenu, comparisonDropdownOptions);

    };
    extraConditionComparisonDropdown.id = "extraConditionComparisonDropdown" + conditionIDNumber;
    extraInput.appendChild(extraConditionComparisonDropdown);

      // text box

    const extraConditionText = document.createElement("input");
    extraConditionText.type="text";
    extraConditionText.id = "extraConditionText" + conditionIDNumber;
    extraInput.appendChild(extraConditionText);
    extraConditions.appendChild(extraInput);
}




// JOIN
async function joinTripsPlan2People(event) {
    event.preventDefault();
    const customerName = "'" + document.getElementById("customerName").value + "'";
    const customerTransitCardNumber = Number(document.getElementById("transitCardNumber").value);
    const response = await fetch('/join-tripsplan2-customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: customerName,
            transitCardNumber: customerTransitCardNumber
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('joinResultMsg');
    messageElement.innerHTML = "";
    const tableDisplayElement = document.getElementById("joinTableDisplay");

    if (responseData.success) {
        messageElement.textContent = "Data joined successfully!";
        viewJoinTable(responseData);
    } else {
        messageElement.textContent = "Error joining data!";
    }
}

async function viewJoinTable(data) {
    const joinTableContent = data.data
    const tableElement = document.getElementById('joinTableDisplay');
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');
    const headRow = tableHead.querySelector('tr');


    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (headRow) {
        headRow.innerHTML = '';
    }


    ["Start Time", "Arrival Location","Departure Location"].forEach(column => {
        const colCell = document.createElement("th");
        colCell.textContent = column;
        headRow.appendChild(colCell);
        })

    console.log(joinTableContent);

    joinTableContent.rows.forEach(tuple => {
        const row = tableBody.insertRow();
        tuple.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });
}

//For division
async function displayWinners(event) {
    event.preventDefault(); //stop the page from reloading everytime
    const winnerDisplay = document.getElementById('displayWinners');

    try {
        const response = await fetch(`/get-winner`);
        const data = await response.json();

        winnerDisplay.innerHTML = ''; // Clear previous content

        if (response.ok) {
            if (data.rows && data.rows.length > 0) {
                const table = document.createElement('table');

                // HEADERS  
                const headers = data.metaData.map(columnName => columnName.name);
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                table.appendChild(headerRow);

                // ROWS
                data.rows.forEach(row => {
                    const tr = document.createElement('tr');
                    headers.forEach((_, i) => {
                        const td = document.createElement('td');
                        td.textContent = row[i];
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });

                winnerDisplay.appendChild(table);
            } else {
                winnerDisplay.textContent = 'No winners found.';
            }
        } else {
            winnerDisplay.textContent = data.data_status || 'An unknown error occurred.';
        }
    } catch (error) {
        console.error('Error fetching winner data:', error);
        winnerDisplay.textContent = 'Error loading winner data.';
    }
}




// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
     checkDbConnection();

    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("projectAttributes").addEventListener("submit", projectFeedbackTable);

    document.getElementById("conditionAttribute").addEventListener("change", populateComparisonDropdownSelection);
    document.getElementById("addMoreConditions").addEventListener("click", addMoreConditions);
    document.getElementById("selectionSubmit").addEventListener("click", selectionStops);

    document.getElementById("joinTripsPlan2People").addEventListener('submit', joinTripsPlan2People);
    document.getElementById('displayWinners').addEventListener('submit', displayWinners);
};

