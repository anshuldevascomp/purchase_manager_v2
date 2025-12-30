exports.getPrequeryData2 = async (req, res) => {
    try {
        let QueryId = req.query.QueryId;
        let body = req.body;
        var ob = require("../app_module/common/getQuery.js");
        ob.getQueryData2(QueryId, body).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    }
}

exports.executeData = async (req,res)=>{
    try {
       let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.getBrowserData(reportId).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.executeReportData = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executeReportData(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.executeGreenReportData = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executeGreenReportData(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.executePmt = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executePmt(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.executeGenericReportData = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executeGenericReportData(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.executeWinnerData = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executeWinnerData(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}

exports.executePmt = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.executePmt(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}

exports.getItemData = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.getItemData(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}


exports.champPurchaser = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.champPurchaser(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.growthChamp = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.growthChamp(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    }
}
exports.skuRockstar = async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.skuRockstar(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (err) {
        res.status(500).send({ status: "error", message: err.message });
    }
}


exports.getItemName= async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.getItemName(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}


exports.getPartyData= async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.getPartydata(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}

exports.growthpercent= async (req,res)=>{
    try {
    //    let reportId = req.query.reportId;
       var ob = require("../app_module/common/getQuery.js");
        ob.growthpercent(req).then(function (rds) {
            res.send(rds);
        }).catch(function (err) {
            res.status(500).send({ status: 'error', message: err.message });
        });
       
    } catch (error) {
        res.status(500).send({ status: "error", message: err.message });
    }
}



