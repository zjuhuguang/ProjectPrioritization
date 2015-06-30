/**
 * Created by guanghu on 6/15/15.
 */
module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    //app.get('/', index.base);
    //app.get('/insert', index.insert);
    //app.post('/update', index.update);
    app.post('/refresh', index.refresh);
    //app.get('/del', index.del);
    //app.get('/getProjects', index.getProjects);
    //app.get('/sort', index.sort);
    app.get('/index', index.index);
    app.post('/update', index.update);
    app.get('/helper', index.myHelper);
};