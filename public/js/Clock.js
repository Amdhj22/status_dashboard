function Clock() {
    let today = new Date();
    var time = document.getElementById('clock');
    time.innerHTML = today.toLocaleString();
    setTimeout('Clock()', 1000);
}