var Q = require('q');
var _ = require("underscore");
var fs = require('fs');
var path = require('path');
var getConnection= require("../config/db")

// Custom function to execute multiple SELECT queries
async function executeMultipleSelectQuery(queries) {
  const db = await getConnection();
  try {
    // Connect to the database

    // Split the multiple queries based on semicolons
    const queryList = queries.split(';').map(query => query.trim()).filter(query => query.length > 0);

    // Array to store results for each query
    const results = [];

    for (let query of queryList) {
      // Execute the query to get data
      const [resultData, columnDef] = await db.query(query);
      const sch = [];
      if (Array.isArray(columnDef)) {
        columnDef.forEach((col, index) => {
          sch.push({ index: index, name: col.name, type: getColType(col.type) });
        })
      }


      // Push data and schema into the results array
      results.push({
        data: resultData,  // Query result
        schema: sch               // Schema info
      });
    }

    // Return results in the required format
    return results;

  } catch (err) {
    throw err;
  }
}

async function executeQuery(){
  const db = await getConnection();
  return db;
}

async function executeScalar(ProfileId, qry) {
  // var deferred = Q.defer();
  try {
    let data = await executeMultipleSelectQuery(ProfileId, qry);
    return data[0]['data'][0];

  } catch {

  }
};

// async function executeDmlQuery(ProfileId, qry, op) {
//   const db = getConnection(ProfileId);
//   qry = "START TRANSACTION;" + qry;
//   qry += ";COMMIT;"

//   let data = await db.query(qry);
//   return data;

// };

async function executeDmlQuery(qry, op) {
  // const db = await getConnection(ProfileId).getConnection(); // Get a connection for the transaction
  const db = await getConnection().getConnection();
  try {
    await db.beginTransaction(); // Start the transaction

    // Execute the query
    let [rows] = await db.query(qry);

    await db.commit(); // Commit the transaction
    return rows; // Return the result of the query
  } catch (error) {
    await db.rollback(); // Rollback the transaction in case of error
    throw error; // Rethrow the error to propagate it
  } finally {
    // db.release(); // Release the connection back to the pool
  }
};

async function getTablesSchema(ProfileId, tables) {
  var Sqlstr = "";
  tables.forEach(function (tab) {
    Sqlstr += " Select * From " + tab + " Where 1=2 ;";
  });
  const db = getConnection(ProfileId);
  let [rows, fields] = await db.query(Sqlstr);
  var dataSet = {};
  if (tables.length > 1) {
    var idx = 0;
    rows.forEach(function (rset) {
      var tabname = tables[idx];
      var sch = createSchema(fields[idx]);
      idx++;
      dataSet[tabname] = { schema: sch };
    });
  } else {
    var tabname = tables[0];
    var sch = createSchema(fields);
    dataSet[tabname] = { schema: sch };
  }
  return dataSet;

};
async function getTablesSchemaRecord(ProfileId, qry) {
  const db = getConnection(ProfileId);
  let rows = await db.query(qry);

  var cols = [{ index: 0, name: 'ColumnName', type: 'string' },
  { index: 1, name: 'DataTypeName', type: 'string' },
  { index: 2, name: 'AllowDBNull', type: 'string' }
  ];
  var rds = [];

  if (rows[0].length > 0) {
    _.each(rows[0], function (d) {
      rds.push({ ColumnName: d.Field, DataTypeName: getColTypemy(d.Type.indexOf('(') > -1 ? (d.Type.split('(')[0]) : d.Type), AllowDBNull: d.Null == 'NO' ? 'False' : 'True' /*not handle*/ });
    });
  } else {
    _.each(fields, function (d) {
      rds.push({ ColumnName: d.name, DataTypeName: getColType(d.type), AllowDBNull: 'true' /*not handle*/ });
    });
  }
  return ({ data: rds, schema: cols });
}






