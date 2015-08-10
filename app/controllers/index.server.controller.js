/**
 * Created by guanghu on 6/15/15.
 */


var mysql = require('mysql');
var fs = require('fs');
var math = require('mathjs');
var path = require('path');

var projectInfo = mysql.createConnection(
    {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'project_priority'
    }
);


var queryString = 'SELECT * FROM PROJECT_INFO';

var index = function(req, res) {
    var action = req.query.action;
    //get the project rows from database
    if (action == 'queryProjects') {
        projectInfo.query(queryString, function(err, rows) {
            //console.log(weight);
            if (err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.header('Access-Control-Allow-Origin', "*");
            var weight = {};
            fs.readFile('./public/weight', 'utf8', function (err,data) {
                if (err) throw err;
                console.log("Reading data " + data);
                weight = JSON.parse(data);
                var costs = [], dates = [], mandates = [], LOE = [];

                for (var row in rows) {
                    rows[row].Date_Rel = modifyDate((rows[row].Date.getTime() - new Date().getTime()));
                    //console.log('date_rel is ' + rows[row].Date_Rel + '     date is ' + rows[row].Date);
                    costs.push(rows[row].Cost);
                    dates.push(rows[row].Date_Rel);
                    mandates.push(rows[row].Mandate);
                    LOE.push(rows[row].LOE);
                }
                //mean values
                var costMean = math.mean(costs);
                var dateMean = math.mean(dates);
                var mandateMean = math.mean(mandates);
                var LOEMean = math.mean(LOE);
                //std values
                var costStd = math.std(costs);
                var dateStd = math.std(dates);
                var mandateStd = math.std(mandates);
                var LOEStd = math.std(LOE);
                //the function of calculating the grades of each fact
                var z_score = function(data, mean, std) {
                    if (data == mean) return 0;
                    return (data - mean) / std;
                };



                for (var row in rows) {
                    var r = rows[row];
                    r.Cost_Grade = z_score(r.Cost, costMean, costStd);
                    r.Date_Grade = z_score(r.Date_Rel, dateMean, dateStd);
                    r.Mandate_Grade = z_score(r.Mandate, mandateMean, mandateStd);
                    r.LOE_Grade = z_score(r.LOE, LOEMean, LOEStd);
                    console.log('mandate grade is ' + r.Mandate_Grade);

                    r.Grade = parseFloat((r.Cost_Grade * weight.Cost + r.Date_Grade * weight.Date + r.Mandate_Grade * weight.Mandate + r.LOE_Grade * weight.LOE).toFixed(2));
                    r.Date = r.Date.yyyymmdd();

                    console.log("Grade is"  + r.Grade);
                }
                var result = rows;
                res.send(JSON.stringify(result));
            });
        });
        return;
    }

    fs.readFile('./public/weight', 'utf8', function (err,data) {
        if (err) throw err;
        console.log("Reading data " + data);
        var weight = JSON.parse(data);
        res.render('index2.html');
    });


};

//this is to handle create, delete and edit action for the database
var update = function(req, res) {
    //var action = req.query.action;
    //console.log('action is ' + action);
    console.log("body is" + JSON.stringify(req.body));
    var action = req.body.action;
    console.log(action);
    if (action == 'create') {
        var data = req.body.data;
        var post = {};
        //console.log('type of date is ' + typeof req.body.Date);
        post.Project_Name = data.Project_Name;
        post.Cost = data.Cost;
        post.Date = data.Date;
        post.Mandate = data.Mandate;
        post.Group_Name = data.Group_Name;
        post.Android = data.Android;
        post.IOS = data.IOS;
        post.Server = data.Server;
        post.LOE = data.LOE;
        post.Project_Info = data.Project_Info;
        post.Color = data.Color;
        console.log('mandate = ' + post.Mandate);

        var query = projectInfo.query('INSERT INTO project_info set ?', post, function (err, result) {
            if (err) throw err;
            data.Id = result.insertId;
            //console.log(result);
            //console.log(JSON.stringify(result));
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));

            console.log(query.sql);
            return;
            //insert(req, res);
        });
    }

    else if (action == 'remove') {
        var Id = req.body.id;
        console.log(Id);

        var delQuery = 'DELETE FROM PROJECT_INFO WHERE ID =' + Id;
        var query = projectInfo.query(delQuery, function (err, result) {
            if (err) throw err;
            re = {};
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(re));
        });


    }

    else if (action == 'edit') {
        var data = req.body.data;
        var Id = req.body.id;
        console.log(req);

      //var editQuery = 'UPDATE PROJECT_INFO SET COST=' + data.Cost + ', DATE=' + '\'' + data.Date.substring(0, 10) + '\'' + ', MANDATE=' + '\'' + data.Mandate + '\'' + ', PROJECT_NAME=' + '\'' + data.Project_Name + '\'' + ', GROUP_NAME='   + '\'' + data.Group_Name  + '\'' + ' WHERE ID=' + Id;
        var editQuery = 'UPDATE PROJECT_INFO SET COST=?, DATE=?, MANDATE=?, PROJECT_NAME=?, ANDROID=?, IOS=?, SERVER=?, GROUP_NAME=?, COLOR=? WHERE ID=?';
        //console.log(editQuery);
        var query = projectInfo.query(editQuery, [data.Cost, data.Date, data.Mandate, data.Project_Name, data.Android, data.IOS, data.Server, data.Group_Name, data.Color, Id], function(err, result) {
            if (err) throw err;
            console.log("sql is " + query.sql);
            console.log('is editing');
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        });
    }
};


