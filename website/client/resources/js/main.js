var lineWidth = 10;
var lineCap = "round";

var socket = io();

window.onload = function() {
    const canvas = document.getElementById('can');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    } resizeCanvas();

    //window.onresize = resizeCanvas;

    var isDrawing = false;

    var strokeArr = [];

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
        strokeArr = [];
    }
    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
        console.log(strokeArr);
        socket.emit('stroke', {
            coords: strokeArr,
            lineWidth: lineWidth,
            lineCap: lineCap
        });
    }

    function draw(e) {
        if (!isDrawing) return;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;
        ctx.lineTo(e.clientX, e.clientY);
        strokeArr.push({x: e.clientX, y: e.clientY});
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
    }

    canvas.onmousedown = startDrawing;
    canvas.onmouseup = stopDrawing;
    canvas.onmousemove = draw;

    socket.on('receivedStroke', function(strokeObj) {
        var coords = strokeObj.coords;
        ctx.lineWidth = strokeObj.lineWidth;
        ctx.lineCap = strokeObj.lineCap;
        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);
        for (var i = 1; i < coords.length; i++) {
            ctx.lineTo(coords[i].x, coords[i].y);
            ctx.stroke();
            ctx.moveTo(coords[i].x, coords[i].y);
        }
        ctx.beginPath();
    })
}