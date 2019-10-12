let display = document.getElementById('display');
let ctx = display.getContext('2d');

let displaySize = 500;
let gridLineCount;
let lineWidth;

let zoom = 200;

let graphs = []
let graphColors = ['blue', 'red', 'green', 'yellow', 'black']

function setZoom(value) {	
	$('#zoomText').html('Zoom: ' + value + '%')
	$('#zoomSlider').val(value)

	let modifier = value / 100

	gridLineCount = 10 * (4 - modifier) + 2
	lineWidth = 1 * modifier
	
	renderGraphs();
}

function line(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke(); 
}

function resetDisplay() {
	ctx.lineWidth = lineWidth;
	
	ctx.fillStyle = "#9e9e9e";
	ctx.fillRect(0, 0, displaySize, displaySize);

	ctx.strokeStyle = 'white';
	
	for(i = lineWidth / 2; i <= displaySize; i += (displaySize - lineWidth) / gridLineCount) {
		line(0, i, displaySize, i);
		line(i, 0, i, displaySize);
	}
	let axisPoint = displaySize / 2 
	ctx.strokeStyle = 'black';
	line(0, axisPoint, displaySize, axisPoint)
	line(axisPoint, 0, axisPoint, displaySize)
}

function getGraphPoints(graphFunction, yAxis, pointCount) {
	let graph = [];
	let currentValue;

	if(yAxis) {
		for(let i = -(displaySize / 2); i <= displaySize / 2; i += displaySize / pointCount) {
			
			currentValue = math.evaluate(replaceAll(graphFunction, 'x', i))
			graph.push([i, currentValue]);
		}
	} else {
		
	}
	
	console.log(graph);
	
	return graph;
}

function getPointCoordinates(point) {
	let x = point[0];
	let y = point[1];
	
	let origin = displaySize / 2;
	
	let step = (displaySize - lineWidth) / gridLineCount;
	
	x = origin + x * step;
	y = origin - y * step;
	
	return [x, y];
}

function renderGraphs() {
	resetDisplay();
	
	let graph;
	for(let g = 0; g < graphs.length; g++) {
		ctx.strokeStyle = graphColors[g % graphColors.length];
		
		graph = graphs[g];
		
		let lastPoint = getPointCoordinates(graph[0]);
		let currentPoint;
		
		for(let i = 0; i < graph.length; i++) {
			currentPoint = getPointCoordinates(graph[i]);
			line(lastPoint[0], lastPoint[1], currentPoint[0], currentPoint[1]);
			
			lastPoint[0] = currentPoint[0];
			lastPoint[1] = currentPoint[1];
		}
	}
}

$(document).ready(() => {
	$(document).bind('mousewheel DOMMouseScroll', (e) => {
		if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
			zoom += 20;
		}
		else {
			zoom -= 20;
		}
		
		zoom = Math.max(zoom, 20);
		zoom = Math.min(zoom, 400);
		
		setZoom(zoom);
	});
});

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

$('#newGraphBtn').click(() => {
	graphs = [];
	graphs.push(getGraphPoints($('#graphFunctionTextbox').val(), $('#axisSelector').val(), 10000));
	renderGraphs();
});

$('#addGraphBtn').click(() => {
	graphs.push(getGraphPoints($('#graphFunctionTextbox').val(), $('#axisSelector').val(), 10000));
	renderGraphs();
});

$('#zoomSlider').change(() => {
	setZoom($('#zoomSlider').val());
});

setZoom(200);
