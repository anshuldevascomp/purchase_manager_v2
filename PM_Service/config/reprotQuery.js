var query =[
    {
        "QueryId": "ContactMaster",
        "Query": `Select * from ContactMaster;`,
        "QueryName":["viewed"]
    },
    {
        "QueryId": "resturantlinkage",
        "Query": `Select pm.*,pd.PartyGroupName from  00000101_Live.t_party_master pm
left join 00000101_Live.t_party_group_defn pd on pm.PartyGroupId = pd.PartyGroupId
where pm.PartyType = 1 and pm.Status = 'O' and pm.Active = 'Y' and pm.CompanyId = '00000093';`,
        "QueryName":["viewed"]
    },
    {
        "QueryId": "EventMaster",
        "Query": `Select * from other_tabs where tab = 'Events' or tab = 'Banner';`,
        "QueryName":["viewed"]
    },
    {
        "QueryId": "NewAndHot",
        "Query": `Select * from other_tabs where tab = 'New And Hot'`,
        "QueryName":["viewed"]
    }
]
module.exports = function () { return query; }

