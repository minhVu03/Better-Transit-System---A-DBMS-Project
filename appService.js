const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');
const path = require('path');
const fs = require('fs');


// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {dbStatus
        console.error(err.message);
        process.exit(1);
    }
}
initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return {status:"DB connected!",
            db_details: dbConfig};
    }).catch(() => {
        return false;
    });
}

async function fetchTableNames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT table_name FROM user_tables');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

//Minh Vu -- create all Tables endpoint 
async function initiateAllTables() {
    //we load stuff
    const sqlFilePath = path.join(__dirname, 'initializeTables.sql');
    const sqlFileContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL file into individual statements
    const sqlStatements = sqlFileContent
        // .replace(/CREATE ASSERTION.+;/g, '') 
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

    return await withOracleDB(async (connection) => {
        for (const statement of sqlStatements) {
            try {
                await connection.execute(statement);
                console.log(`SUCCEED: ${statement}`);
                console.log('------------------------------------------------');

            } catch (err) {
                if (statement.startsWith("DROP TABLE")) {
                    console.log(`Skip TABLE: ${err.message}`);
                } else {
                    console.log(`FAILED: ${statement}`);
                    console.error(`Error message: ${err.message}`);
                    return false;
                }
            }
        }
        await connection.commit();
        return true;
    }).catch((error) => {
        console.error(`Database initialization failed: ${error}`);
        return false;
    });



}

//SELECTION
async function selectStops(selectedAttributes, condition) {
    const sqlQuery = `SELECT DISTINCT ${selectedAttributes} FROM Stops WHERE ${condition}`;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(sqlQuery);

        return result;
    }).catch(() => {
        return false;
    });
//    return sqlQuery;
}

//JOIN
async function joinTripsplan2People(name, transitCardNumber) {

    const sqlQuery = `
        SELECT DISTINCT tp.startTime, tp.arrivalLocation, tp.departureLocation
        FROM TripsPlan2 tp, People p
        WHERE p.customerID=tp.customerID AND p.peopleName=${name} AND p.transitCardNumber=${transitCardNumber}`;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(sqlQuery);

        return result;
    }).catch(() => {
        return false;
    });

}

//PROJECTION
async function projectFeedback(attributes) {
    const sqlQuery = `SELECT DISTINCT ${attributes} FROM Feedback`;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(sqlQuery);
        return result;
    }).catch(() => {
        return false;
    });
}


//JOIN
// async function findStopLocationsOfRoute(selectedRouteNumber) {
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute(
//             `SELECT s.Name, s.Address 
//             FROM BelongsTo b,Stops s 
//             WHERE b.StopID = s.StopID AND b.RouteNumber=:selectedRouteNumber`,
//             { autoCommit: true }
//         );

//         return result;
//     }).catch(() => {
//         return false;
//     });
// }

// Retrieve data for a SPECIFIC table
async function getTableData(tableName) {
    return await withOracleDB(async (connection) => {
        const query = `SELECT * FROM ${tableName}`;
        const result = await connection.execute(query);

        if (result.rows.length === 0) {
            return {
                data_status: "empty",
                table_name: tableName,
                message: "Table is empty"
            };
        }

        // If there are rows, return the data
        const rows = result.rows.map(row => {
            const rowObj = {};
            result.metaData.forEach((meta, i) => {
                rowObj[meta.name] = row[i];
            });
            return rowObj;
        });

        return {
            data_status: "success",
            table_name: tableName,
            table_data: rows
        };
    }).catch((error) => { //catch any other erros
        const errorMessage = error.message || 'Unknown error occurred';

        return {
            data_status: `error: ${errorMessage}`, //print out error message
            table_name: tableName,
            message: "Failed to retrieve table data"
        };
    });
}

// Insert multiple rows into a SPECIFIC table
async function insertData(tableName, columns, values) {
    return await withOracleDB(async (connection) => {
        const columnsList = columns.join(', ');
        const placeholders = columns.map((_, i) => `:${i + 1}`).join(', ');

        const query = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

        try {
            const result = await connection.executeMany(
                query,
                values, 
                { autoCommit: true }
            );

            return {
                rows_affected: result.rowsAffected,
                insertStatus: result.rowsAffected && result.rowsAffected > 0
            };
        } catch (error) {
            // throw the errors into appController endpoint
            throw error;
        }
    });
}

//DELETE an Operator
async function deleteOperator(deletedEmployeeID) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `DELETE FROM Operator WHERE employeeID = :employeeID`,
                { employeeID: deletedEmployeeID }, 
                { autoCommit: true } 
            );

            return result.rowsAffected > 0; 
        } catch (error) {
            console.error("Error deleting operator:", error);
            return false; 
        }
    }).catch((error) => {
        console.error("Database connection error:", error);
        return false;
    });
}

