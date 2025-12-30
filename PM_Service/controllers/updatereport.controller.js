const dB = require('../app_module/dbHelp');
const pointsLedgerData = {
    TransType: "Purchase Reward",           // input key
    TransReference: "DocSlNo",        // input key
    TransRefDate: "DocDate",          // input key
    ContactId: "ContactId",           // input key
    RestroId: "PartyId",              // input key
    SalesValue: "Amount",         // input key
    Greenpointsredeemed: 0.00,        // hardcoded
    GreyPointsEarned: "GreyPoints",   // input key
    Greypointsconverted: 0.00,        // hardcoded
    Greenpointsearned: 0.00,          // hardcoded
    SalesEligibleAmt: 0.00,
    PointsEarned: "GreyPoints",
    PaymentDate: "DocDate",           // input key
    PointsUnloackingDate: "",
    PointsExpiryDate: "",
    PointsCalculationMethod: "",
    Remarks: "",
    CreatedBy: null,
    LastMoifyDate: ""
};
const greenPointsData = {
    CompanyId: 'CompanyId',
    Type: 'Type',
    RVNumber: 'RVNumber',
    RVDate: 'RVDate',
    Amount: 'Amount',
    PmtDays: 'PmtDays',
    PartyId: 'PartyId',
    ContactId: 'ContactId',
    GreenPoint: 'GreenPoint',
    Bonus1x: 'Bonus1x',
    Bonus3x: 'Bonus3x',
    Total: 'Total'
};

const HallOfFameData = {
    ContactId: 'contactId',
    Amount: 'TotalAmount',
    no_of_subcategory: 'categoryCntSum',
    progress_percent: 'avgGrowthPercentSum',
    Hall_of_fame_name: 'type',
    Ticket_id: 0,
    Ticket_Amount: 0,
    HofDate: 'HofDate'
}
const ChampPurchaserData = {
    ContactId: 'contactId',
    Amount: 'TotalAmount',
    no_of_subcategory: 0,
    progress_percent: 0,
    Hall_of_fame_name: 'Champ Purchaser',
    Ticket_id: 0,
    Ticket_Amount: 0,
    HofDate: 'HofDate'
}
const SKURockstarData = {
    ContactId: 'contactId',
    Amount: 0,
    no_of_subcategory: 'subcategoriesCount',
    progress_percent: 0,
    Hall_of_fame_name: 'SKU Rockstar',
    Ticket_id: 0,
    Ticket_Amount: 0,
    HofDate: 'HofDate'
}
const GrowthChampData = {
    ContactId: 'contactId',
    Amount: 0,
    no_of_subcategory: 0,
    progress_percent: 'AvgGrowthPercent',
    Hall_of_fame_name: 'Growth Hacker',
    Ticket_id: 0,
    Ticket_Amount: 0,
    HofDate: 'HofDate'
}