var SqlCommand = function (profileid) {
  var dbtyp = 'mysql';
  this.createInsertCommand = function (table, schema, values) {
    if (!values || !_.isArray(values) || values.length == 0)
      return "";

    var sql = "INSERT INTO <%= table %> (<%= cols %>) VALUES <%= values %>";
    var m = { table: table, cols: "", values: "" };
    var columns = [];
    _.each(schema, function (col) {
      if (dbtyp == 'mysql') {
        columns.push("`" + col.name + "`");
      } else {
        columns.push(col.name);
      }
    });
    m.cols = columns.join(",");
    var val_arr = [];
    _.each(values, function (d) {
      var arr = [];
      _.each(schema, function (col) {
        if (_.isNull(d[col.name]) || _.isUndefined(d[col.name]))
          arr.push("NULL");
        else {
          var d_obj;
          if (col.type == 'Decimal' || col.type == 'Int' || col.type == 'BigInt' || col.type == 'SmallInt')
            d_obj = (d[col.name].toString() == "") ? "NULL" : d[col.name];
          else if (col.type == 'DateTime')
            d_obj = (d[col.name].toString() == "") ? "NULL" : "'" + d[col.name] + "'";
          else {
            var dd_val = d[col.name];
            if (dd_val)
              dd_val = dd_val.toString().replace(new RegExp('\'', "gi"), '\'\'');
            else {
              dd_val = "";
            }
            d_obj = "'" + dd_val + "'";
          }
          arr.push(d_obj);
        }
      });
      val_arr.push("(" + arr.join(",") + ")");
    });
    m.values = val_arr.join(",");
    var template = _.template(sql);
    var res = template(m);
    return res;
  };

  this.createDeleteCommand = function (table, conditions) {
    var sql = "DELETE {{table}} WHERE {{conds}};";
    var m = { table: table, conds: conditions };

    var template = _.template(sql);
    var res = template(m);
    return res;
  };

  this.createUpdateCommand = function (table, schema, object, conditions) {
    var sql = "UPDATE <%= table %> SET <%= values %>  WHERE <%= conds %>";
    //var sql = "INSERT INTO <%= table %> (<%= cols %>) VALUES <%= values %>";
    
    var m = { table: table, values: "", conds: conditions };
    var v_arr = [],
      getColName = function (name) { return ((dbtyp == 'mysql') ? "`" + name + "`" : "[" + name + "]"); }
    _.each(_.keys(object), function (k) {
      if (_.isNull(object[k]) || _.isUndefined(object[k]))
        v_arr.push(getColName(k) + " = NULL");
      else {
        var col = _.find(schema, function (sh) { return sh.name == k; });
        if (col.type == 'Decimal' || col.type == 'Int' || col.type == 'BigInt' || col.type == 'SmallInt')
          v_arr.push(getColName(k) + " = " + ((object[k].toString() == "") ? "NULL" : object[k]));
        else if (col.type == 'DateTime')
          v_arr.push(getColName(k) + " = " + ((object[k].toString() == "") ? "NULL" : "'" + object[k] + "'"));
        else
          v_arr.push(getColName(k) + " = " + "'" + object[k] + "'");
      }
    });
    m.values = v_arr.join(",");
    var template = _.template(sql);
    var res = template(m);
    return res;
  };

  this.parseSelectCommand = function (profileid, qry) {
    var dbtyp = getProfileInfo(profileid).dbType;
    if (dbtyp == 'mysql') {
      var rps = ':sql_getdate';
      qry = qry.replace(new RegExp(rps, "gi"), 'CURDATE');
      rps = 'ISNULL';
      qry = qry.replace(new RegExp(rps, "gi"), 'IFNULL');
    } else {
      var rps = ':sql_getdate';
      qry = qry.replace(new RegExp(rps, "gi"), 'GETDATE');
    }
    return qry;
  }
};
function sqlCommand(profileid) {
  return new SqlCommand(profileid);
};

function getColType(type) {
  var t = "String";
  switch (type) {
    case 246:
      t = "Decimal";
      break;
    case 3:
      t = "Int";
      break;
    case 8:
      t = "BigInt";
      break;
    case 2:
      t = "SmallInt";
      break;
    case 12:
      t = "DateTime";
      break;
    case 10:
      t = "DateTime";
      break;
    case 11:
      t = "Time";
      break;

  }
  return t;
}
function getColTypemy(typ) {
  var t = "String";
  switch (typ) {
      case "decimal":
          t = "Decimal";
          break;
      case "int":
          t = "Int";
          break;
      case "bigint":
          t = "BigInt";
          break;
      case "Smallint":
          t = "SmallInt";
          break;
      case "datetime":
          t = "DateTime";
          break;
      case "date":
          t = "Date";
          break;
      case "time":
          t = "Time";
          break;

  }
  return t;
}
function createSchema(cols) {
  var sch = [];
  cols.forEach(function (d, i) {
    if (d)
      sch.push({ index: i, name: d.name, type: getColType(d.type) });
    else
      sch.push({ index: i, name: 'cl' + i, type: 'String' });
  });
  return sch;
}

module.exports = { executeMultipleSelectQuery, executeScalar, executeDmlQuery, getTablesSchema, sqlCommand, getTablesSchemaRecord,executeQuery };

