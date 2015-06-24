/**
 * Created by guanghu on 6/15/15.
 */


var mysql = require('mysql');
var fs = require('fs');
var math = require('mathjs');

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
            var result = {data: rows};
            res.send(JSON.stringify(result));
        });
        return;
    }

    //render the projects to the website
    var weight = {};
    fs.readFile('./public/weight', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        console.log("Reading data " + data);
        weight = JSON.parse(data);
        //console.log("type is " + typeof weight);
        //console.log("type is " + typeof weight.Cost);
        projectInfo.query(queryString, function(err, rows) {
            //console.log(weight);
            if (err) throw err;
            console.log(rows);
            //the columns in the table are provided below
            var costs = [], dates = [], mandates = [];

            if (rows.length == 0) {
                res.render('insert', {rows: rows, weight: weight});
                return;
            }

            // convert rows to int and iterate through
            for (var row in rows) {
                console.log("row is " + row);
                //console.log("row is " + row);
                costs.push(rows[row].COST);
                //console.log("date datatype is " + typeof rows[row].MANDATE);
                console.log("date:" + rows[row].DATE.getTime());
                //convert DATEs to integers
                rows[row].DATE_REL = modifyDate((rows[row].DATE.getTime() - new Date().getTime()));
                console.log('date_rel is ' + rows[row].DATE_REL + '     date is ' + rows[row].DATE);
                dates.push(rows[row].DATE_REL);
                mandates.push(rows[row].MANDATE);
            }
            console.log(rows);

            //console.log(costs);

            var costMean = math.mean(costs);
            console.log(costMean);
            var dateMean = math.mean(dates);
            var mandateMean = math.mean(mandates);

            var costStd = math.std(costs);
            var dateStd = math.std(dates);
            var mandateStd = math.std(mandates);

            console.log("std = " + costStd + ', ' + dateStd + ', ' + mandateStd);
            console.log("mean = " + costMean + ',' + dateMean + ',' + mandateMean);

            console.log("weight = " + weight.Cost + ',' + weight.Date + ',' + weight.Mandate);
            rows.sort(function(a, b) {
                if (b.Group > a.Group)
                    return 1;
                else if (b.Group < a.Group) return -1;
                var f = function(a) {
                    //var w = a.COST * weight.Cost + a.DATE * weight.Date + a.MANDATE * weight.Mandate;
                    //console.log(a.PROJECT_NAME + " priority is " + w);
                    var z_score = function(data, mean, std) {
                        if (data == mean) return 0;
                        return (data - mean) / std;
                    };

                    console.log("zscore of cost = " + z_score(a.COST, costMean, costStd) + " zscore of date = " + z_score(a.DATE_REL, dateMean, dateStd) +" zscore of mandate = " + z_score(a.MANDATE, mandateMean, mandateStd));
                    var w = z_score(a.COST, costMean, costStd) * weight.Cost + z_score(a.DATE_REL, dateMean, dateStd) * weight.Date + z_score(a.MANDATE, mandateMean, mandateStd) * weight.Mandate;

                    console.log("w = " + w);
                    return w;
                };
                return f(b) - f(a);
            });
            console.log(weight);
            res.render('insert', {rows: rows, weight: weight});
        });
    });
};

var update = function(req, res) {
    var action = req.query.action;
    if (action == 'create') {
        var post = {};
        console.log('type of date is ' + typeof req.body.Date);
        post.Project_Name = req.body.Project_Name;
        post.Cost = req.body.Cost;
        post.Date = req.body.Date;
        post.Mandate = req.body.Mandate;
        post.Group = req.body.Group;
        console.log('mandate = ' +  post.Mandate);

        var query = projectInfo.query('INSERT INTO project_info set ?', post, function(err, result) {
            if (err) throw err;
            res.redirect('/insert');
            //insert(req, res);
        });
        console.log(query.sql);
    }

};

