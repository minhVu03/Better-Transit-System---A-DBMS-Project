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
    const {selectedAttributes, condition } = req.body;
    const selectResults = await appService.selectStops(selectedAttributes, condition);
    if (selectResults) {
        res.json({ success: true, data:selectResults });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/join-tripsplan2-customers", async (req, res) => {
    const { name, transitCardNumber} = req.body;
    const joinResults = await appService.joinTripsplan2People(name, transitCardNumber);
    if (joinResults) {
        res.json({ success: true, data: joinResults });
    } else {
        res.status(500).json({ success: false });
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

router.get("/find-shortest-location-duration", async (req, res) => {
    const { minDuration } = req.query;
    const updateResult = await appService.findLocationWithShortestDuration(minDuration);
    res.json({ data: updateResult });
});

router.get("/find-avg-op-rating", async (req, res) => {
    const { minRating } = req.query;

    const updateResult = await appService.findAverageOperatorRating(minRating);
    res.json({ data: updateResult });
});

router.get("/find-max-avg-ems", async (req, res) => {
    const updateResult = await appService.findMaxAvgEmissions();
    res.json({ data: updateResult });
});

//fetch data from a specific table based on table name
router.get('/getTableData', async (req, res) => {
    const tableName = req.query.table;

    try {
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


// Update vehicle information by licensePlateNumber
router.post('/update-vehicle', async (req, res) => {
    console.log("POST /update-vehicle request received");

    try {
        const { licensePlateNumber, updates } = req.body;
        if (!licensePlateNumber || typeof updates !== 'object' || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: licensePlateNumber and updates are required."
            });
        }

        const updateResult = await appService.updateVehicle(licensePlateNumber, updates);

        if (updateResult.rowsAffected > 0) {
            res.json({
                success: true,
                rowsAffected: updateResult.rowsAffected
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'non-existing'
            });
        }
    } catch (error) {
        console.error("Error in /update-vehicle:", error);
        res.status(500).json({
            success: false,
            message: error.message //pass the full original error msg from Oracle to front-end
        });
    }
});


//for the division query
router.get('/get-winner', async (req, res) => {
    try {
        const winnerData = await appService.awardDivision();
        res.json(winnerData);
    } catch (error) {
        console.error('Error retrieving winner data:', error.message);
        if (error.message === 'No qualifying winners found.') {
            res.status(404).json({ data_status: 'No winners found.' });
        } else {
            res.status(500).json({ data_status: 'Failed to retrieve winner data.' });
        }
    }
});



module.exports = router;