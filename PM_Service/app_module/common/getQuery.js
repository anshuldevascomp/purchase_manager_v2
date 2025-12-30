var dB = require("../dbHelp.js")
const getQuery = require("../../config/getQuery.js")
const reportQuery = require("../../config/reprotQuery.js")
const fetch = require('node-fetch');
const PreQuery = function () {
    var that = this;
    that.getQueryData2 = function (QueryId, body) {
        return new Promise(async function (resolve, reject) {
            try {
                const qur = getQuery().find((obj) => {
                    return obj.QueryId === QueryId;
                })
                let Query = qur.Query;
                let keys = Object.keys(body)
                keys.forEach((key) => {
                    let x = `:${key}`;
                    let y = `${body[key]}`;
                    Query = Query.replaceAll(`${x}`, `${y}`);
                })
                // Query=Query.replaceAll(":CompanyId",`${CompanyId}`);
                console.log(Query)
                await dB.executeMultipleSelectQuery(Query).then(function (preQueryData) {
                    var rds = preQueryData;
                    rds.forEach((val, i = 0) => {
                        val.tableName = qur.QueryName[i];
                    })
                    resp = rds;
                    resolve(resp)
                });
            }
            catch (ex) {
                reject({ message: 'Error in fetching prequery data.' });
            }
        })
    }

    that.getBrowserData = function (reportId) {
        return new Promise(async function (resolve, reject) {
            try {
                const qur = reportQuery().find((obj) => {
                    return obj.QueryId === reportId;
                })
                let Query = qur.Query;
                // Query=Query.replaceAll(":CompanyId",`${CompanyId}`);
                console.log(Query)
                await dB.executeMultipleSelectQuery(Query).then(function (preQueryData) {
                    var rds = preQueryData;
                    rds.forEach((val, i = 0) => {
                        val.tableName = qur.QueryName[i];
                    })
                    resp = rds;
                    resolve(resp)
                });
            } catch (error) {
                reject({ message: 'Error in fetching report data.' });
            }
        })
    }


    that.executeReportData = function (req) {
        let url = 'https://cloud.ireckoner.in:4130/transaction/PurchaseManagerInvoices/'; //live
        // let url = 'http://localhost:4130/transaction/PurchaseManagerInvoices/'; //local
        const { fromDate, toDate } = req.body;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Invalid or missing parameters.' });
        }
        return new Promise(async function (resolve, reject) {
            try {
                const reqBody = {
                    StartDate: fromDate,
                    EndDate: toDate,
                    CompanyId: '00000093',
                    ProfileId: "staging"
                }
                const response =await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json', // important for JSON body
                    },
                    body: JSON.stringify(reqBody), // convert JS object to JSON
                  });
                const data = await response.json();
                const ledger_data = data[0]['data'];
                const query = `Select * from PointsLedger where PaymentDate BETWEEN '${fromDate}' AND '${toDate}';`
                const result = await dB.executeMultipleSelectQuery(query);
                const pm_result = result[0]['data'];
                const filtered = ledger_data.filter(item1 => 
                    !pm_result.some(item2 => item2.TransReference == item1.DocSlNo)
                );
                const restro_linkage_qry = 'Select * from RestroLinkage';
                let result_restro_linkage = await dB.executeMultipleSelectQuery(restro_linkage_qry );
                result_restro_linkage = result_restro_linkage[0]['data'];
                filtered.forEach(item => {
                    const match = result_restro_linkage.find(x => x.PartyId === item.PartyId);
                    if (match) {
                        item.ContactId = match.ContactId;
                    }else{
                        item.ContactId = '';
                    }
                });


                resolve(filtered);
                
            }
            catch (ex) {
                reject({ message: 'Error in fetching prequery data.' });
            }
        })
    }

    that.executeGreenReportData = function (req) {
        let url = 'https://cloud.ireckoner.in:4130/transaction/greenPointsData/'; //live
        // let url = 'http://localhost:4130/transaction/greenPointsData/';
        const { fromDate, toDate } = req.body;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Invalid or missing parameters.' });
        }
        return new Promise(async function (resolve, reject) {
            try {
                const reqBody = {
                    StartDate: fromDate,
                    EndDate: toDate,
                    CompanyId: '00000093',
                    ProfileId: "staging"
                }
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json', // important for JSON body
                    },
                    body: JSON.stringify(reqBody), // convert JS object to JSON
                  });
                const data = await response.json();
                const ledger_data = data[0]['data'];;
                const query = `Select * from greenpoints;`
                const result = await dB.executeMultipleSelectQuery(query);
                const pm_result = result[0]['data'];
                const filtered = ledger_data.filter(item1 => 
                    !pm_result.some(item2 => item2.RVNumber === item1.RVNumber)
                );
                const restro_linkage_qry = 'Select * from RestroLinkage';
                let result_restro_linkage = await dB.executeMultipleSelectQuery(restro_linkage_qry );
                result_restro_linkage = result_restro_linkage[0]['data'];
                filtered.forEach(item => {
                    const match = result_restro_linkage.find(x => x.PartyId === item.PartyId);
                    if (match) {
                        item.ContactId = match.ContactId;
                        item.Type = 'Receipt';
                    }else{
                        item.ContactId = '';
                        item.Type = 'Receipt';
                    }
                });


                resolve(filtered);
                
            }
            catch (ex) {
                reject({ message: 'Error in fetching prequery data.' });
            }
        })
    }

    that.executeGenericReportData = function (req) {
        return new Promise(async function (resolve, reject) {
            try {
                let { fromDate, toDate, ContactId } = req.body;
    
                // Validate required fields
                if (!fromDate || !toDate) {
                    return reject({ message: 'Invalid or missing date parameters.' });
                }
    
                // Convert dates to YYYY-MM-DD
                req.body.fromDate = new Date(fromDate).toISOString().split('T')[0];
                req.body.toDate = new Date(toDate).toISOString().split('T')[0];
    
                // Convert ContactId array → "1,2,3"
                if (Array.isArray(ContactId)) {
                    req.body.ContactId = ContactId.map(id => `'${id}'`).join(",");
                }
    
                const QueryId = req.query.QueryId;
    
                const qur = getQuery().find((obj) => obj.QueryId === QueryId);
                if (!qur) {
                    return reject({ message: "QueryId not found" });
                }
    
                let Query = qur.Query;
    
                // Replace all :keys with values
                let keys = Object.keys(req.body);
                keys.forEach((key) => {
                    let value = req.body[key];
                
                    // If it is a date (YYYY-MM-DD), wrap in quotes
                    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        value = `'${value}'`;
                    }
                
                    Query = Query.replaceAll(`:${key}`, value);
                });
    
                // Execute query
                const preQueryData = await dB.executeMultipleSelectQuery(Query);
    
                preQueryData.forEach((val, idx) => {
                    val.tableName = qur.QueryName[idx];
                });
    
                resolve(preQueryData);
    
            } catch (ex) {
                reject({ message: 'Error in fetching prequery data.' });
            }
        });
    };
    


    that.executeWinnerData = function (req) {
        let url = 'https://cloud.ireckoner.in:4130/transaction/executeWinnerData/'; //live
        // let url = 'http://localhost:4130/transaction/executeWinnerData/'; //local
        const { fromDate, toDate } = req.body;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Invalid or missing parameters.' });
        }
        return new Promise(async function (resolve, reject) {
            try {
                const reqBody = {
                    StartDate: fromDate,
                    EndDate: toDate,
                    CompanyId: '00000093',
                    ProfileId: "staging"
                }
                const response =await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json', // important for JSON body
                    },
                    body: JSON.stringify(reqBody), // convert JS object to JSON
                  });
                const data = await response.json();
                const winner_data = data[0]['data'];
                const query = `Select * from ContactMaster c left join RestroLinkage r on c.ContactId = r.ContactId;`
                const result = await dB.executeMultipleSelectQuery(query);
                const contact_result = result[0]['data'];
                const partyToContactMap = {};
                contact_result.forEach(item => {
                    if (!partyToContactMap[item.PartyId]) {
                        partyToContactMap[item.PartyId] = item.ContactId;
                    }
                });

                const contactMap = {};
                contact_result.forEach(c => {
                    contactMap[c.ContactId] = c;
                });


                const grouped = winner_data.reduce((acc, item) => {
                    const contactId = partyToContactMap[item.PartyId] || "NO_CONTACT";
                    if (!acc[contactId]) {
                        acc[contactId] = [];
                    }
                    acc[contactId].push(item);  
                    return acc;

                }, {});

                delete grouped.NO_CONTACT;

                if(Object.keys(grouped).length === 0){
                    reject({ message: 'No Data to Dsiplay' });
                    return;
                }

                const summary = Object.keys(grouped).map(contactId => {
                    const items = grouped[contactId];
                
                    const attr40Sum = items.reduce((sum, x) => sum + (Number(x.HeadAttr40) || 0), 0);
                    const categoryCntSum = items.reduce((sum, x) => sum + (Number(x.categoryCnt) || 0), 0);
                    let avgGrowthPercentSum = items.reduce((sum, x) => sum + (Number(x.AvgGrowthPercent) || 0), 0);
                    avgGrowthPercentSum = avgGrowthPercentSum / items.length;
                
                    // Assuming all items for a contact have the same ContactName
                    const contactName = contactMap[contactId]['ContactName'] || '';
                
                    return {
                        contactId,
                        contactName,
                        attr40Sum,
                        categoryCntSum,
                        avgGrowthPercentSum  
                    };
                });
                
                const maxAttr40Contact = summary.reduce((a, b) =>
                    b.attr40Sum > a.attr40Sum ? b : a
                );
                const maxCategoryCntContact = summary.reduce((a, b) =>
                    b.categoryCntSum > a.categoryCntSum ? b : a
                );
                const maxAvgGrowthPercentContact = summary.reduce((a, b) =>
                    b.avgGrowthPercentSum > a.avgGrowthPercentSum ? b : a
                );
                const filtered = [{...maxAttr40Contact, type: 'Champ Purchaser'}, {...maxCategoryCntContact, type: 'SKU Rockstar'}, {...maxAvgGrowthPercentContact, type: 'Growth Champ'}]
                  
                  
            


                resolve(filtered);
                
            }
            catch (ex) {
                reject({ message: 'Error in fetching prequery data.' });
            }
        })
    }   

    that.executePmt = function (req) {
        let url = 'https://cloud.ireckoner.in:4130/transaction/executePmt'; //live
       // let url = 'http://localhost:4130/transaction/executePmt';
       return new Promise(async function (resolve, reject) {
           var contactId = req.body.ContactId;
           try {
               const reqBody = {
                   CompanyId: '00000093',
                   ProfileId: "staging"
               }
               const response = await fetch(url, {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json', // important for JSON body
                   },
                   body: JSON.stringify(reqBody), // convert JS object to JSON
                 });
               const data = await response.json();
               const pmt_data = data[0]['data'];;
               const restro_linkage_qry = `Select cm.ContactId,cm.ContactName, rl.PartyId from ContactMaster  cm
               Left join RestroLinkage rl on cm.ContactId=rl.ContactId
               where cm.ContactId=${contactId};`;
               let result_restro_linkage = await dB.executeMultipleSelectQuery(restro_linkage_qry );
               result_restro_linkage = result_restro_linkage[0]['data'];
               const linkageIds = new Set(result_restro_linkage.map(r => r.PartyId));
               const matchedList = pmt_data.filter(pmt => linkageIds.has(pmt.PartyId));
               const creditDaysFlag = matchedList.some(
                   item => item.creditDays >= 0 && item.creditDays <= 7
                 );
                 const result = [
                   matchedList,
                   [{ creditDays: creditDaysFlag }]
                 ];
               resolve(result);              
           }
           catch (ex) {
               reject({ message: 'Error in fetching prequery data.' });
           }
       })
   }

   that.getItemData = function (req) {
    let url = 'https://cloud.ireckoner.in:4130/transaction/getItemsData'; //live
    // let url = 'http://localhost:4130/transaction/getItemsData/'; //local
    return new Promise(async function (resolve, reject) {
        try {
            const reqBody = {
                CompanyId: '00000093',
                ProfileId: "staging"
            }
            const response =await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // important for JSON body
                },
                body: JSON.stringify(reqBody), // convert JS object to JSON
              });
            const data = await response.json();
            const item_data = data[0]['data'];
            resolve(item_data);
            
        }
        catch (ex) {
            reject({ message: 'Error in fetching prequery data.' });
        }
    })
}  
that.getItemName = function (req) {
     let url = 'https://cloud.ireckoner.in:4130/transaction/getItemsName/'; //live
    // let url = 'http://localhost:4130/transaction//getItemName/'; //local
    return new Promise(async function (resolve, reject) {
        try {
            var ItemId = req.body.ItemId;
            const reqBody = {
                CompanyId: '00000093',
                ProfileId: "staging",
                ItemId:ItemId
            }
            const response =await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // important for JSON body
                },
                body: JSON.stringify(reqBody), // convert JS object to JSON
              });
            const data = await response.json();
            const item_data = data[0]['data'];
            resolve(item_data);
            
        }
        catch (ex) {
            reject({ message: 'Error in fetching prequery data.' });
        }
    })
} 
that.champPurchaser = function (req) {
    let url = 'https://cloud.ireckoner.in:4130/transaction/champPurchaser/'; //live
    // let url = 'http://localhost:4130/transaction/champPurchaser/'; //local
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Invalid or missing parameters.' });
    }
    return new Promise(async function (resolve, reject) {
        try {
            const reqBody = {
                StartDate: fromDate,
                EndDate: toDate,
                CompanyId: '00000093',
                ProfileId: "staging"
            }
            const response =await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // important for JSON body
                },
                body: JSON.stringify(reqBody), // convert JS object to JSON
            });
            const data = await response.json();
            const winner_data = data[0]['data'];
            const query = `Select * from ContactMaster c left join RestroLinkage r on c.ContactId = r.ContactId;`
            const result = await dB.executeMultipleSelectQuery(query);
            const contact_result = result[0]['data'];
            const partyToContactMap = {};
            contact_result.forEach(item => {
                if (!partyToContactMap[item.PartyId]) {
                    partyToContactMap[item.PartyId] = item.ContactId;
                }
            });

            const contactMap = {};
            contact_result.forEach(c => {
                contactMap[c.ContactId] = c;
            });


            const grouped = winner_data.reduce((acc, item) => {
                const contactId = partyToContactMap[item.PartyId] || "NO_CONTACT";
                if (!acc[contactId]) {
                    acc[contactId] = [];
                }
                acc[contactId].push(item);  
                return acc;

            }, {});

            delete grouped.NO_CONTACT;

            if(Object.keys(grouped).length === 0){
                reject({ message: 'No Data to Dsiplay' });
                return;
            }

            const summary = Object.keys(grouped).map(contactId => {
                const items = grouped[contactId];
            
                const TotalAmount = items.reduce((sum, x) => sum + (Number(x.TotalAmount) || 0), 0);
                const Sales = items.reduce((sum, x) => sum + (Number(x.Sales) || 0), 0);
                const SalesReturn = items.reduce((sum, x) => sum + (Number(x.SalesReturn) || 0), 0);
            
                // Assuming all items for a contact have the same ContactName
                const contactName = contactMap[contactId]['ContactName'] || '';
            
                return {
                    contactId,
                    contactName,
                    TotalAmount,
                    Sales,
                    SalesReturn,
                    isCheck: false
                };
            });
            const prevDataQry = `Select * from HallOfFame where Hall_of_fame_name = 'Champ Purchaser' and  HofDate = '${fromDate}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0].data.length > 0){
                const prevDataId = prevData[0]['data'][0]['ContactId'];
                summary.forEach(item => {
                    if(item.contactId == prevDataId){
                        item.isCheck = true;
                    }
                });
            }
            summary.sort((a, b) => b.TotalAmount - a.TotalAmount);
            resolve(summary);
            
        }
        catch (ex) {
            reject({ message: 'Error in fetching prequery data.' });
        }
    })
}   
that.growthChamp = function (req) {
    let url = 'https://cloud.ireckoner.in:4130/transaction/growthChamp/'; //live
    // let url = 'http://localhost:4130/transaction/growthChamp/'; //local
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Invalid or missing parameters.' });
    }
    return new Promise(async function (resolve, reject) {
        try {
            const reqBody = {
                StartDate: fromDate,
                EndDate: toDate,
                CompanyId: '00000093',
                ProfileId: "staging"
            }
            const response =await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // important for JSON body
                },
                body: JSON.stringify(reqBody), // convert JS object to JSON
              });
            const data = await response.json();
            const winner_data = data[0]['data'];
            const query = `Select * from ContactMaster c left join RestroLinkage r on c.ContactId = r.ContactId;`
            const result = await dB.executeMultipleSelectQuery(query);
            const contact_result = result[0]['data'];
            const partyToContactMap = {};
            contact_result.forEach(item => {
                if (!partyToContactMap[item.PartyId]) {
                    partyToContactMap[item.PartyId] = item.ContactId;
                }
            });

            const contactMap = {};
            contact_result.forEach(c => {
                contactMap[c.ContactId] = c;
            });


            const grouped = winner_data.reduce((acc, item) => {
                const contactId = partyToContactMap[item.PartyId] || "NO_CONTACT";
                if (!acc[contactId]) {
                    acc[contactId] = [];
                }
                acc[contactId].push(item);  
                return acc;

            }, {});

            delete grouped.NO_CONTACT;

            if(Object.keys(grouped).length === 0){
                reject({ message: 'No Data to Dsiplay' });
                return;
            }

            const summary = Object.keys(grouped).map(contactId => {
                const items = grouped[contactId];
            
                //const TotalAmount = items.reduce((sum, x) => sum + (Number(x.TotalAmount) || 0), 0);
                let AvgGrowthPercent = items.reduce((sum, x) => sum + (Number(x.AvgGrowthPercent) || 0), 0);
                AvgGrowthPercent = AvgGrowthPercent / items.length;
                let Last3rdMonthGrowth = items.reduce((sum, x) => sum + (Number(x.Last3rdMonthGrowth) || 0), 0);
                Last3rdMonthGrowth = Last3rdMonthGrowth / items.length;
                let Last2ndMonthGrowth = items.reduce((sum, x) => sum + (Number(x.Last2ndMonthGrowth) || 0), 0);
                Last2ndMonthGrowth = Last2ndMonthGrowth / items.length;
                let Last1stMonthGrowth = items.reduce((sum, x) => sum + (Number(x.Last1stMonthGrowth) || 0), 0);
                Last1stMonthGrowth = Last1stMonthGrowth / items.length;
                // Assuming all items for a contact have the same ContactName
                const contactName = contactMap[contactId]['ContactName'] || '';
            
                return {
                    contactId,
                    contactName,
                    Last3rdMonthGrowth,
                    Last2ndMonthGrowth,
                    Last1stMonthGrowth,
                    AvgGrowthPercent
                };
            });
            const prevDataQry = `Select * from HallOfFame where Hall_of_fame_name = 'Growth Hacker' and  HofDate = '${fromDate}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0].data.length > 0){
                const prevDataId = prevData[0]['data'][0]['ContactId'];
                summary.forEach(item => {
                    if(item.contactId == prevDataId){
                        item.isCheck = true;
                    }
                });
            }
            summary.sort((a, b) => b.AvgGrowthPercent - a.AvgGrowthPercent);
            resolve(summary);
            
        }
        catch (ex) {
            reject({ message: 'Error in fetching prequery data.' });
        }
    })
}   
that.skuRockstar = function (req) {
    let url = 'https://cloud.ireckoner.in:4130/transaction/skuRockstar/'; //live
    // let url = 'http://localhost:4130/transaction/skuRockstar/'; //local
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Invalid or missing parameters.' });
    }
    return new Promise(async function (resolve, reject) {
        try {
            const reqBody = {
                StartDate: fromDate,
                EndDate: toDate,
                CompanyId: '00000093',
                ProfileId: "staging"
            }
            const response =await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json', // important for JSON body
                },
                body: JSON.stringify(reqBody), // convert JS object to JSON
              });
            const data = await response.json();
            const winner_data = data[0]['data'];
            const query = `Select * from ContactMaster c left join RestroLinkage r on c.ContactId = r.ContactId;`
            const result = await dB.executeMultipleSelectQuery(query);
            const contact_result = result[0]['data'];
            const partyToContactMap = {};
            contact_result.forEach(item => {
                if (!partyToContactMap[item.PartyId]) {
                    partyToContactMap[item.PartyId] = item.ContactId;
                }
            });

            const contactMap = {};
            contact_result.forEach(c => {
                contactMap[c.ContactId] = c;
            });


            const grouped = winner_data.reduce((acc, item) => {
                const contactId = partyToContactMap[item.PartyId] || "NO_CONTACT";
                if (!acc[contactId]) {
                    acc[contactId] = [];
                }
                acc[contactId].push(item);  
                return acc;

            }, {});

            delete grouped.NO_CONTACT;

            if(Object.keys(grouped).length === 0){
                reject({ message: 'No Data to Dsiplay' });
                return;
            }

            const summary = Object.keys(grouped).map(contactId => {
                const items = grouped[contactId];

                const uniqueSubcategories = [...new Set(items.map(x => x.SubCategory))];
                const subcategoriesCount = uniqueSubcategories.filter(x => x !== null).length;
            
                // Assuming all items for a contact have the same ContactName
                const contactName = contactMap[contactId]['ContactName'] || '';
            
                return {
                    contactId,
                    contactName,
                    subcategoriesCount,
                    isCheck: false
                };
            });
            const prevDataQry = `Select * from HallOfFame where Hall_of_fame_name = 'SKU Rockstar' and  HofDate = '${fromDate}';`;
            const prevData = await dB.executeMultipleSelectQuery(prevDataQry);
            if(prevData[0].data.length > 0){
                const prevDataId = prevData[0]['data'][0]['ContactId'];
                summary.forEach(item => {
                    if(item.contactId == prevDataId){
                        item.isCheck = true;
                    }
                });
            }
            summary.sort((a, b) => b.subcategoriesCount - a.subcategoriesCount);
            resolve(summary);
            
        }
        catch (ex) {
            reject({ message: 'Error in fetching prequery data.' });
        }
    })
}  
that.getPartydata = function (req) {
    let url = 'https://cloud.ireckoner.in:4130/transaction/getPartyData'; //live
   // let url = 'http://localhost:4130/transaction//getItemName/'; //local
   return new Promise(async function (resolve, reject) {
    var contactId = req.body.ContactId;
       try {
           const reqBody = {
               CompanyId: '00000093',
               ProfileId: "staging",
             
           }
           const response =await fetch(url, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json', // important for JSON body
               },
               body: JSON.stringify(reqBody), // convert JS object to JSON
             });
           const data = await response.json();
           const party_data = data[0]['data'];
           const restro_linkage_qry = `Select cm.ContactId,cm.ContactName, rl.PartyId from ContactMaster  cm
               Left join RestroLinkage rl on cm.ContactId=rl.ContactId
               where cm.ContactId=${contactId};`;
               let result_restro_linkage = await dB.executeMultipleSelectQuery(restro_linkage_qry );
               result_restro_linkage = result_restro_linkage[0]['data'];
               const linkageIds = new Set(result_restro_linkage.map(r => r.PartyId));
               const matchedList = party_data.filter(pmt => linkageIds.has(pmt.PartyId));
               console.log(matchedList);
           resolve(matchedList);
           
       }
       catch (ex) {
           reject({ message: 'Error in fetching prequery data.' });
       }
   })
} 