/*
var base = function(req, res) {
    var action = req.query.action;
    switch (action) {

        case 'insert': {
            insert(req, res);
            return;
        }
        default :
            res.render('index', {
                title: 'Howdy World'
            });
    }
};


var insert = function(req, res) {

    var weight = {};
    fs.readFile('./public/weight', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        console.log("Reading data " + data);
        weight = JSON.parse(data);
        //console.log("type is " + typeof weight);
        //console.log("type is " + typeof weight.Cost);
        projectInfo.query(queryString, function(err, rows) {
            //console.log(weight);
            if (err) throw err;
            console.log(rows);
            //the columns in the table are provided below
            var costs = [], dates = [], mandates = [];

            if (rows.length == 0) {
                res.render('insert', {rows: rows, weight: weight});
                return;
            }

            // convert rows to int and iterate through
            for (var row in rows) {
                console.log("row is " + row);
                //console.log("row is " + row);
                costs.push(rows[row].COST);
                //console.log("date datatype is " + typeof rows[row].MANDATE);
                console.log("date:" + rows[row].DATE.getTime());
                //convert DATEs to integers
                rows[row].DATE_REL = modifyDate((rows[row].DATE.getTime() - new Date().getTime()));
                console.log('date_rel is ' + rows[row].DATE_REL + '     date is ' + rows[row].DATE);
                dates.push(rows[row].DATE_REL);
                mandates.push(rows[row].MANDATE);
            }
            console.log(rows);

            //console.log(costs);

            var costMean = math.mean(costs);
            console.log(costMean);
            var dateMean = math.mean(dates);
            var mandateMean = math.mean(mandates);

            var costStd = math.std(costs);
            var dateStd = math.std(dates);
            var mandateStd = math.std(mandates);

            console.log("std = " + costStd + ', ' + dateStd + ', ' + mandateStd);
            console.log("mean = " + costMean + ',' + dateMean + ',' + mandateMean);

            console.log("weight = " + weight.Cost + ',' + weight.Date + ',' + weight.Mandate);
            rows.sort(function(a, b) {
                if (b.Group > a.Group)
                    return 1;
                else if (b.Group < a.Group) return -1;
                var f = function(a) {
                    //var w = a.COST * weight.Cost + a.DATE * weight.Date + a.MANDATE * weight.Mandate;
                    //console.log(a.PROJECT_NAME + " priority is " + w);
                    var z_score = function(data, mean, std) {
                        if (data == mean) return 0;
                        return (data - mean) / std;
                    };

                    console.log("zscore of cost = " + z_score(a.COST, costMean, costStd) + " zscore of date = " + z_score(a.DATE_REL, dateMean, dateStd) +" zscore of mandate = " + z_score(a.MANDATE, mandateMean, mandateStd));
                    var w = z_score(a.COST, costMean, costStd) * weight.Cost + z_score(a.DATE_REL, dateMean, dateStd) * weight.Date + z_score(a.MANDATE, mandateMean, mandateStd) * weight.Mandate;

                    console.log("w = " + w);
                    return w;
                };
                return f(b) - f(a);
            });
            console.log(weight);
            res.render('insert', {rows: rows, weight: weight});
        });
    });
};


var update = function(req, res) {


    var post = {};
    console.log('type of date is ' + typeof req.body.Date);
    post.Project_Name = req.body.ProjectName;
    post.Cost = req.body.Cost;
    post.Date = req.body.Date;
    post.Mandate = req.body.Mandate;
    post.Group = req.body.Group;
    console.log('mandate = ' +  post.Mandate);

    var query = projectInfo.query('INSERT INTO project_info set ?', post, function(err, result) {
        if (err) throw err;
        res.redirect('/insert');
        //insert(req, res);
    });
    console.log(query.sql);
};

var refresh = function(req, res) {

    //console.log(res);
    var post = {};
    post.Cost = req.body.Cost;
    post.Date = req.body.Date;
    post.Mandate = req.body.Mandate;

    fs.writeFile("./public/weight", JSON.stringify(post), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
        res.redirect('/insert');
        //insert(req, res);
    });
};


var del = function(req, res) {
    console.log(req.query.ProjectName);
    var delQuery = 'DELETE FROM PROJECT_INFO WHERE PROJECT_NAME =' + '\'' + req.query.ProjectName + '\'';
    var query = projectInfo.query(delQuery, function (err, result) {
        if (err) throw err;
        res.redirect('/insert');
        //insert(req, res);
    })
};

var getProjects = function(req, res) {
    projectInfo.query(queryString, function(err, rows) {
        //console.log(weight);
        if (err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rows));
    });
};




exports.base = base;
exports.insert = insert;
exports.update = update;
exports.refresh = refresh;
exports.del = del;
exports.getProjects = getProjects;
    */

var refresh = function(req, res) {

    //console.log(res);
    var post = {};
    post.Cost = req.body.Cost;
    post.Date = req.body.Date;
    post.Mandate = req.body.Mandate;

    fs.writeFile("./public/weight", JSON.stringify(post), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
        res.redirect('/insert');
        //insert(req, res);
    });
};




var modifyDate = function(num) {
    var days = num / 1000 / 60 / 60 / 24;
    if (days <= 1) {
        return 3;
    }
    else return 0 - math.log(days / 1000, 10);
};

exports.refresh = refresh;
exports.index = index;
exports.update = update;