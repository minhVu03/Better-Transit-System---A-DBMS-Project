const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const db_info = await appService.testOracleConnection();
    if (!db_info) {
        res.send('unable to connect to db');
    } else {
        res.send(db_info)
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/project-feedback", async (req, res) => {
    const { attributes} = req.body;
    const projectResults = await appService.projectFeedback(attributes);
    if (projectResults) {
        res.json({ success: true,  data:projectResults});
        console.log(projectResults);
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/select-stops", async (req, res) => {
    const { attributes} = req.body;
    const selectResults = await appService.selectStops(attributes);
    if (selectResults) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/join-tripsplan2-customers", async (req, res) => {
    const { name, transitCardNumber} = req.body;
    const joinResults = await appService.joinTripsplan2People(name, transitCardNumber);
    if (joinResults) {
        res.json({ success: true, data: joinResults, transitCardNumber: transitCardNumber });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


// Our Project APIs
router.post("/initiate-all-tables", async (req, res) => {
    const initiateResult = await appService.initiateAllTables();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});



router.get('/fetchTableNames', async (req, res) => {
    const tableContent = await appService.fetchTableNames();
    res.json({data: tableContent});
});

router.post("/find-shortest-location-duration", async (req, res) => {
    const { minDuration } = req.body;
    const updateResult = await appService.findLocationWithShortestDuration(minDuration);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/find-avg-op-rating", async (req, res) => {
    const { minRatings } = req.body;
    const updateResult = await appService.findAverageOperatorRating(minRatings);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/find-max-avg-ems", async (req, res) => {
    const updateResult = await appService.findMaxAvgEmissions();
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});
//fetch data from a specific table based on table name
router.get('/getTableData', async (req, res) => {
    const tableName = req.query.table;

    try {
        // Fetch data for the specified table
        const tableData = await appService.getTableData(tableName);
        res.json(tableData);
    } catch (error) {
        console.error('Error retrieving table data:', error);
        res.status(500).json({ error: 'Failed to retrieve table data' });
    }
});

// Insert multiple rows of data into a SPECIFIC table
router.post('/insert-data', async (req, res) => {
    const { tableName, columns, values } = req.body;

    if (
        !tableName ||
        !Array.isArray(columns) ||
        !Array.isArray(values) ||
        values.length === 0 ||
        !values.every(row => Array.isArray(row) && row.length === columns.length)
    ) {
        return res.status(400).json({ success: false, message: 'Invalid request format.' });
    }

    try {
        const insertResult = await appService.insertData(tableName, columns, values);

        if (insertResult.insertStatus) {
            res.json({ success: true, rows_affected: insertResult.rows_affected });
        } else {
            res.status(500).json({ success: false, message: 'Failed to insert data.' });
        }
    } catch (error) {
        // Return a generic error message without specifics here
        res.status(500).json({ success: false, message: error.message || 'An error occurred while inserting data.' });
    }
});

//Delete an Operator by employeeID
router.post('/delete-operator', async (req, res) => {
    console.log("POST /delete-operator request received");
    try {
        const { employeeID } = req.body;
        if (!employeeID) {
            return res.status(400).json({ success: false, message: "employeeID is required" });
        }

        const deletionSuccess = await appService.deleteOperator(employeeID);

        if (deletionSuccess) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Operator not found" });
        }
    } catch (error) {
        console.error("Error in /delete-operator:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;