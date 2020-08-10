const socket = io();

socket.emit('init', location.hostname);

var load = false;

function toggleLoad() {
    if (!load) {
        load = setInterval(request, 1000);
    }
    else {
        clearInterval(load);
        var board = document.getElementById('board');

        while (board.hasChildNodes())
            board.removeChild(board.firstChild);
        load = false;
    }
}

function request() {
    socket.emit('req',location.hostname);
    load;
}

socket.on('init_list', function (data) {
    console.log(data);
        for (var i = 0; i < data.length; i++) {
            var gpulist = document.getElementById('gpulist');
            var temp = document.createElement('input');

            if (!document.getElementById(data[i] + '_cb')) {
                temp.type = 'checkbox';
                temp.name = 'gpu';
                temp.id = data[i] + '_cb';
                temp.value = data[i];

                var label = document.createElement('label');
                label.setAttribute('for', data[i] + '_cb');
                label.innerHTML = data[i].slice(0, data[i].indexOf('_info'));

                gpulist.appendChild(temp);
                gpulist.appendChild(label);
            }

            var gpu = document.getElementsByName('gpu');
            if (gpu[i].checked) {
                socket.emit('data_req', data[i],location.hostname);
            }
        }
    
})

socket.on('list', function (list) {
        for (var i = 0; i < list.length; i++) {
            var gpu = document.getElementsByName('gpu');
            if (gpu[i].checked) {
                socket.emit('data_req', list[i], location.hostname);
            }
            else {
                if (document.getElementById(list[i])) {
                    var prev = document.getElementById(list[i]);
                    board.removeChild(prev);
                }
            }
        }
    
})

socket.on('data', function (filename, data ) {
        if (document.getElementById(filename)) {

            var root = document.getElementById(filename);
    
            for (var i = 0; i < data.length; i++) {
                var top = document.getElementById(filename + '_top_' + String(i));
    
                var bottom = document.getElementById(filename + '_bottom_' + String(i));
    
                if (data[i].Temp > 60) {
                    top.className = 'top hot';
                    bottom.className = 'bottom hot';
                }
                else if (data[i].Temp < 30) {
                    top.className = 'top cool';
                    bottom.className = 'bottom cool';
                }
    
                var table = document.getElementById(filename + '_table_' + String(i));
                var tr1 = table.firstChild;
                var tr2 = table.lastChild;
    
                var td1 = tr1.firstChild;
                td1.innerHTML = "Fan. &nbsp " + data[i].Fan;
    
                var td2 = tr1.lastChild;
                td2.innerHTML = "Mem. &nbsp " + data[i].Mem_Per + " %";
    
                var td3 = tr2.firstChild;
                td3.innerHTML = "Temp. &nbsp " + data[i].Temp + " &degC";
    
                var td4 = tr2.lastChild;
                td4.innerHTML = "Pwr. &nbsp " + data[i].Pwr;
            }
        }
        else {
            var board = document.getElementById('board');

            var root = document.createElement('div');
            root.id = filename;
            root.className = 'root';

            var title = document.createElement('div');
            title.className = 'node';
            title.innerHTML = filename.slice(0, filename.indexOf('_info'));
    
            root.appendChild(title);
    
            for (var i = 0; i < data.length; i++) {
                var top = document.createElement('div');
                top.id = filename + '_top_' + String(i);
                top.className = 'top';
                top.innerHTML = 'GPU [' + i + '] ' + data[i].name;
    
                var bottom = document.createElement('div');
                bottom.id = filename + '_bottom_' + String(i);
                bottom.className = 'bottom';
    
                if (data[i].Temp > 60) {
                    top.className = 'top hot';
                    bottom.className = 'bottom hot';
                }
                else if (data[i].Temp < 30) {
                    top.className = 'top cool';
                    bottom.className = 'bottom cool';
                }
                else {
                    top.className = 'top';
                    bottom.className = 'bottom';
                }
    
                var table = document.createElement('table');
                table.id = filename + '_table_' + String(i);
                var tr1 = document.createElement('tr');
                var tr2 = document.createElement('tr');
    
                var td1 = document.createElement('td');
                td1.innerHTML = "Fan. &nbsp " + data[i].Fan;
                tr1.appendChild(td1);
                var td2 = document.createElement('td');
                td2.innerHTML = "Mem. &nbsp " + data[i].Mem_Per + " %";
                tr1.appendChild(td2);
                var td3 = document.createElement('td');
                td3.innerHTML = "Temp. &nbsp " + data[i].Temp + " &degC";
                tr2.appendChild(td3);
                var td4 = document.createElement('td');
                td4.innerHTML = "Pwr. &nbsp " + data[i].Pwr;
                tr2.appendChild(td4);
    
                table.appendChild(tr1);
                table.appendChild(tr2);
    
                bottom.appendChild(table);

                root.appendChild(top);
                root.appendChild(bottom);

            }
    
            board.appendChild(root);
        }
    
    
})