exports.updateGreyPoints = async (req, res) => {
    try {
        const body = req.body.data;
        let tableName = Object.keys(body)[0];
        const dataRows = body[tableName];
        var columnMapping = {};
        if(tableName === 'PointsLedger'){
            columnMapping = pointsLedgerData;
        }else if(tableName === 'greenpoints'){
            columnMapping = greenPointsData;
        }else if(tableName === 'HallOfFame'){
            columnMapping = HallOfFameData;
        }else if(tableName === 'ChampPurchaser'){
            columnMapping = ChampPurchaserData;
            tableName = 'HallOfFame';
            const prevDataQry = `Select * from HallOfFame where Hall_of_fame_name = 'Champ Purchaser' and HofDate = '${body['ChampPurchaser'][0]['HofDate']}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0]['data'].length > 0){
                const prevDataId = prevData[0]['data'][0]['Id'];
                await dB.executeDmlQuery(`delete from ${tableName} where Id = ${prevDataId}`, { withTrans: true });
            }
        }else if(tableName === 'SKURockstar'){
            columnMapping = SKURockstarData;
            tableName = 'HallOfFame';
            const prevDataQry = `Select * from HallOfFame where  Hall_of_fame_name = 'SKU Rockstar' and HofDate = '${body['SKURockstar'][0]['HofDate']}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0]['data'].length > 0){
                const prevDataId = prevData[0]['data'][0]['Id'];
                await dB.executeDmlQuery(`delete from ${tableName} where Id = ${prevDataId}`, { withTrans: true });
            }
        }else if(tableName === 'GrowthChamp'){
            columnMapping = GrowthChampData;
            tableName = 'HallOfFame';
            const prevDataQry = `Select * from HallOfFame where  Hall_of_fame_name = 'Growth Hacker' and HofDate = '${body['GrowthChamp'][0]['HofDate']}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0]['data'].length > 0){
                const prevDataId = prevData[0]['data'][0]['Id'];
                await dB.executeDmlQuery(`delete from ${tableName} where Id = ${prevDataId}`, { withTrans: true });
            }
        }

        if (!Array.isArray(dataRows) || dataRows.length === 0) {
            return res.status(400).send({ status: "error", message: "No data to insert" });
        }

        // Split into chunks
        const chunkSize = 500; // safer than 999
        const dbColumns = Object.keys(columnMapping);

        for (let i = 0; i < dataRows.length; i += chunkSize) {
            const chunk = dataRows.slice(i, i + chunkSize);
            const insertQuery = await generateInsertQuery(tableName, columnMapping, chunk);

            // Execute each chunk separately
            await dB.executeDmlQuery(insertQuery, { withTrans: true });
        }

        res.status(200).send({ msg: "Data Saved Successfully" });

    } catch (err) {
        console.error("Error in updateGreyPoints:", err);
        res.status(500).send({ status: "error", message: err.message });
    }
};

// Generate insert query for multiple rows
async function generateInsertQuery(tableName, columnMapping, dataRows) {
    if (!tableName || !columnMapping || !Array.isArray(dataRows) || dataRows.length === 0) {
        throw new Error("Invalid input for insert generation");
    }

    const dbColumns = Object.keys(columnMapping);
    const dateColumns = [
        "TransRefDate",
        "PaymentDate",
        "PointsUnloackingDate",
        "PointsExpiryDate",
        "LastMoifyDate",
        "RVDate"
    ];

    const valueSets = dataRows.map(row => {
        const rowValues = dbColumns.map(col => {
            let mapping = columnMapping[col];
            let val;

            if (typeof mapping === "string") {
                // if key exists in row, take it; else treat as literal
                val = row.hasOwnProperty(mapping) ? row[mapping] : mapping;
            } else {
                val = mapping; // number or null
            }

            // handle dates safely
            if (dateColumns.includes(col)) {
                const formattedDate = formatDateForMySQL(val);
                if (!formattedDate) return "NULL";
                return `'${formattedDate}'`;
            }

            // handle string vs null vs numeric
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (val === null || val === undefined) return "NULL";
            return val;
        });

        return `(${rowValues.join(", ")})`;
    });

    // Split into chunks (MySQL max 1000 rows per insert)
    const queries = [];
    for (let i = 0; i < valueSets.length; i += 999) {
        const chunk = valueSets.slice(i, i + 999).join(", ");
        queries.push(
            `INSERT INTO ${tableName} (${dbColumns.join(", ")}) VALUES ${chunk};`
        );
    }

    return queries.join("\n");
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


async function executeFinalCommands(Msg, SqlCommandToExec) {
    // let a = SqlCommandToExec[0].replace('BaseCurrencyID,', '').replace("'',",'');
    // SqlCommandToExec[0] = a;
    return new Promise((resolve, reject) => {
        dB.executeDmlQuery(SqlCommandToExec.join(";"), { withTrans: true }).then(function (raff) {
            resolve({ message: Msg });
        }).catch(function (err) {
            reject(err);
        });

    })
}

function formatDateForMySQL(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // invalid date → NULL

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}


function getMasterMetaData(tableName) {
    let meta_data;
    try {
        tableMetaData = [
            {
                tableName: "PointsLedger", IdCol: "TransId",

            },
        ]
        meta_data = tableMetaData.find(data => data.tableName == tableName)

    } catch (err) {
        throw err;
    }
    return meta_data;
}
