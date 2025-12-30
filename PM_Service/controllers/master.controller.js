const dB = require('../app_module/dbHelp');

exports.saveMaster = async (req, res) => {
    try {
        let SqlCommandToExec = [];
        const body = req.body.data;
        const masterTable = Object.keys(body)[0];
        const masterData = body[masterTable];
        let pk = getMasterMetaData(masterTable).IdCol;
        let maxIDSql = `Select max(ifnull(${pk},0)+1)max from ${masterTable};`
        let resData = await dB.executeMultipleSelectQuery(maxIDSql);
        maxId = resData[0].data[0]['max'];
        masterData[pk] = maxId;
        let schema = await getSchema(masterTable);
        schema = schema[0].data;
        let filteredArr2 = schema.map(row => row.COLUMN_NAME);
        let insertQuery = await generateInsertQuery(masterTable, filteredArr2, [masterData]);
        SqlCommandToExec.push(insertQuery);
        let msg = await executeFinalCommands(maxId, ' ' + 'Data Saved Successfully', SqlCommandToExec)
        res.status(200).send({msg: msg});

    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    }
}

exports.updateMaster = async (req, res) => {
    try {
        let pkValue = req.params.id;
        let SqlCommandToExec = [];
        const body = req.body.data;
        const masterTable = Object.keys(body)[0];
        const masterData = body[masterTable];
        let pk = getMasterMetaData(masterTable).IdCol;
        let schema = await getSchema(masterTable);
        schema = schema[0].data;
        let filteredArr2 = schema.map(row => row.COLUMN_NAME);
        let updateQuery = await generateUpdateQuery(masterTable, {[pk]:pkValue},[masterData],filteredArr2);
        SqlCommandToExec.push(updateQuery);
        let msg = await executeFinalCommands(pkValue, ' ' + 'Data Saved Successfully', SqlCommandToExec)
        res.status(200).send({msg: msg});

    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    } 
}
exports.resturantLinkage = async (req, res) => {
    try {
        let partyId = req.params.id;
        let data = await dB.executeMultipleSelectQuery(`Select * from RestroLinkage where PartyId = ${partyId};`);
        if(data[0]['data'].length > 0){
            const body = req.body.data;
            const masterTable = Object.keys(body)[0];
            const masterData = body[masterTable];
            let pk = getMasterMetaData(masterTable).IdCol;
            let schema = await getSchema(masterTable);
            schema = schema[0].data;
            let filteredArr2 = schema.map(row => row.COLUMN_NAME);
            let updateQuery = await generateUpdateWithSchema("RestroLinkage", {LinkageId:data[0]['data'][0].LinkageId},filteredArr2,[masterData]);
            let SqlCommandToExec = [];
            SqlCommandToExec.push(updateQuery);
            let msg = await executeFinalCommands(data[0]['data'][0].LinkageId, ' ' + 'Data Saved Successfully', SqlCommandToExec)
            res.status(200).send({msg: msg});
        }
        else{
            let body = req.body.data
            const masterTable = Object.keys(body)[0];
            const masterData = body[masterTable];
            let pk = getMasterMetaData(masterTable).IdCol;
            let maxIDSql = `Select max(ifnull(${pk},0)+1)max from ${masterTable};`
            let resData = await dB.executeMultipleSelectQuery(maxIDSql);
            maxId = resData[0].data[0]['max'];
            masterData[pk] = maxId;
            let schema = await getSchema(masterTable);
            schema = schema[0].data;
            let filteredArr2 = schema.map(row => row.COLUMN_NAME);
            let insertQuery = await generateInsertQuery(masterTable, filteredArr2, [masterData]);
            let SqlCommandToExec = [];
            SqlCommandToExec.push(insertQuery);
            let msg = await executeFinalCommands(data[0].LinkageId, ' ' + 'Data Saved Successfully', SqlCommandToExec)
            res.status(200).send({msg: msg});
        };

    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    } 
}


