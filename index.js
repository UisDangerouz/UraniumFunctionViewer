let display = document.getElementById('display');
let ctx = display.getContext('2d');
ctx.lineWidth = 4;
ctx.font = "14px Arial";

let displaySize = 500;
//AREA THAT IS NOT RENDERED INSIDE THE SCREEN
let displayMargin = 10;

let cameraZoom = 100;
let cameraX = 0;
let cameraY = 0;
$('#cameraAccuracySelector').val(200);
let cameraAccuracy = Number($('#cameraAccuracySelector').val());

let graphs = [];
let graphColors = ['red', 'pink', 'blue', 'yellow', 'orange', 'white']
graphs.push(['0', true]);
graphs.push(['0', false]);

let fpsTarget = 30;
let frames = 0;
let fps = fpsTarget;

let controls = [];

function setZoom(value) {	
	cameraZoom = value;
	cameraZoom = Math.max(cameraZoom, 10);
	cameraZoom = Math.min(cameraZoom, 500);

	$('#zoomText').html(cameraZoom + '%')
}

function line(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke(); 
}

function resetDisplay() {
	ctx.fillStyle = "#9e9e9e";
	ctx.fillRect(0, 0, displaySize, displaySize);
}

function getCameraPerspective(x, y) {
	let origin = displaySize / 2;
	
	let zoom = cameraZoom / 5;

	x = origin + (x - cameraX) * zoom;
	y = origin - (y - cameraY) * zoom;
	
	return [x, y];
}

function renderGraphs() {
	resetDisplay();

	let viewRange = (10 * (displaySize / 2 - displayMargin)) / cameraZoom;

	for(let g = 0; g < graphs.length; g++) {


		let graphFunction = graphs[g][0]

		let yAxis = graphs[g][1];

		let cameraModifier = (yAxis ? -cameraX : -cameraY);

		let lastX = undefined;
		let lastY = undefined;

		let fValue;
		let p;
		for(let i = (-viewRange) / 2 - cameraModifier; i <= viewRange / 2 - cameraModifier; i += viewRange / cameraAccuracy) {
			fValue = math.evaluate(replaceAll(graphFunction, (yAxis ? 'x' : 'y'), '(' + i + ')'))

			if(yAxis) {
				[x, y] = getCameraPerspective(i, fValue);
			} else {
				[x, y] = getCameraPerspective(fValue, i);
			}

			drawValue = (yAxis ? y : x);
			if(drawValue < displayMargin || drawValue > displaySize - displayMargin) {
				continue;
			}

			//AXIS LINES ARE ALWAYS BLACK
			if(g <= 1) {
				ctx.strokeStyle = 'black';
			} else {
				ctx.strokeStyle = graphColors[g % graphColors.length];
			}
			line(lastX, lastY, x, y)

			lastX = x;
			lastY = y;
		}

	}	

	//CROSSHAIR AND INFO TEXT

	ctx.fillStyle = 'white'
	ctx.beginPath();
	ctx.arc(displaySize / 2, displaySize / 2, 4, 0, Math.PI*2);
	ctx.fill();

	ctx.fillText(fps + ' FPS', 10, 20);
}

$(document).ready(() => {
	//CONTROLS
	$(document).bind('mousewheel DOMMouseScroll', (e) => {
		if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
			setZoom(cameraZoom + 10);
		} else {
			setZoom(cameraZoom - 10);
		}
		
	});
	
    $(document).on('keydown', function(e) {
        controls[e.keyCode] = true;
    });
    $(document).on('keyup', function(e) {
        controls[e.keyCode] = false;
    });
	
	$('#cameraAccuracySelector').on('change', () => {
		cameraAccuracy = Number($('#cameraAccuracySelector').val());
	});
});
 
//MAIN LOOP
setInterval(() => {
	let moveStep = 50 / cameraZoom;

	if(controls[37]) {cameraX -= moveStep;}
	if(controls[38]) {cameraY += moveStep;} 
	if(controls[39]) {cameraX += moveStep;} 
	if(controls[40]) {cameraY -= moveStep;}
	if(controls[32]) {cameraX = 0; cameraY = 0;}

	if(controls[173] || controls[109]) {setZoom(cameraZoom - 10);}
	if(controls[171] || controls[107]) {setZoom(cameraZoom + 10);}

	//console.log(cameraX, cameraY);

	renderGraphs();

	frames++;
}, 1000 / fpsTarget);

setInterval(() => {
	fps = frames;
	frames = 0;
}, 1000);

function fixIncorrectVariables(graph, yAxis) {
	let graphFunction = $('#graphFunctionTextbox').val();

	return replaceAll(graphFunction, (yAxis ? 'y' : 'x'), (yAxis ? 'x' : 'y'));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function addGraph() {
	let input = $('#graphFunctionTextbox').val();
	if(input.length == 0) {
		return;
	}

	let yAxis = Boolean(Number($('#axisSelector').val()));
	input = fixIncorrectVariables(input, yAxis);

	graphs.push([input, yAxis]);
	updateGraphsList();

	renderGraphs();
	$('#graphFunctionTextbox').val('');
}

function updateGraphsList() {
	graphsHTML = '<p><b>Graphs:</b></p>';
	for(let g = 2; g < graphs.length; g++) {
		graphsHTML += '<span style="color: ' + graphColors[g % graphColors.length] + '">' + (g - 1) + '. ' + (graphs[g][1] ? 'y = ' : 'x = ') + graphs[g][0] + '</span>';
		graphsHTML += '<input type="button" value="X" onclick="deleteGraph(' + g + ');">'
	}
	$('#graphsDiv').html(graphsHTML);
}

function deleteGraph(id) {
	graphs.splice(id, 1);
	updateGraphsList();
	renderGraphs();
}

$('#newGraphBtn').click(() => {
	graphs = [];
	graphs.push(['0', true]);
	graphs.push(['0', false]);

	addGraph();
});

$('#addGraphBtn').click(() => {
	addGraph();
});

//RESET
setZoom(cameraZoom);
$('#axisSelector').val(1);
$('#graphFunctionTextbox').val('sin(x)');
addGraph();




