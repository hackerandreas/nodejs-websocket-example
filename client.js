function shaderProgram(gl, vs, fs) {
	var prog = gl.createProgram();
	var addshader = function(type, source) {
		var s = gl.createShader((type == 'vertex') ?
			gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
		gl.shaderSource(s, source);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			throw "Could not compile "+type+
				" shader:\n\n"+gl.getShaderInfoLog(s);
		}
		gl.attachShader(prog, s);
	};
	addshader('vertex', vs);
	addshader('fragment', fs);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		throw "Could not link the shader program!";
	}
	return prog;
}

function attributeSetFloats(gl, prog, attr_name, rsize, arr) {
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
		gl.STATIC_DRAW);
	var attr = gl.getAttribLocation(prog, attr_name);
	gl.enableVertexAttribArray(attr);
	gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
}

function draw() {
	try {
		var gl = document.getElementById("webgl")
			.getContext("experimental-webgl");
		if (!gl) { throw "x"; }
	} catch (err) {
		throw "Your web browser does not support WebGL!";
	}
	gl.clearColor(0.8, 0.8, 0.8, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var prog = shaderProgram(gl,
		"attribute vec3 pos;"+
		"void main() {"+
		"	gl_Position = vec4(pos, 2.0);"+
		"}",
		"void main() {"+
		"	gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);"+
		"}"
	);
	gl.useProgram(prog);

	attributeSetFloats(gl, prog, "pos", 3, [
		-1, 0, 0,
		0, 1, 0,
		0, -1, 0,
		1, 0, 0
	]);
	
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function init() {
	try {
		draw();
	} catch (e) {
		alert("Error: "+e);
	}
}

function helloworld(){
	var ip = location.hostname;
    alert(ip);
}

$(document).ready(function() {

setTimeout(init, 100);

window.WebSocket = window.WebSocket || window.MozWebSocket;
//helloworld();
var accX = $("#accelerationX");
var accY = $("#accelerationY");
var accZ = $("#accelerationZ");
var rotA = $("#rotationAlpha");
var rotB = $("#rotationBeta");
var rotG = $("#rotationGamma");

// open connection
var connection = new WebSocket('ws://'+location.hostname+':1337');
	connection.onopen = function () {
		$("#test").html("init");
		$("#test-button").click(function(){
			connection.send(JSON.stringify({message: "hallo"}));
		});
		
		connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
			try {
				var json = JSON.parse(message.data);
			} catch (e) {
				console.log('This doesn\'t look like a valid JSON: ', message.data);
				return;
			}

			accX.html(json.x);
			accY.html(json.y);
			accZ.html(json.z);
			rotA.html(json.alpha);
			rotB.html(json.beta);
			rotG.html(json.gamma);

		};
		
		var handleOrientationEvent = function(event){
			//$("#test").html("frontToBack: "+event.beta+", leftToRight: "+event.gamma+", rotateDegrees: "+event.alpha);
			//connection.send({alpha: event.alpha, beta: event.beta, gamma: event.gamma});
		};

		var handleMotionEvent = function(event) {
			var x = event.accelerationIncludingGravity.x;
			var y = event.accelerationIncludingGravity.y
			var z = event.accelerationIncludingGravity.z
			//connection.send({x: x, y: y, z: z});
			//$("#accelerationX").html(x);
			//$("#accelerationY").html(y);
			//$("#accelerationZ").html(z);
			var alpha = 0;
			var beta = 0;
			var gamma = 0;
			if ( event.rotationRate ) {	
				alpha = event.rotationRate.alpha;
				beta = event.rotationRate.beta;
				gamma = event.rotationRate.gamma;
				//connection.send({alpha: alpha, beta: beta, gamma: gamma});
				//$("#rotationAlpha").html(alpha);
				//$("#rotationBeta").html(beta);
				//$("#rotationGamma").html(gamma);
			}
			connection.send(JSON.stringify({x: x, y: y, z: z, alpha: alpha, beta: beta, gamma: gamma}));
		}
		
		window.addEventListener("devicemotion", handleMotionEvent, true);
		//window.addEventListener("deviceorientation", handleOrientationEvent, true);
	};
});

