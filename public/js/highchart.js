const socket1 = io();

socket1.emit('cpu_init', location.hostname);

document.cookie = "SameSite=None; Secure";
var chart1;
var chart = new Array();
var board = document.getElementById('cpu_board');

var load = false;

socket1.on('init_chart', function (data) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
        var root = document.createElement('div');
        root.id = i;
        root.className = 'chart_root';
        var node = document.createElement('div');
        node.id = data[i];
        node.className = 'chart';

        root.appendChild(node);
        board.appendChild(root);
        if (document.getElementById(data[i])) {
            chart[i] = new Highcharts.Chart(data[i], {
                title: {
                    text: data[i].slice(data[i].indexOf(':')+1, data[i].indexOf('_cpu.log')).toUpperCase()
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    visible: false
                },
                yAxis: {
                    title: { enabled: false },
                    tickPositions: [0, 25, 50, 75, 100],
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'cpu',
                    data: [],
                    marker: {
                        enabled: false
                    }
                }, {
                    name: 'Memory',
                    data: [],
                    marker: {
                        enabled: false
                    }
                },
                ],
                color: ['#ff3322', '#ff1100'],
            });
            chart[i].series[0].color = '#13203f';
            chart[i].series[1].color = "#5d75a8";
            for (var j = 0; j < 60; j++) {
                chart[i].series[0].addPoint(0, true);
                chart[i].series[1].addPoint(0, true);
            }
        }
        else {
            console.log('good');
        }
        //socket.emit('cpu_req',data[i],i,location.hostname);

    }
    //console.log(node);


})

socket1.on('list_cpu', function (files) {
    for (i = 0; i < files.length; i++) {
        socket1.emit('cpu_req', files[i], i, location.hostname);
    }
})

socket1.on('cpu_data', function (i, cpu, mem, prcs) {
    //console.log(cpu);
    if(cpu<100){
        chart[i].series[0].addPoint(Number(cpu), false, chart[i].series[0].data.length > 60);
        chart[i].series[1].addPoint(Number(mem), true, chart[i].series[1].data.length > 60);
    }
    

    //console.log(prcs);
    var root = document.getElementById(i);
    var ps;
    if (document.getElementById('ps_' + i)) {
        ps = document.getElementById('ps_' + i);
        while (ps.hasChildNodes())
            ps.removeChild(ps.firstChild);
    }
    else {
        var ps = document.createElement('table');
        ps.id = 'ps_' + i;
        ps.className = 'ps';
    }
    var tr = document.createElement('tr');
    var PID = document.createElement('th');
    PID.innerHTML = 'PID';
    var user = document.createElement('th');
    user.innerHTML = 'USER';
    var cpu_usage = document.createElement('th');
    cpu_usage.innerHTML = '%CPU';
    var mem_usage = document.createElement('th');
    mem_usage.innerHTML = '%MEM';
    var cmd = document.createElement('th');
    cmd.innerHTML = 'CMD';
    tr.appendChild(PID);
    tr.appendChild(user);
    tr.appendChild(cpu_usage);
    tr.appendChild(mem_usage);
    tr.appendChild(cmd);
    ps.appendChild(tr);

    for (var j = 0; j < prcs.length; j++) {
        var tr = document.createElement('tr');
        var PID = document.createElement('td');
        PID.innerHTML = prcs[j].PID;
        var user = document.createElement('td');
        user.innerHTML = prcs[j].user;
        var cpu_usage = document.createElement('td');
        cpu_usage.innerHTML = prcs[j].cpu_usage;
        var mem_usage = document.createElement('td');
        mem_usage.innerHTML = prcs[j].mem_usage;
        var cmd = document.createElement('td');
        if (prcs[j].cmd.length > 6)
            cmd.innerHTML = prcs[j].cmd.slice(0, 4) + '...';
        else
            cmd.innerHTML = prcs[j].cmd;
        tr.appendChild(PID);
        tr.appendChild(user);
        tr.appendChild(cpu_usage);
        tr.appendChild(mem_usage);
        tr.appendChild(cmd);
        ps.appendChild(tr);
    }
    root.appendChild(ps);
})

function request1() {
    socket1.emit('cpu_list', location.hostname);
    setTimeout(request1, 1000);
}

request1();