const socket = io();

socket.emit('init', location.hostname);

function request() {
    socket.emit('req', location.hostname);
    setTimeout(request, 1000);
}
request();
socket.on('init_list', function (data) {
    //console.log(data);
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
            label.innerHTML = data[i].slice(data[i].indexOf(':') + 1, data[i].indexOf('_gpu'));

            gpulist.appendChild(temp);
            gpulist.appendChild(label);
        }

        var gpu = document.getElementsByName('gpu');
        if (gpu[i].checked) {
            socket.emit('data_req', data[i], location.hostname);
        }
    }

})

socket.on('list', function (list) {
    //console.log(list);
    for (var i = 0; i < list.length; i++) {
        var gpu = document.getElementsByName('gpu');
        if (gpu[i].checked) {
            socket.emit('data_req', list[i], location.hostname);
        }
        else {
            if (document.getElementById(list[i])) {
                var prev = document.getElementById(list[i]);
                var board = document.getElementById('board');
                board.removeChild(prev);
            }
        }
    }

})

socket.on('data', function (filename, data) {
    if (document.getElementById(filename)) {

        var root = document.getElementById(filename);

        for (var i = 0; i < data.length; i++) {
            var top = document.getElementById(filename + '_top_' + String(i));

            var bottom = document.getElementById(filename + '_bottom_' + String(i));

            if (data[i].Temp > 60) {
                top.removeAttribute('class');
                bottom.removeAttribute('class');
                top.className = 'top hot';
                bottom.className = 'bottom hot';
            }
            else if (data[i].Temp < 30) {
                top.removeAttribute('class');
                bottom.removeAttribute('class');
                top.className = 'top cool';
                bottom.className = 'bottom cool';
            }
            else {
                top.removeAttribute('class');
                bottom.removeAttribute('class');
                top.className = 'top';
                bottom.className = 'bottom';
            }

            var table = document.getElementById(filename + '_table_' + String(i));
            var tr1 = table.firstChild;
            var tr2 = table.lastChild;

            var td1 = tr1.firstChild;
            var td1_2 = td1.firstChild.lastChild;
            td1_2.innerHTML = data[i].Temp + " &degC";

            var td2 = tr1.lastChild;
            var td2_2 = td2.firstChild.lastChild;
            td2_2.innerHTML = data[i].Mem_Per + " %";

            var td3 = tr2.firstChild;
            var td3_2 = td3.firstChild.lastChild;
            td3_2.innerHTML = data[i].Mem_Used;

            var td4 = tr2.lastChild;
            var td4_2 = td4.firstChild.lastChild;
            td4_2.innerHTML = data[i].Mem_Total + " MB";
        }
    }
    else {
        var board = document.getElementById('board');

        var root = document.createElement('div');
        root.id = filename;
        root.className = 'root';

        var title = document.createElement('div');
        title.className = 'node';
        title.innerHTML = filename.slice(filename.indexOf(':') + 1, filename.indexOf('_gpu'));

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
            var tb1 = document.createElement('table');
            var td1_1 = document.createElement('td');
            var td1_2 = document.createElement('td');
            td1_1.innerHTML = "Temp.";
            td1_2.innerHTML = data[i].Temp + " &degC";
            td1_2.className = "align_right";

            tb1.appendChild(td1_1);
            tb1.appendChild(td1_2);
            td1.appendChild(tb1);
            tr1.appendChild(td1);

            var td2 = document.createElement('td');
            var tb2 = document.createElement('table');
            var td2_1 = document.createElement('td');
            var td2_2 = document.createElement('td');
            td2_1.innerHTML = "Per.";
            td2_2.innerHTML = data[i].Mem_Per + " %";
            td2_2.className = "align_right";

            tb2.appendChild(td2_1);
            tb2.appendChild(td2_2);
            td2.appendChild(tb2);
            tr1.appendChild(td2);

            var td3 = document.createElement('td');
            var tb3 = document.createElement('table');
            var td3_1 = document.createElement('td');
            var td3_2 = document.createElement('td');
            td3_1.innerHTML = "Mem.";
            td3_2.innerHTML = data[i].Mem_Used;
            td3_2.className = "align_right";

            tb3.appendChild(td3_1);
            tb3.appendChild(td3_2);
            td3.appendChild(tb3);
            tr2.appendChild(td3);

            var td4 = document.createElement('td');
            var tb4 = document.createElement('table');
            var td4_1 = document.createElement('td');
            var td4_2 = document.createElement('td');
            td4_1.innerHTML = "/";
            td4_2.innerHTML = data[i].Mem_Total + " MB";
            td4_2.className = "align_right";

            tb4.appendChild(td4_1);
            tb4.appendChild(td4_2);
            td4.appendChild(tb4);
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