that.growthpercent= function (req) {
     let url = 'https://cloud.ireckoner.in:4130/transaction/Growthpercentprofile'; //live
   // let url = 'http://localhost:4130/transaction/executePmt';
   return new Promise(async function (resolve, reject) {
       var contactId = req.body.ContactId;
       try {
        const restro_linkage_qry = `Select cm.ContactId,cm.ContactName, rl.PartyId from ContactMaster  cm
        Left join RestroLinkage rl on cm.ContactId=rl.ContactId
        where cm.ContactId=${contactId};`;
        let result_restro_linkage = await dB.executeMultipleSelectQuery(restro_linkage_qry );
        result_restro_linkage = result_restro_linkage[0]['data'];
        const commaSeparatedIds = result_restro_linkage.map(p => p.PartyId).join(', ');

           const reqBody = {
               CompanyId: '00000093',
               ProfileId: "staging",
               PartyId:commaSeparatedIds
           }
           const response = await fetch(url, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json', // important for JSON body
               },
               body: JSON.stringify(reqBody), // convert JS object to JSON
             });
           const data = await response.json();
           const pmt_data = data[0]['data'];;

        //    const linkageIds = new Set(result_restro_linkage.map(r => r.PartyId));
        //    const matchedList = pmt_data.filter(pmt => linkageIds.has(pmt.PartyId));
        //    const creditDaysFlag = matchedList.some(
        //        item => item.creditDays >= 0 && item.creditDays <= 7
        //      );
        //      const result = [
        //        matchedList,
        //        [{ creditDays: creditDaysFlag }]
        //      ];
           resolve(pmt_data);              
       }
       catch (ex) {
           reject({ message: 'Error in fetching prequery data.' });
       }
   })
}

}

module.exports = new PreQuery();