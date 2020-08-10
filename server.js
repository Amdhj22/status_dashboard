var express = require('express');
var app = express();
var fs = require('fs');
var router = require('./router/router')(app);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
let log_path = path.join('/mnt','airsfs3','gpu_log/')
require('date-utils');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(express.static(log_path));


io.on('connection', function (socket) {

    console.log(socket.id + ' connect');

    var date = new Date();
    var time = date.toFormat('YYYY-MM-DD HH24:MI:SS');

    socket.on('init',function(client){

        console.log(client + '- initate dashboard - /'+time);
        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client+'- '+err);
            for(var i=0;i<files.length;i++){
                if(files[i].indexOf('.log')<0)
                    files.splice(i,1);
            }
            io.to(socket.id).emit('init_list', files);
        });
    })

    socket.on('req', function (client) {
        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client+'- '+err);
            for(var i=0;i<files.length;i++){
                if(files[i].indexOf('.log')<0)
                    files.splice(i,1);
            }    
            io.to(socket.id).emit('list', files);
        });
    });

    socket.on('data_req', function (filename, client) {
        var date = new Date();
        var time = date.toFormat('YYYY-MM-DD HH24:MI:SS');
        console.log(client+'- '+filename+'- request recevied- /'+time);

        var data = fs.readFileSync(log_path + filename, 'utf8');

        //console.log(filename);
        var ind = data.indexOf("Attached GPUs", ind);
        ind = data.indexOf(":", ind);
        var GPU_num = Number(data.slice(ind + 2, data.indexOf("\n", ind)));
        var gpu = new Array();
        for (var i = 0; i < GPU_num; i++) {
            ind = data.indexOf("Product Name", ind);
            ind = data.indexOf(":", ind);

            gpu[i] = { name: data.slice(ind + 2, data.indexOf("\n", ind)) }

            ind = data.indexOf("Fan Speed", ind);
            ind = data.indexOf(":", ind);

            gpu[i].Fan = data.slice(ind + 2, data.indexOf("\n", ind));

            ind = data.indexOf("FB Memory Usage", ind);
            ind = data.indexOf(":", ind);
            gpu[i].Mem_Total = Number(data.slice(ind + 2, data.indexOf("MiB", ind)));

            ind = data.indexOf(":", ind + 1);
            gpu[i].Mem_Used = Number(data.slice(ind + 1, data.indexOf("MiB", ind)));
            gpu[i].Mem_Per = Math.round(gpu[i].Mem_Used / gpu[i].Mem_Total * 100);

            ind = data.indexOf("Gpu", ind);
            ind = data.indexOf(":", ind);
            gpu[i].Util = data.slice(ind + 2, data.indexOf("\n", ind));

            ind = data.indexOf("GPU Current Temp", ind);
            ind = data.indexOf(":", ind);
            gpu[i].Temp = Number(data.slice(ind + 2, data.indexOf("C", ind)));

            ind = data.indexOf("Power Draw", ind);
            ind = data.indexOf(":", ind);
            gpu[i].Pwr = data.slice(ind + 2, data.indexOf("\n", ind));
        }
        io.to(socket.id).emit('data',filename,gpu ,client);
    })
})

http.listen(8081, function () {
    console.log("Express server has started on port 8081")

});


