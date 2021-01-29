function createPainter(parent, width, height) {
    var title = elt("h2",null,"그림판");
    var [canvas, ctx] = createCanvas(width, height);
    var toolbar = elt("div", null);

    for(var name in controls) {
        toolbar.appendChild(controls[name](ctx));
    }
ㄹㅇㄴㅁㄹㅇㅁㄹㅇㄴㅁ
    toolbar.style.fontSize = "small";
    toolbar.style.marginBottom = "3px";

    parent.appendChild(elt("div",null, title, toolbar, canvas));
}

function createCanvas(canvasWidth, canvasHeight) {
    var canvas = elt("canvas",{width: canvasWidth, height: canvasHeight});
    var ctx = canvas.getContext("2d");

    canvas.style.border = "1px solid gray";
    canvas.style.cursor = "pointer";

    canvas.addEventListener("mousedown",mouseEvent, false);
    function mouseEvent(e) {
        paintTools[paintTool](e,ctx);
    }
    return [canvas, ctx];
}

// Util

function relativePosition(event, element) {
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(event.clientX - rect.left),
            y: Math.floor(event.clientY - rect.top)};
}

// Tools

var paintTool;
var paintTools = Object.create(null);

paintTools.brush = function(e, ctx) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    var img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    setDragListeners(ctx, img, function(q){
        ctx.globalCompositeOperation = "source-over";
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    });
}

paintTools.line = function(e, ctx) {
    ctx.lineCap = "round";

    var img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    setDragListeners(ctx, img, function (q) {
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    });
}

paintTools.circle = function(e, ctx) {
    var img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    setDragListeners(ctx, img, function(q){
        var dx = q.x - p.x;
        var dy = q.y - p.y;
        var r = Math.sqrt(dx*dx+dy*dy);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
        ctx.stroke();
    });
}
paintTools.circleFill = function(e, ctx) {
    var img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    setDragListeners(ctx, img, function(q){
        var dx = q.x - p.x;
        var dy = q.y - p.y;
        var r = Math.sqrt(dx*dx+dy*dy);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
        ctx.fill();
    });
}
paintTools.eraser = function (e, ctx) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    var img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    var p = relativePosition(e, ctx.canvas);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    setDragListeners(ctx, img, function(q){
        ctx.globalCompositeOperation="destination-out";
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    });
}
// Tools Util

function setDragListeners(ctx, img, draw) {
    var mousemoveEventListener = function(e) {
        ctx.putImageData(img, 0, 0);
        draw(relativePosition(e, ctx.canvas));
    };

    document.addEventListener("mousemove", mousemoveEventListener, false);
    document.addEventListener("mouseup",function(e) {
        ctx.putImageData(img, 0, 0,);
        draw(relativePosition(e, ctx.canvas));
        document.removeEventListener("mousemove", mousemoveEventListener, false);
        document.removeEventListener("mouseup",arguments.callee, false);
    },false);
}

// controller

var controls = Object.create(null);
var colorInput;

controls.painter = function(ctx) {
    var DEFAULT_TOOL = 0;
    var select = elt("select", null);
    var label = elt("label", null, "그리기도구 : ", select);
    
    for(var name in paintTools) {
        select.appendChild(elt("option", {value: name}, name));
    }
    
    select.selectedIndex = DEFAULT_TOOL;

    paintTool = select.children[DEFAULT_TOOL].value;
    select.addEventListener("change", function(e) {
        paintTool = this.children[this.selectedIndex].value;
    })
    return label;
};

controls.brushsize = function(ctx) {
    var size = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28];
    var select = elt("select", null);
    for(var i=0; i<size.length; i++) {
        select.appendChild(elt("option", {value:size[i].toString()}, size[i].toString()));
    }
    select.selectedIndex = 2;
    ctx.lineWidth = size[select.selectedIndex];

    var label = elt("label", null, " 선의 너비:" , select);

    select.addEventListener("change", function(e) {
        ctx.lineWidth = this.value;
    }, false);
    return label;
};

controls.alpha = function(ctx) {
    var input = elt("input", {type:"number", min: "0", max: "1", step: "0.05", value:"1"});
    var label = elt("label", null, " 투명도: ", input);
    input.addEventListener("change", function(e) {
        ctx.globalAlpha = this.value;
    }, false);
    return label;
}

controls.color = function(ctx) {
    var input = elt("input", {type: "color", value: "#000000"});
    var label = elt("label", null, " 색상: ", input);
    
    input.addEventListener("change",function(e) {
        ctx.strokeStyle = this.value;
        ctx.fillStyle = this.value;
    }, false);

    return label;
}

