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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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

/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/
/*
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

const DrawModes = {
    PEN: "pen_tool",
    ERASER: {
        PARTIAL: "partial_eraser",
        WHOLE: "whole_eraser"
    },
    SELECT: {
        BOX: "box_select",
        LASSO: "lasso_select"
    },
    SHAPE: {
        RECTANGLE: "shape_rectangle",
        TRIANGLE: "shape_triangle",
        CIRCLE: "shape_circle",
        POLYGON: "shape_regular_polygon",
        FREEFORM: "shape_freeform"
    }
}

var drawMode = DrawModes.PEN;

var allStrokes = [];
var strokeArr = [];

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    strokeArr = [];
}
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    if (drawMode == DrawModes.ERASER.WHOLE || drawMode == DrawModes.ERASER.PARTIAL) return;
    console.log(strokeArr);
    var strokeObj = {
        coords: strokeArr,
        lineWidth: lineWidth,
        lineCap: lineCap
    };
    socket.emit('stroke', strokeObj);
    allStrokes.push(strokeObj);
}

document.getElementById('eraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.PARTIAL;
}
document.getElementById('smartEraserTool').onclick = function() {
    drawMode = DrawModes.ERASER.WHOLE;
}
document.getElementById('penTool').onclick = function() {
    drawMode = DrawModes.PEN;
}
document.getElementById('clearTool').onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
    socket.emit('clear');
}
socket.on('clearCanvas', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    allStrokes = [];
})
document.getElementById('saveName').onclick = function() {
    socket.emit('username', document.getElementById('nameIn').value);
}

function draw(e) {
    if (!isDrawing) return;

    var posX = e.clientX - offsetX;
    var posY = e.clientY - offsetY;

    if (drawMode === DrawModes.ERASER.PARTIAL) {
        ctx.strokeStyle = 'white';
    } else if (drawMode === DrawModes.PEN) {
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
    allStrokes.push(strokeObj);
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
*/