// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
     checkDbConnection();

    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("findShortestTrips").addEventListener("submit", findShortestTrips);
    document.getElementById("findAvgOpRatings").addEventListener("submit", findAvgOpRatings);
    document.getElementById("findMaxAvgEms").addEventListener("click", findMaxAvgEmissions);

};


// find shortest trips aggregation
async function findShortestTrips(event) {
    event.preventDefault();
    const minDuration = document.getElementById('minDuration').value;

    try {
        const response = await fetch(`/find-shortest-location-duration?minDuration=${minDuration}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseData = await response.json();

        const tableContent = responseData.data;
        displayAggregationTable(tableContent, 'shortestTripsTableResult');
    } catch (error) {
        console.log("shortest trips: ", error);
    }
}

// find average operator rating aggregation
async function findAvgOpRatings(event) {
    event.preventDefault();
    const minRating = document.getElementById('minRating').value;

    try {
        const response = await fetch(`/find-avg-op-rating?minRating=${minRating}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseData = await response.json();

        const tableContent = responseData.data;
        displayAggregationTable(tableContent, 'avgOpRatingTableResult');
    } catch (error) {
        console.log("average operator rating: ", error);
    }
}

// find maximum average emissions aggregation
async function findMaxAvgEmissions(event) {
    event.preventDefault();

    try {
        const response = await fetch('/find-max-avg-ems', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseData = await response.json();

        const tableContent = responseData.data;
        displayAggregationTable(tableContent, 'maxAvgEmsTableResult');
    } catch (error) {
        console.log("maximum average emissions: ", error);
    }
}

// helper function to display tables for aggregations
function displayAggregationTable(tableContent, elementId) {
    console.log(tableContent);
    const tableElement = document.getElementById(elementId);
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');

    // reset table if already populated
    if (tableHead) {
        tableHead.innerHTML = '';
    }
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    // add table headers
    const headRow = tableHead.insertRow();
    tableContent.metaData.forEach(column => {
        const cell = headRow.insertCell();
            cell.textContent = column.name;
    });

    // add table tuples
    tableContent.rows.forEach(tuple => {
        const row = tableBody.insertRow();
        tuple.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });
}



