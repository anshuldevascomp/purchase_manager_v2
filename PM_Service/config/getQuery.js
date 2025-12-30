var query = [
    {
        "QueryId": "ContactMaster",
        "Query": `Select * from ContactMaster where ContactId = :ContactId;Select * from RestroLinkage where ContactId = :ContactId;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "ResturantLinkage",
        "Query": `Select pm.*,link.ContactId,pd.PartyGroupName
            from 00000101_Live.t_party_master pm 
            left join loyalty.RestroLinkage link on link.PartyId = pm.PartyId
            left join 00000101_Live.t_party_group_defn pd on pm.PartyGroupId = pd.PartyGroupId
            where pm.PartyType = 1 and pm.Status = 'O' and pm.Active = 'Y' and pm.CompanyId = '00000093' and pm.PartyId = :PartyId;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "Contacts",
        "Query": `Select ContactId,ContactName from loyalty.ContactMaster;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "getContacts",
        "Query": `Select ContactId as Id,ContactName as Name from loyalty.ContactMaster;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "getPointsTrackingReport",
        "Query": `Select * from PointsLedger where ContactId in (:ContactId) and PaymentDate BETWEEN :fromDate AND :toDate;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "EventMaster",
        "Query": `Select *  from other_tabs where (tab = 'Events' or tab = 'Banner') and tabId = :tabId;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "GreenPointsData",
        "Query": `WITH green_points_total AS (
            SELECT ContactId, PartyId, SUM(Amount) AS Amount, SUM(Total) AS Total
            FROM greenpoints
            WHERE ContactId = :contactId GROUP BY ContactId
        ),
        green_points_adjust AS (
            SELECT ContactId,SUM(Adjust_Points) AS Total_redeem
            FROM greenpts_adjust
            WHERE  ContactId = :contactId GROUP BY ContactId
        ),
        final_green_points AS (
            SELECT gpt.ContactId,gpt.PartyId,gpt.Amount,gpt.Total,IFNULL(gpa.Total_redeem, 0) AS Total_redeem,
            CAST((gpt.Total + IFNULL(gpa.Total_redeem, 0)) AS SIGNED) AS netgreenpoints
            FROM green_points_total gpt LEFT JOIN green_points_adjust gpa ON gpt.ContactId = gpa.ContactId)
        SELECT * FROM final_green_points; `,
        "QueryName":["viewed"]
    },
    {
        "QueryId": "EventData",
        "Query": `Select *  from other_tabs where tab = 'Events' and Active='Y' order by date desc;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "getHallOfFameData",
        "Query": `Select hof.*,cm.ContactName from HallOfFame hof left join ContactMaster cm on cm.ContactId = hof.ContactId where hof.HofDate between ':fromDate' and ':toDate';`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "SuperChamp",
        "Query": `Select * from HallOfFame HF
        Left join ContactMaster CM ON CM.ContactId=HF.ContactId
        where HofDate =(DATE_FORMAT(CURDATE(), '%Y-%m-01') );`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "NewandhotMaster",
        "Query": `Select *  from other_tabs where tab = 'New And Hot' and tabId = :tabId;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "NewnhotData",
        "Query": `Select *  from other_tabs where tab = 'New And Hot' and Active='Y' order by date desc;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "BannerData",
        "Query": `Select * from other_tabs where Tab='Banner' and Type='Banner' and Active='Y'order by TabId desc 
        limit 1;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "GreyPointsData",
        "Query": `SELECT  cm.ContactId,cm.ContactName,cm.Designation,cm.Department,cm.Email,sum(  plAgg.greyearned) greyearned,plAgg.greyconverted,Sum( plAgg.netgreypoints) netgreypoints1,gpAgg.Amount AS gp_amount,ROUND(Sum(  gpAgg.Total ))AS netgreenpoints,
        ROUND(Sum( plAgg.greyearned)-Sum(  gpAgg.Total ))netgreypoints1, CurrAgg.greyearned ,
-- 		(CASE WHEN now() <= date_add(last_day(date_sub(now(),INTERVAL 1 Month)) , INTERVAL  DAY )  
-- 			       THEN IFNULL(plAgg.greyearned,0) + IFNULL(CurrAgg.greyearned,0)
--         ELSE IFNULL(CurrAgg.greyearned,0)
-- 		 END) AS netgreypoints
    /* Net grey calc based on cutoff date */
        --     CAST( CASE 
        --         WHEN NOW() <= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL :param DAY)
        --         THEN IFNULL(sum(  plAgg.greyearned),0) + IFNULL(sum(CurrAgg.greyearned),0)-  IFNULL(sum(  gpAgg.Total),0) 
        --         ELSE IFNULL(sum(CurrAgg.greyearned),0) - IFNULL(sum(  gpAgg.Total),0) 
        --     END AS SIGNED) 
        CAST( IFNULL(sum(  plAgg.greyearned),0) + IFNULL(sum(CurrAgg.greyearned),0)-  IFNULL(sum(  gpAgg.Total),0) AS SIGNED) AS netgreypoints
        FROM ContactMaster cm
        LEFT JOIN RestroLinkage rl ON cm.ContactId = rl.ContactId
        LEFT JOIN (SELECT RestroId,SUM(GreyPointsEarned) AS greyearned, SUM(Greypointsconverted) AS greyconverted,SUM(GreyPointsEarned) - SUM(Greypointsconverted) AS netgreypoints
            FROM PointsLedger
             where TransRefDate >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH , '%Y-%m-01')
             AND TransRefDate <  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            GROUP BY RestroId
        ) plAgg ON rl.PartyId = plAgg.RestroId
        LEFT JOIN (SELECT RestroId,SUM(GreyPointsEarned) AS greyearned, SUM(Greypointsconverted) AS greyconverted,SUM(GreyPointsEarned) - SUM(Greypointsconverted) AS netgreypoints
            FROM PointsLedger
             where TransRefDate >=  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            -- AND TransRefDate >  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            GROUP BY RestroId
        ) CurrAgg ON rl.PartyId = CurrAgg.RestroId
        LEFT JOIN (
            SELECT ContactId,PartyId,SUM(Amount) AS Amount,SUM(GreenPoint) AS Total
            FROM greenpoints
            where RVDate >=  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            GROUP BY ContactId, PartyId
        ) gpAgg ON gpAgg.ContactId = cm.ContactId AND gpAgg.PartyId = rl.PartyId WHERE cm.ContactId = :contactId
        group by cm.ContactName;`,
        "QueryName":["viewed"]
    },
    {
        "QueryId": "HofMaster",
        "Query": `Select hof.*,cm.ContactName from HallOfFame hof left join ContactMaster cm on hof.ContactId = cm.ContactId where hof.Id = :Id;`,
        "QueryName": ["viewed"]
    },
    {
        "QueryId": "getGreenPointReport",
        "Query": `Select g.*,cm.ContactName from greenpts_adjust g left join ContactMaster cm on cm.ContactId = g.ContactId where g.ContactId in (:ContactId) and g.TxnDate BETWEEN :fromDate AND :toDate;`,
        "QueryName": ["viewed"]
    },
]
module.exports = function () { return query; }