async function getSchema(tableName) {
    try {
        let promise = new Promise((resolve, reject) => {
            try {
                let database = getDataBase();
                let qry = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = '${database}'`;
                dB.executeMultipleSelectQuery(qry).then(async function (sch) {
                    try {
                        resolve(sch)
                    } catch (err) {
                        reject(err)
                    }
                });
            } catch (err) {
                reject(err);
            }
        })
        let result = await promise;
        return result
    } catch (err) {

    }

}

const getDataBase = () => {
    return process.env.DB_NAME;
}


function getMasterMetaData(tableName) {
    let meta_data;
    try {
        tableMetaData = [
            {
                tableName: "ContactMaster", IdCol: "ContactId",

            },
            {
                tableName: "RestroLinkage", IdCol: "LinkageId",

            },
            {
                tableName: "other_tabs", IdCol: "tabId",
            },
            {
                tableName: "greenpts_adjust", IdCol: "TxnNo",
            },
            {
                tableName: "HallOfFame", IdCol: "Id",
            }
        ]
        meta_data = tableMetaData.find(data => data.tableName == tableName)

    } catch (err) {
        throw err;
    }
    return meta_data;
}


async function generateInsertQuery(tableName, schema, data) {
    var query = '';
    if (!tableName || !schema || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid input data');
    }
    let columns = schema;
    const values = data.map(row => {
        const rowValues = columns.map(col => {
            // Ensure proper escaping for string values to prevent SQL injection

            if (typeof row[col] === 'string') {
                return `'${row[col].replace(/'/g, "''")}'`;
            }
            return (row[col] == null) ? 'NULL' : (row[col] !== undefined) ? row[col] : 'NULL';
        });

        return `(${rowValues.join(', ')})`;
    });
    columns = schema.map(col => `${col}`);

    if (values.length > 999) {
        let outputArray = [];
        for (let i = 0; i < values.length; i += 999) {
            outputArray.push(values.slice(i, i + 999));
        }
        for (let j = 0; j < outputArray.length; j++) {
            query += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${outputArray[j].join(', ')};`
        }
    }
    else {
        query += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values.join(', ')}`;
    }

    return query;

}
async function executeFinalCommands(max, Msg, SqlCommandToExec) {
    // let a = SqlCommandToExec[0].replace('BaseCurrencyID,', '').replace("'',",'');
    // SqlCommandToExec[0] = a;
    return new Promise((resolve, reject) => {
        dB.executeDmlQuery(SqlCommandToExec.join(";"), { withTrans: true }).then(function (raff) {
            resolve({ message: Msg, code: max });
        }).catch(function (err) {
            reject(err);
        });

    })
}

async function generateUpdateQuery(table, primaryKey, dataArray, schema) {
    if (!table || !primaryKey || !dataArray || !Array.isArray(dataArray) || dataArray.length === 0 || !Array.isArray(schema) || schema.length === 0) {
        throw new Error("Invalid input parameters.");
    }

    // Assume only the first element of dataArray is used
    const data = dataArray[0];
    const pkName = Object.keys(primaryKey)[0];
    const pkValue = primaryKey[pkName];

    // Only include keys that exist in the schema and are not the primary key
    const setClauses = schema
        .filter(col => col !== pkName && data.hasOwnProperty(col))
        .map(col => {
            const value = data[col];
            if (typeof value === 'string') {
                return `${col} = '${value.replace(/'/g, "''")}'`;
            } else if (value === null) {
                return `${col} = NULL`;
            } else {
                return `${col} = ${value}`;
            }
        });

    if (setClauses.length === 0) {
        throw new Error("No valid columns to update.");
    }

    const whereClause = typeof pkValue === 'string'
        ? `${pkName} = '${pkValue.replace(/'/g, "''")}'`
        : `${pkName} = ${pkValue}`;

    const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClause};`;
    return query;
}

async function generateUpdateWithSchema(table, primaryKey, schema, dataArray) {
    if (!table || !primaryKey || !schema || !Array.isArray(schema) || schema.length === 0 || !dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
        throw new Error("Invalid input parameters.");
    }

    // Take only the first record for update (like your original update function)
    const data = dataArray[0];
    const pkName = Object.keys(primaryKey)[0];
    const pkValue = primaryKey[pkName];

    const setClauses = [];

    for (const col of schema) {
        if (col === pkName) continue; // skip primary key

        if (Object.prototype.hasOwnProperty.call(data, col)) {
            const value = data[col];
            if (typeof value === 'string') {
                setClauses.push(`${col} = '${value.replace(/'/g, "''")}'`);
            } else if (value === null) {
                setClauses.push(`${col} = NULL`);
            } else if (value !== undefined) {
                setClauses.push(`${col} = ${value}`);
            } else {
                // undefined: skip this column (don’t update)
            }
        }
    }

    if (setClauses.length === 0) {
        throw new Error("No valid columns to update based on schema.");
    }

    const whereClause = typeof pkValue === 'string'
        ? `${pkName} = '${pkValue.replace(/'/g, "''")}'`
        : `${pkName} = ${pkValue}`;

    const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClause};`;

    return query;
}


