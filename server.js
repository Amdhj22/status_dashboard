var express = require('express');
var app = express();
var fs = require('fs');
var router = require('./router/router')(app);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
let log_path = path.join('/mnt', 'airsfs3', 'status_log/')
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

    socket.on('init', function (client) {

        console.log(client + '- initate dashboard - /' + time);
        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client + '- ' + err);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf('gpu') < 0)
                    files.splice(i--, 1);
            }
            io.to(socket.id).emit('init_list', files);
        });
    })

    socket.on('req', function (client) {
        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client + '- ' + err);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf('gpu') < 0)
                    files.splice(i--, 1);
            }
            io.to(socket.id).emit('list', files);
        });
    });

    socket.on('data_req', function (filename, client) {
        var date = new Date();
        var time = date.toFormat('YYYY-MM-DD HH24:MI:SS');
        console.log(client + '- ' + filename + '- request recevied- /' + time);

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
        io.to(socket.id).emit('data', filename, gpu);
    })

    socket.on('cpu_init', function (client) {

        console.log(client + '- initate cpu chart - /' + time);

        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client + '- ' + err);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf('_cpu.log') < 0)
                    files.splice(i, 1);
            }
            io.to(socket.id).emit('init_chart', files);
        });
    })

    socket.on('cpu_list', function (client) {
        console.log(client + '- request cpu list - /' + time);

        files = fs.readdir(log_path, 'utf8', function (err, files) {
            if (err)
                console.log(client + '- ' + err);
            for (var i = 0; i < files.length; i++) {
                if (files[i].indexOf('_cpu.log') < 0) {

                    files.splice(i, 1);
                }

            }
            io.to(socket.id).emit('list_cpu', files);
        });
    })

    socket.on('cpu_req', function (filename, index, client) {
        var date = new Date();
        var time = date.toFormat('YYYY-MM-DD HH24:MI:SS');
        console.log(client + '- Cpu Usage request recevied- /' + time);

        var data = fs.readFileSync(log_path + filename, 'utf8');
        var i = 0;
        var ind = data.indexOf("%Cpu(s)", ind);
        ind = data.indexOf("%Cpu(s)", ind + 1);
        ind = data.indexOf("id", ind);
        var cpu_idle = Number(data.slice(ind - 6, ind - 1));
        var cpu = 100 - cpu_idle;

        //console.log('CPU Usage: ' + avg + '%');

        ind = data.indexOf("Mem", ind);
        var mem = { total: Number(data.slice(data.indexOf("total", ind) - 9, data.indexOf("total", ind) - 1)) }
        mem.free = Number(data.slice(data.indexOf("free", ind) - 8, data.indexOf("free", ind)))
        mem.used = Number(data.slice(data.indexOf("used", ind) - 8, data.indexOf("used", ind)))
        mem.usage = (mem.used / mem.total * 100).toFixed(2)
        //console.log('Mem: ' + mem.usage);

        ind = data.indexOf("COMMAND", ind);
        ind = data.indexOf("\n", ind + 1);
        var ps_cnt = 0;
        var prcs = new Array();
        while (data.indexOf("\n", ind + 1) > 0) {
            var ps = { PID: data.slice(ind + 1, data.indexOf(" ", ind + 5)) };
            ind = data.indexOf(" ", ind + 5);
            ps.user = data.slice(ind, data.indexOf(" ", ind + 10));
            ind = data.indexOf(" ", ind + 40);
            //console.log(data.slice(ind,ind+10));
            ps.cpu_usage = Number(data.slice(ind, data.indexOf(" ", ind + 5)));
            ind = data.indexOf(" ", ind + 5);
            ps.mem_usage = Number(data.slice(ind, data.indexOf(" ", ind + 5)));
            ps.cmd = data.slice(data.indexOf(" ", ind + 10) + 1, data.indexOf('\n', ind + 10));
            //console.log(data.slice(ind, data.indexOf('\n', ind + 8)));
            //console.log(ps);
            prcs[ps_cnt++] = ps;
            ind = data.indexOf("\n", ind + 1);
        }
        //console.log('process: '+JSON.stringify(prcs));
        io.to(socket.id).emit('cpu_data', index, cpu, mem.usage, prcs);
    })
})

http.listen(8081, function () {
    console.log("Express server has started on port 8081")

});