var refresh = function(req, res) {

    //console.log(res);
    var post = {};
    post.Cost = req.body.Cost;
    post.Date = req.body.Date;
    post.Mandate = req.body.Mandate;
    post.LOE = req.body.LOE;

    fs.writeFile("./public/weight", JSON.stringify(post), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
        res.redirect('/index');

        //insert(req, res);
    });
};

var getWeight = function(req, res) {
    fs.readFile('./public/weight', 'utf8', function (err,data) {
        if (err) throw err;
        console.log("Reading data " + data);
        var weight = JSON.parse(data);
        res.send(JSON.stringify(weight));
    });
};

var comment = function(req, res) {

    var project_id = req.query.project_id;
    //console.log(req);
    var queryComment = 'SELECT * FROM COMMENT WHERE PROJECT_ID=';
    projectInfo.query(queryComment + project_id, function(err, rows) {
        if (err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.header('Access-Control-Allow-Origin', "*");
        res.send(JSON.stringify(rows));
    });

};

var postcomment = function(req, res) {

    var post = {};
    post.Project_Id = req.body.Project_Id;
    post.Comment = req.body.Comment;
    post.Commenter = req.body.Commenter;
    projectInfo.query('INSERT INTO COMMENT set ?', post, function (err, result) {
        if (err) throw err;
        //console.log(result);
        res.send(JSON.stringify(post));
    });


};

var login = function(req, res) {
    res.render('login.html');
};

var getrow = function(req, res) {
    var project_id = req.query.project_id;
    console.log(project_id);
    var queryRow = 'SELECT * FROM PROJECT_INFO WHERE ID=';
    projectInfo.query(queryRow + project_id, function(err, rows) {
        if (err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.header('Access-Control-Allow-Origin', "*");
        console.log("reading row");
        res.send(JSON.stringify(rows[0]));
    })
};




var modifyDate = function(num) {
    var days = num / 1000 / 60 / 60 / 24;
    if (days <= 1) {
        return 3;
    }
    else return 0 - math.log(days / 1000, 10);
};

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

exports.refresh = refresh;
exports.index = index;
exports.update = update;
exports.comment = comment;
exports.postcomment = postcomment;
exports.login = login;
exports.getWeight = getWeight;
exports.getrow = getrow;