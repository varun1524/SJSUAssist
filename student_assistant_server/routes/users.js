let express = require('express');
let router = express.Router();
let act = require('./activity');
let shell = require('shelljs');
let mongo = require("./mongo");
let mongoURL = "mongodb://localhost:27017/student_assistant";
let ObjectId = require('mongodb').ObjectID;
// let fse = require('fs-extra');
let filePath="";

router.post('/getActivityData', function (req, res, next) {
    try {
        console.log("In fetching activity");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;

            let jsonObj = [];

            mongo.connect(mongoURL, function () {
                let useractivitycoll = mongo.collection("useractivities");
                useractivitycoll.find({$and:[{username:username},{activitytype:"signup"}]}).toArray(function (err, results) {
                    console.log(results);
                    if(err){
                        console.log("Error while fetting account creation data");
                    }
                    if(results.length===1) {
                        let tempObj={};
                        tempObj["activitytype"] = results[0].activitytype;
                        tempObj["activitytime"] = results[0].activitytime;
                        tempObj["username"] = results[0].username;
                        jsonObj.push(tempObj);

                        useractivitycoll.find({$and:[{username:username},{activitytype:"login"}]}).sort({activitytime:-1}).limit(4).toArray(function (err, results1) {
                            console.log(results1);
                            if(err){
                                console.log(err);
                                throw err;
                            }
                            else
                            {
                                if(results1.length>0) {
                                    for (i = 0; i < results1.length; i++) {
                                        let tempObj = {};
                                        tempObj["activitytype"] = results1[i].activitytype;
                                        tempObj["activitytime"] = results1[i].activitytime;
                                        jsonObj.push(tempObj);
                                    }
                                    res.status(201).send(jsonObj);
                                }
                                else {
                                    res.status(301).send({"message":"Unrecognized Error. No activity found"});
                                }
                            }
                        });
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.post('/changeProfile', function (req, res, next) {
    try {
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            console.log(username);
            let data = req.body;
            console.log(data);
            updateQuery= {
                $set : {
                    overview : data.overview,
                    education : data.education,
                    contactinfo : data.contactinfo,
                    lifeevents : data.lifeevent,
                    work : data.work,
                    music : data.music,
                    reading : data.reading,
                    sports : data.sports,
                }
            };

            mongo.connect(mongoURL, function () {
                mongo.collection("userprofile").updateOne({_id:username},updateQuery, function (err, results) {
                    console.log(results);
                    if (err) {
                        throw err;
                    }
                    if (results.result.nModified === 1) {
                        res.status(201).send({"message":"Profile updated successfully"});
                    }
                    else {
                        res.status(301).send({"message":"Failed to Update Profile"});
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

router.get('/getprofile', function (req, res, next) {
    console.log("Here O m");
    try {
        console.log("In fetching profile");
        if(req.session.username!==null || req.session.username!==undefined) {
            let username = req.session.username;
            mongo.connect(mongoURL,function () {
                let profile = mongo.collection("userprofile");
                profile.find({_id:username}).toArray(function (err, results) {
                    console.log(results);
                    if (err) {
                        throw err;
                    }
                    if (results.length === 1) {
                        res.status(201).send(results);
                    }
                    else {
                        res.status(301).send({"message":"Failed to fetch Profile Data"});
                    }
                });
            });
        }
        else{
            res.status(203).send({"message":"Session Expired. Please Login Again"});
        }
    }
    catch (e){
        console.log(e);
        console.log("error");
        res.status(301).send({"message" : "Error while fetching activity data"});
    }
});

deleteFromDatabase = ((name, path) => {
    try{
        console.log("Delete here: "+name+"   "+path);
    }
    catch(e) {
        throw e;
    }
});

module.exports = router;