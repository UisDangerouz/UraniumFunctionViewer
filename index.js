let display = document.getElementById('display');
let ctx = display.getContext('2d');
ctx.lineWidth = 4;

let displaySize = 500;

let cameraZoom = 100;
let cameraX = 0;
let cameraY = 0;
let cameraAccuracy = 200;

let graphs = [];
let graphColors = ['red', 'green', 'blue', 'yellow']
graphs.push(['0', true]);
graphs.push(['0', false]);

let fps = 30;

let controls = [];

function setZoom(value) {	
	cameraZoom = value;
	cameraZoom = Math.max(cameraZoom, 20);
	cameraZoom = Math.min(cameraZoom, 400);

	$('#zoomText').html('Zoom: ' + cameraZoom + '%')
	$('#zoomSlider').val(cameraZoom)
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

	x = origin + x * zoom - cameraX;
	y = origin - y * zoom + cameraY;
	
	return [x, y];
}

function renderGraphs() {
	resetDisplay();

	let viewRange = 2300 / cameraZoom;

	for(let g = 0; g < graphs.length; g++) {


		let graphFunction = graphs[g][0]

		let yAxis = graphs[g][1];

		let cameraModifier = (yAxis ? -cameraX : -cameraY) / cameraZoom * 5;

		let lastX = undefined;
		let lastY = undefined;

		let fValue;
		let p;
		for(let i = (-viewRange) / 2 - cameraModifier; i <= viewRange / 2 - cameraModifier; i += viewRange / cameraAccuracy) {
			fValue = math.evaluate(replaceAll(graphFunction, (yAxis ? 'x' : 'y'), '(' + i + ')'))

			if(yAxis) {
				p = getCameraPerspective(i, fValue);
			} else {
				p = getCameraPerspective(fValue, i);
			}
			
			x = p[0];
			y = p[1]

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
}

$(document).ready(() => {
	//CONTROLS
	$(document).bind('mousewheel DOMMouseScroll', (e) => {
		if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
			setZoom(cameraZoom + 10);
		}
		else {
			setZoom(cameraZoom - 10);
		}
		
	});
	
    $(document).on('keydown', function(e) {
        controls[e.keyCode] = true;
    });
    $(document).on('keyup', function(e) {
        controls[e.keyCode] = false;
    });
	
});
 
//MAIN LOOP
setInterval(() => {
	let moveStep = 5;

	if(controls[87]) {cameraY += moveStep;}
	if(controls[65]) {cameraX -= moveStep;} 
	if(controls[83]) {cameraY -= moveStep;} 
	if(controls[68]) {cameraX += moveStep;}
	if(controls[32]) {cameraX = 0; cameraY = 0;}

	//console.log(cameraX, cameraY);

	renderGraphs();
}, 1000 / fps);

function fixIncorrectVariables(yAxis) {
	let graphFunction = $('#graphFunctionTextbox').val();

	$('#graphFunctionTextbox').val(replaceAll(graphFunction, (yAxis ? 'y' : 'x'), (yAxis ? 'x' : 'y')))
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function addGraph() {
	let yAxis = Boolean(Number($('#axisSelector').val()));
	fixIncorrectVariables(yAxis);

	graphs.push([$('#graphFunctionTextbox').val(), yAxis]);
	updateGraphsList();

	renderGraphs();
}

function updateGraphsList() {
	graphsHTML = '<p><b>Graphs:</b></p>';
	for(let g = 2; g < graphs.length; g++) {
		graphsHTML += '<span style="color: ' + graphColors[g % graphColors.length] + '">' + (g - 1) + '. ' + (graphs[g][1] ? 'y = ' : 'x = ') + graphs[g][0] + '</span>';
		graphsHTML += '<input type="button" value="X" onclick="deleteGraph(' + g + ');"><br>'
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



$('#zoomSlider').change(() => {
	setZoom($('#zoomSlider').val());
});

setZoom(cameraZoom);


