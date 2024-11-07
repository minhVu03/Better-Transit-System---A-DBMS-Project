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
    } catch (err) {
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
        return true;
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

async function fetchAllTables() {
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
                console.log(`Executing: ${statement}`);

                await connection.execute(statement);
                console.log(`SUCCEED: ${statement}`);
                console.log('------------------------------------------------');

            } catch (err) {
                if (statement.startsWith("DROP TABLE")) {
                    console.log(`Skipping drop for non-existent table: ${err.message}`);
                } else {
                    console.error(`Error executing statement: ${err.message}`);
                    return false;
                }
            }
        }
        return true;
    }).catch((error) => {
        console.error(`Database initialization failed: ${error}`);
        return false;
    });
}

//

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

async function selectStops(selectedStopName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT address FROM Stops WHERE stopName=:selectedStopName`,
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

async function projectTrips() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Trips`,
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}


async function findStopLocationsOfRoute(selectedRouteNumber) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT s.Name, s.Address FROM BelongsTo b,Stops s WHERE b.StopID = s.StopID AND b.RouteNumber=:selectedRouteNumber`,
            { autoCommit: true }
        );

        return result;
    }).catch(() => {
        return false;
    });
}

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

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    initiateAllTables,
    fetchAllTables
};