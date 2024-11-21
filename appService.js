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

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
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

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
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

//insert table DEMO
async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

//UPDATE TABLE NAME DEMOTABLE
async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

//SELECTION
async function selectStops(selectedStopName) {
    const sqlQuery = `SELECT ${attributes} FROM Stops`
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            sqlQuery);

        return result;
    }).catch(() => {
        return false;
    });
}

//PROJECTION
// TODO figure out how to display table after projection
async function projectFeedback(attributes) {
    console.log(attributes)
    const sqlQuery = `SELECT ${attributes} FROM Feedback`;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(sqlQuery);
        viewProjectData(sqlQuery)
        return result;
    }).catch(() => {
        return false;
    });
}

async function viewProjectData(query) {
    return await withOracleDB(async (connection) => {

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

//JOIN
async function findStopLocationsOfRoute(selectedRouteNumber) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT s.Name, s.Address 
            FROM BelongsTo b,Stops s 
            WHERE b.StopID = s.StopID AND b.RouteNumber=:selectedRouteNumber`,
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

//INSERT PAYMENT METHOD
async function insertPaymentMethod(newPaymentMethod) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO PaymentMethod (cardNumber) VALUES (:newPaymentMethod)`,
            [newPaymentMethod],
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}


//DELETE
async function deletePaymentMethod(deletedPaymentMethod) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM PaymentMethod WHERE cardNumber=:deletedPaymentMethod`,
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

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

        // Execute the batch insert
        const result = await connection.executeMany(
            query,
            values, // Each item in `values` is a row
            { autoCommit: true }
        );

        return {
            rows_affected: result.rowsAffected,
            insertStatus: result.rowsAffected && result.rowsAffected > 0
        };
    }).catch(() => {
        return false;
    });
}



module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,

    //new functions
    initiateAllTables,
    fetchTableNames,
//    selectStops,
    projectFeedback,
    findStopLocationsOfRoute,
    insertPaymentMethod,
    deletePaymentMethod,
    getTableData,
    insertData
};