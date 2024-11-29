
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

//        fetchTableData();
        displayProjectedFeedback(responseData, uniqueSelectedColumns);
    } else {
        messageElement.textContent = "Error projecting data!";
    }
}

async function displayProjectedFeedback(data, selectedColumns) {
    const projectTableContent = data.data
    const tableElement = document.getElementById('projectTableDisplay');
//    console.log(tableElement)
    const tableBody = tableElement.querySelector('tbody');
//    console.log(tableBody);
    const tableHead = tableElement.querySelector('thead');
//    console.log(tableHead);
    const headRow = tableHead.querySelector('tr');
//    console.log(headRow);


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

    console.log(projectTableContent);

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
//        if (firstConditionComparison == 'LIKE%') {
//            firstConditionComparison = 'LIKE';
//            firstConditionValue = '%' + firstConditionValue + '%';
//            console.log("comparison: ", firstConditionComparison);
//        }
//        if (firstConditionComparison == 'LIKE_') {
//            firstConditionComparison = 'LIKE';
//            firstConditionValue = '_' + firstConditionValue + '_';
//            console.log("comparison: ", firstConditionComparison);
//        }

        firstConditionValue = "'" + firstConditionValue + "'";
    }

    const firstCondition = firstConditionAttribute + " " + firstConditionComparison + " " + firstConditionValue;
    console.log(firstCondition);
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
//                if (extraConditionComparison == 'LIKE%') {
//                    extraConditionComparison = 'LIKE';
//                    extraConditionValue = '%' + extraConditionValue + '%';
//                }
//                if (extraConditionComparison == 'LIKE_') {
//                    extraConditionComparison = 'LIKE';
//                    extraConditionValue = '_' + extraConditionValue + '_';
//                }
                extraConditionValue = "'" + extraConditionValue + "'";
            }

            const extraCondition = andOr.value + " " + extraConditionAttribute + " " + extraConditionComparison + " " + extraConditionValue + " ";
            console.log(extraCondition);
            conditions.push(extraCondition);
        }
    }
    const uniqueConditions = [...new Set(conditions)];
    const conditionsStr = uniqueConditions.join(' ');
    console.log(conditionsStr);
    console.log("SELECT ", selectedAttributesStr, " FROM Stops WHERE ", conditionsStr);

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
        console.log(responseData.data);
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

    console.log(selectedTableContent);
    console.log(selectedTableContent.rows.length);
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
    console.log(selectedAttribute);
    const comparisonDropdownOptions = determineComparisonOptions(selectedAttribute);

    console.log(comparisonDropdownOptions);
    const comparisonDropdown = addOptionsToDropdown(document.getElementById("comparison"), comparisonDropdownOptions);
}

async function addMoreConditions() {
// adds more filtering condition/WHERE input
    console.log("adding more conditions");
    extraConditions = document.getElementById("extraConditions");
    const extraInput = document.createElement("div");
    console.log("extra input id: " + extraConditions.children.length);
    const conditionIDNumber = extraConditions.children.length + 1;
    // AND/OR

    const andOrDropdown = addOptionsToDropdown(document.createElement("select"), ['AND', 'OR']);
    andOrDropdown.id = "andOr" + conditionIDNumber;
    console.log(andOrDropdown.id);

    extraInput.appendChild(andOrDropdown);
    // attribute field

    const extraConditionAttributeDropdown = addOptionsToDropdown(document.createElement("select"),
                                                                 ["stopAddress", "maxCapacity", "stopID",
                                                                  "stopName"]);
    extraConditionAttributeDropdown.id = "extraConditionAttributeDropdown" + conditionIDNumber;
    extraInput.appendChild(extraConditionAttributeDropdown);

    console.log("condition attribute dropdown id ", extraConditionAttributeDropdown.id)
    const extraConditionComparisonDropdown = document.createElement("select");

    extraConditionAttributeDropdown.addEventListener("change", () => {
        populateExtraComparisonDropdownSelection(extraConditionAttributeDropdown.id , extraConditionComparisonDropdown);
      });
    async function populateExtraComparisonDropdownSelection(selectedAttributeId, comparisonDropdownMenu) {
        const selectedAttribute = document.getElementById(selectedAttributeId);
        console.log(selectedAttribute);
        const comparisonDropdownOptions = determineComparisonOptions(selectedAttribute.value);
        comparisonDropdownMenu = addOptionsToDropdown(comparisonDropdownMenu, comparisonDropdownOptions);

    };
    extraConditionComparisonDropdown.id = "extraConditionComparisonDropdown" + conditionIDNumber;
    extraInput.appendChild(extraConditionComparisonDropdown);
    console.log("condition comparison dropdown id ", extraConditionComparisonDropdown.id);

      // text box

    const extraConditionText = document.createElement("input");
    extraConditionText.type="text";
    console.log(document.getElementById(extraConditionAttributeDropdown.id));
    extraConditionText.id = "extraConditionText" + conditionIDNumber;
    extraInput.appendChild(extraConditionText);
    extraConditions.appendChild(extraInput);
    console.log("condition text id ", extraConditionText.id);
}




// JOIN
async function joinTripsPlan2People(event) {
    console.log('entered function')
    event.preventDefault();
    const customerName = "'" + document.getElementById("customerName").value + "'";
    const customerTransitCardNumber = Number(document.getElementById("transitCardNumber").value);
    console.log(customerName)
    console.log(customerTransitCardNumber)
    console.log("SELECT tp.startTime, tp.arrivalLocation, tp.departureLocation FROM TripsPlan2 tp, People p WHERE p.customerID = tp.customerID AND p.peopleName=",customerName," AND p.transitCardNumber=",customerTransitCardNumber);
    console.log(JSON.stringify({
            name: customerName,
            transitCardNumber: customerTransitCardNumber
        }));
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
        console.log(responseData.data);
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

