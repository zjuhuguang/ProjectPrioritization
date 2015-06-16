/**
 * Created by guanghu on 6/15/15.
 */

var mysql = require('mysql');
var fs = require('fs');

var projectInfo = mysql.createConnection(
    {
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'project_priority'
    }
);

var queryString = 'SELECT * FROM PROJECT_INFO';

var base = function(req, res) {
    res.render('index', {
        title: 'Howdy World'})
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
            //console.log(rows);
            rows.sort(function(a, b) {
                var f = function(a) {
                    var w = a.COST * weight.Cost + a.DATE * weight.Date + a.MANDATE * weight.Mandate;
                    //console.log(a.PROJECT_NAME + " priority is " + w);
                    return w;
                };
                return f(a) - f(b);
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
    console.log('mandate = ' +  post.Mandate);

    var query = projectInfo.query('INSERT INTO project_info set ?', post, function(err, result) {
        if (err) throw err;

        insert(req, res);
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
        insert(req, res);
    });
};

var del = function(req, res) {
    console.log(req.query.ProjectName);
    var delQuery = 'DELETE FROM PROJECT_INFO WHERE PROJECT_NAME =' + '\'' + req.query.ProjectName + '\'';
    var query = projectInfo.query(delQuery, function (err, result) {
        if (err) throw err;
        insert(req, res);
    })
};



exports.base = base;
exports.insert = insert;
exports.update = update;
exports.refresh = refresh;
exports.del = del;