//Update a Vehicle's information
async function updateVehicle(licensePlateNumber, updates) {
    return await withOracleDB(async (connection) => {
        const columns = Object.keys(updates);
        if (columns.length === 0) return false;

        const setClauses = columns.map((column) => `${column} = :${column}`).join(', ');
        const binds = { licensePlateNumber, ...updates };

        const query = `UPDATE Vehicles SET ${setClauses} WHERE licensePlateNumber = :licensePlateNumber`;

        try {
            const result = await connection.execute(query, binds, { autoCommit: true });
            console.log("[+] Rows Affected query:",  result.rowsAffected  )
            
            return result;
        } catch (error) {
            console.error("Error updating vehicle:", error);
            throw error;
        }
    }).catch((error) => {
        console.error("Database connection error:", error);
        throw error;
    });
}

//DIVISION
async function awardDivision() {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `
                SELECT DISTINCT O.employeeID, O.operatorName
                FROM Operator O
                JOIN Receive R ON O.employeeID = R.employeeID
                JOIN Feedback F ON R.feedbackID = F.feedbackID
                WHERE NOT EXISTS (
                    SELECT SR.starRating
                    FROM (SELECT DISTINCT starRating FROM Feedback) SR
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM Receive R2
                        JOIN Feedback F2 ON R2.feedbackID = F2.feedbackID
                        WHERE R2.employeeID = O.employeeID
                        AND F2.starRating = SR.starRating
                    )
                )
                `,
                {}, 
                { autoCommit: true }
            );
            //if the query returns empty, not rly an error but itd display a message
            if (!result.rows || result.rows.length === 0) {
                throw new Error('No qualifying winners found.');
            }
            return result;
        } catch (err) {
            console.error('Error executing query:', err);
            return false;
        }
    });
}




// aggregation with GROUP BY
// find the departureLocation to reach arrivalLocation in the shortest duration, that has a minimum duration minDuration
async function findLocationWithShortestDuration(minDuration) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT arrivalLocation, departureLocation, duration
            FROM TripsPlan1
            WHERE (arrivalLocation, duration) IN (
                SELECT arrivalLocation, MIN(duration)
                FROM TripsPlan1
                WHERE duration >= :minDuration
                GROUP BY arrivalLocation
            )
            `,
            [minDuration],
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

// aggregation with HAVING
// find the average rating for operators, that has at least minRating ratings
async function findAverageOperatorRating(minRating) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT r.employeeID, AVG(f.starRating) as avgStarRating
            FROM Feedback f, Receive r
            WHERE f.feedbackID=r.feedbackID
            GROUP BY r.employeeID
            HAVING AVG(f.starRating)>=:minRating`,
            [minRating],
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

// nested aggregation
// find the max of the average carbon emissions for Vehicles across all TransitRoute s
async function findMaxAvgEmissions() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT g.routeNumber, AVG(v.carbonEmission) AS avgCarbonEmission
            FROM Vehicles v, GoesOn g
            WHERE g.licensePlateNumber=v.licensePlateNumber
            GROUP BY g.routeNumber
            HAVING AVG(v.carbonEmission)
                >=all(
                    SELECT AVG(v2.carbonEmission)
                    FROM Vehicles v2, GoesOn g2
                    WHERE g2.licensePlateNumber=v2.licensePlateNumber
                    GROUP BY g2.routeNumber)`
        );

        return result;
    }).catch(() => {
        return false;
    });
}




module.exports = {
    testOracleConnection,

    //new functions
    initiateAllTables,
    fetchTableNames,
    selectStops,
    projectFeedback,
    // findStopLocationsOfRoute,
    findLocationWithShortestDuration,
    findAverageOperatorRating,
    findMaxAvgEmissions,
    getTableData,
    insertData,
    deleteOperator,
    updateVehicle,
    awardDivision,
    joinTripsplan2People

};