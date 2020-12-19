var lineWidth = 10;
var lineCap = "round";

var offsetY = $(document.getElementById('can')).offset().top;
var offsetX = $(document.getElementById('can')).offset().left;

var socket = io();

const canvas = document.getElementById('can');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
} resizeCanvas();

//window.onresize = resizeCanvas;

var isDrawing = false;
var drawMode = 'pen';

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

document.getElementById('eraserTool').onclick = function() {
    drawMode = 'eraser';
}
document.getElementById('penTool').onclick = function() {
    drawMode = 'pen';
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === 'eraser') {
        ctx.strokeStyle = 'white';
    } else if (drawMode === 'pen') {
        ctx.strokeStyle = 'black';
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineTo(posX, posY);
    strokeArr.push({x: posX, y: posY});
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(posX, posY);
}

canvas.onmousedown = startDrawing;
canvas.onmouseup = stopDrawing;
canvas.onmousemove = draw;

var userToAuthorTag = {};

function syncStroke(strokeObj, showAuthorTag) {
    console.log('bruh', strokeObj);
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
    if (showAuthorTag) {
        if (strokeObj.authorID in userToAuthorTag) {
            var authorTag = userToAuthorTag[strokeObj.authorID];
            authorTag.innerHTML = ('author' in strokeObj) ? strokeObj.author : 'Anonymous';
            authorTag.style.top = offsetY + coords[coords.length-1].y;
            authorTag.style.left = offsetX + coords[coords.length-1].x;
            authorTag.style.display = 'block';
        } else {
            var authorTag = document.createElement('div');
            authorTag.innerHTML = ('author' in strokeObj) ? strokeObj.author : 'Anonymous';
            authorTag.classList.add('authorTag');
            authorTag.style.top = offsetY + coords[coords.length-1].y;
            authorTag.style.left = offsetX + coords[coords.length-1].x;
            authorTag.style.backgroundColor = 'rgb(' + randInt(55, 200) + ',' + randInt(55, 200) + ',' + randInt(55, 200) + ')';
            userToAuthorTag[strokeObj.authorID] = authorTag;
            document.body.appendChild(authorTag);
            setTimeout(function() {
                authorTag.style.display = 'none';
            }, 2000);
        }
    }
    ctx.beginPath();
}

socket.on('receivedStroke', (e) => {syncStroke(e, true)});

socket.on('currentStrokes', function(receivedStrokes) {
    for (var strokeObj of receivedStrokes) syncStroke(strokeObj);
})