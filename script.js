//globalne spremenljivke
var canvas;
var gl;
var shaderProgram;

//obstacle position
posX = [0.0, 7.0, 10.0, 8.0, 0.0, -3.0, -6.0, 2.0, 10.0, 8.0,
		4.0, 3.0, -3.0, -8.0, -7.0, -18.0, -5.0, 3.0, 10.0, 10.0,
		5.0, 5.0, 8.0, 3.0, 0.0, -4.0, -4.0, -8.0, -10.0, -7.0, 
		-2.0, -2.0, 2.0, 2.0, 5.0, 8.0, 10.0, 5.0, 7.0, 7.0, 
		1.0, -1.0, -5.0, -9.0, -6.0, -6.0, -8.0, 0.0, -2.0, -4.0,
		4.0, 7.0, 5.0, 2.0, -3.0, -7.0, -4.0, 0.0, 2.0, 8.0];  //60
		
		
posY = [0.0, 1.0, 2.0, 0.0, 0.0, -4.0, -2.0, -1.0, 0.0, 5.0,
		4.0, -2.0, -2.0, 1.0, 6.0, 6.0, 5.0, 4.0, 4.0, 0.0,
		-1.0, 1.0, 3.0, -2.0, 3.0, 2.0, -2.0, -3.0, -1.0, -1.0,
		2.0, -2.0, -2.0, -4.0, -3.0, -1.0, 0.0, 1.0, 2.0, 4.0, 
		3.0, 4.0, 4.0, 3.0, 3.0, 0.0, -1.0, -1.0, 0.0, 2.0,
		2.0, 3.0, 4.0, 3.0, 3.0, 2.0, 1.0, 0.0, -1.0, 0.0];	//60
		
		
posZ = [-10.0, -20.0, -30.0, -40.0, -50.0,
		-60.0, -70.0, -80.0, -90.0, -100.0, 
		-108.0, -116.0, -124.0, -132.0, -140.0,
		-148.0, -156.0, -164.0, -172.0, -180.0,
		-186.0, -192.0, -198.0, -204.0, -210.0,
		-216.0, -222.0, -228.0, -234.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0,
		-240.0, -240.0, -240.0, -240.0, -240.0
		];	//60


//Buffers
var flappyVertexPositionBuffer;
var flappyVertexColorBuffer;
var flappyVertexIndexBuffer;

var enemyVertexPositionBuffer;
var enemyVertexColorBuffer;
var enemyVertexIndexBuffer;

var ringVertexPositionBuffer;
var ringVertexColorBuffer;
var ringVertexIndexBuffer;


var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

//useful variables
//var rotationFlappy = 0;  maybe bomo rabl
var camera = 1; //2 je fisrt person view
var viewpoint = 6.0; //predvidevamo, da smo najprej v noramalnem pogledu
var falling = 0;	//trenutno NI pritisnjen W
var asc = 0;	//let navzgor
var ringsPassed = 0;	//score counter, TBD
var gameOver = 0;		//game stopper, TBD
var starting = 0;		//igra teče
var distance = 10;	//??
var StartDistance = 15;		//??
var speed = 0.1;	//movement speed
var xMov = 0;	//change of direction x by keyboard
var yMov = 0;	//change of direction y by keyboard
var zMov = 0;	//not used
var enemyBirdVar = 0;		//TBD???
var defense = 0;	//a je bil pritisnjen space al ne
var ezMode = 0;		//easy mode, no leveling, unable to get on highscore list, TBD
var lastTime = 0;	//??
var fall = 0;		//padanje navzdol
var pause =0;

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function initGL(canvas) {
  var gl = null;
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch(e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  return gl;
}

// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.
  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) {
        shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object
  gl.shaderSource(shader, shaderSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  // start using shading program for rendering
  gl.useProgram(shaderProgram);
  
  // store location of aVertexPosition variable defined in shader
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  // turn on vertex position attribute at specified position
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  // store location of aVertexColor variable defined in shader
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");

  // turn on vertex color attribute at specified position
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  // store location of uPMatrix variable defined in shader - projection matrix 
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

  // store location of uMVMatrix variable defined in shader - model-view matrix 
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

//
// setMatrixUniforms
//
// Set the uniform values in shaders for model-view and projection matrix.
//
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {
	
	
  //flappy//
  //
  //
  // Buffer for the flappy's vertices.
  flappyVertexPositionBuffer = gl.createBuffer();
  
  // flappyVertexPositionBuffer as the one to apply vertex
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexPositionBuffer);
  
  // Array of vertices for the flappy.
  vertices = [
    // Front face
    -0.1, -0.1,  0.1,
     0.1, -0.1,  0.1,
     0.1,  0.1,  0.1,
    -0.1,  0.1,  0.1,

    // Back face
    -0.1, -0.1, -0.1,
    -0.1,  0.1, -0.1,
     0.1,  0.1, -0.1,
     0.1, -0.1, -0.1,

    // Top face
    -0.1,  0.1, -0.1,
    -0.1,  0.1,  0.1,
     0.1,  0.1,  0.1,
     0.1,  0.1, -0.1,

    // Bottom face
    -0.1, -0.1, -0.1,
     0.1, -0.1, -0.1,
     0.1, -0.1,  0.1,
    -0.1, -0.1,  0.1,

    // Right face
     0.1, -0.1, -0.1,
     0.1,  0.1, -0.1,
     0.1,  0.1,  0.1,
     0.1, -0.1,  0.1,

    // Left face
    -0.1, -0.1, -0.1,
    -0.1, -0.1,  0.1,
    -0.1,  0.1,  0.1,
    -0.1,  0.1, -0.1
  ];
  
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  flappyVertexPositionBuffer.itemSize = 3;
  flappyVertexPositionBuffer.numItems = 24;

  //set up the color yellow for the vertices
  flappyVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexColorBuffer);
  colorsF = [
      [1.0, 1.0, 0.0, 1.0], // Front face
      [1.0, 1.0, 0.0, 1.0], // Back face
      [1.0, 1.0, 0.0, 1.0], // Top face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
      [1.0, 1.0, 0.0, 1.0], // Right face
      [1.0, 1.0, 0.0, 1.0]  // Left face
  ];

  // Convert the array of colors into a table for all the vertices.
  var unpackedColorsF = [];
  for (var i in colorsF) {
    var color = colorsF[i];

    // Repeat each color four times for the four vertices of the face
    for (var j=0; j < 4; j++) {
          unpackedColorsF = unpackedColorsF.concat(color);
      }
  }

  // Pass the colors into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColorsF), gl.STATIC_DRAW);
  flappyVertexColorBuffer.itemSize = 4;
  flappyVertexColorBuffer.numItems = 24;

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  flappyVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flappyVertexIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var flappyVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flappyVertexIndices), gl.STATIC_DRAW);
  flappyVertexIndexBuffer.itemSize = 1;
  flappyVertexIndexBuffer.numItems = 36;
  
  //enemy//
  //
  //
  // Buffer for the enemy's vertices.
  enemyVertexPositionBuffer = gl.createBuffer();
  
  // enemyVertexPositionBuffer as the one to apply vertex
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexPositionBuffer);
  
  // Array of vertices for the enemy.
  vertices = [
    // Front face
    -0.1, -0.1,  0.1,
     0.1, -0.1,  0.1,
     0.1,  0.1,  0.1,
    -0.1,  0.1,  0.1,

    // Back face
    -0.1, -0.1, -0.1,
    -0.1,  0.1, -0.1,
     0.1,  0.1, -0.1,
     0.1, -0.1, -0.1,

    // Top face
    -0.1,  0.1, -0.1,
    -0.1,  0.1,  0.1,
     0.1,  0.1,  0.1,
     0.1,  0.1, -0.1,

    // Bottom face
    -0.1, -0.1, -0.1,
     0.1, -0.1, -0.1,
     0.1, -0.1,  0.1,
    -0.1, -0.1,  0.1,

    // Right face
     0.1, -0.1, -0.1,
     0.1,  0.1, -0.1,
     0.1,  0.1,  0.1,
     0.1, -0.1,  0.1,

    // Left face
    -0.1, -0.1, -0.1,
    -0.1, -0.1,  0.1,
    -0.1,  0.1,  0.1,
    -0.1,  0.1, -0.1
  ];
  
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  enemyVertexPositionBuffer.itemSize = 3;
  enemyVertexPositionBuffer.numItems = 24;

  //set up the color yellow for the vertices
  enemyVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexColorBuffer);
  colorsE = [
      [0.0, 0.0, 0.0, 1.0], // Front face
      [0.0, 0.0, 0.0, 1.0], // Back face
      [0.0, 0.0, 0.0, 1.0], // Top face
      [0.0, 0.0, 0.0, 1.0], // Bottom face
      [0.0, 0.0, 0.0, 1.0], // Right face
      [0.0, 0.0, 0.0, 1.0]  // Left face
  ];

  // Convert the array of colors into a table for all the vertices.
  var unpackedColorsE = [];
  for (var i in colorsE) {
    var color = colorsE[i];

    // Repeat each color four times for the four vertices of the face
    for (var j=0; j < 4; j++) {
          unpackedColorsE = unpackedColorsE.concat(color);
      }
  }

  // Pass the colors into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColorsE), gl.STATIC_DRAW);
  enemyVertexColorBuffer.itemSize = 4;
  enemyVertexColorBuffer.numItems = 24;

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  enemyVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, enemyVertexIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var enemyVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(enemyVertexIndices), gl.STATIC_DRAW);
  enemyVertexIndexBuffer.itemSize = 1;
  enemyVertexIndexBuffer.numItems = 36;
  
  
  //"ring"
  
   ringVertexPositionBuffer = gl.createBuffer();
  
  // ringVertexPositionBuffer as the one to apply vertex
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexPositionBuffer);
  
  // Array of vertices for the ring.
  vertices = [
    // Front face
    -1.0,  1.0,  0.1,
     1.2,  1.0,  0.1,
     1.2,  1.2,  0.1,
    -1.0,  1.2,  0.1,

    // Back face
    -1.0,  1.0, -0.1,
     1.2,  1.0, -0.1,
     1.2,  1.2, -0.1,
    -1.0,  1.2, -0.1,

    // Top face
    -1.0,  1.2, -0.1,
    -1.0,  1.2,  0.1,
     1.0,  1.2,  0.1,
     1.0,  1.2, -0.1,

    // Bottom face
    -1.0,  1.0, -0.1,
     1.2,  1.0, -0.1,
     1.2,  1.0,  0.1,
    -1.0,  1.0,  0.1,

    // Right face
     1.2,  1.0, -0.1,
     1.2,  1.2, -0.1,
     1.2,  1.2,  0.1,
     1.2,  1.0,  0.1,

    // Left face
    -1.0,  1.0, -0.1,
    -1.0,  1.0,  0.1,
    -1.0,  1.2,  0.1,
    -1.0,  1.2, -0.1
  ];
  
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  ringVertexPositionBuffer.itemSize = 3;
  ringVertexPositionBuffer.numItems = 24;
  
  ringVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexColorBuffer);
  colorsR = [
      [1.0, 0.0, 0.0, 1.0], // Front face
      [1.0, 0.0, 0.0, 1.0], // Back face
      [1.0, 0.0, 0.0, 1.0], // Top face
      [1.0, 0.0, 0.0, 1.0], // Bottom face
      [1.0, 0.0, 0.0, 1.0], // Right face
      [1.0, 0.0, 0.0, 1.0]  // Left face
  ];

  // Convert the array of colors into a table for all the vertices.
  var unpackedColorsR = [];
  for (var i in colorsR) {
    var color = colorsR[i];

    // Repeat each color four times for the four vertices of the face
    for (var j=0; j < 4; j++) {
          unpackedColorsR = unpackedColorsR.concat(color);
      }
  }
  
  // Pass the colors into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColorsR), gl.STATIC_DRAW);
  ringVertexColorBuffer.itemSize = 4;
  ringVertexColorBuffer.numItems = 24;

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  ringVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringVertexIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var ringVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ringVertexIndices), gl.STATIC_DRAW);
  ringVertexIndexBuffer.itemSize = 1;
  ringVertexIndexBuffer.numItems = 36;
  
}

function drawScene() {
	//na začetku iteracije
	if(pause == 1){
		
	}
	else if(gameOver == 0 && starting == 0){  //IGRA NE TEČE
	
		// set the rendering environment to full canvas size
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		// Clear the canvas before we start drawing on it.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Establish the perspective with which we want to view the
		// scene. Our field of view is 45 degrees, with a width/height
		// ratio and we only want to see objects between 0.1 units
		// and 100 units away from the camera.
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, viewpoint, 100.0, pMatrix);
		// Set the drawing position to the "identity" point, which is
		// the center of the scene.
		mat4.identity(mvMatrix);


		// Flappy:

		// Now move the drawing position a bit to where we want to start
		// drawing the flappy.
		mvPushMatrix();

		if(camera == 1){
			mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
		}
		else{
			mat4.translate(mvMatrix, [0.0, 0.0, 0.0]);
		}
		
		
		//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
		//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
		//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);	


		// Draw the flappy by binding the array buffer to the flappy's vertices
		// array, setting attributes, and pushing it to GL.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, flappyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// Set the colors attribute for the vertices.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, flappyVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flappyVertexIndexBuffer);

		// Draw the flappy.
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, flappyVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		mvPopMatrix();
		
		//ring:
		
		for(var j = 0; j<posX.length; j++){
			mvPushMatrix();
			mat4.translate(mvMatrix, [posX[j], posY[j], posZ[j]]);
			for(var i = 0; i<4; i++){
				mvPushMatrix();
				mat4.rotate(mvMatrix, degToRad(i*90), [0, 0, 1]);
				//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
				//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
				//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ringVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				// Set the colors attribute for the vertices.
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexColorBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, ringVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringVertexIndexBuffer);
				
				// Draw the ring.
				setMatrixUniforms();
				gl.drawElements(gl.TRIANGLES, ringVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
				mvPopMatrix();
			}
			mvPopMatrix();
		}
	}
	else if (gameOver == 0 && starting == 1){  //IGRA TEČE
		// isto kot zgoraj
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, viewpoint, 100.0, pMatrix);
		mat4.identity(mvMatrix);

		// Flappy:


		mvPushMatrix();
		if(camera == 1){
			mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
		}
		else{
			mat4.translate(mvMatrix, [0.0, 0.0, 0.0]);
		}
		
		//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
		//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
		//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);	

		// Draw the flappy by binding the array buffer to the flappy's vertices
		// array, setting attributes, and pushing it to GL.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, flappyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// Set the colors attribute for the vertices.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, flappyVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flappyVertexIndexBuffer);

		// Draw the flappy.
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, flappyVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		//console.log("x"+xMov);
		//console.log("y"+yMov);
		console.log("lap");
		mvPopMatrix();
		if(falling == 1){
			asc = 0;
			yMov = yMov - fall*0.1;
			fall = fall + 0.05;
		}
		for(var j = 0; j<posX.length; j++){		//RISANJE OBROČEV
			if(posZ[j]+0.1 > -7.1 && posZ[j]-0.1 < 6.9){	//ptič vzporedno z obročem po Z
				console.log("in");
				if(posX[j]-xMov > -0.5 && posX[j]-xMov < 0.5){	//po X je ptič v obroču
					if(posY[j]-yMov > -0.5 && posY[j]-yMov < 0.5){	//po X je ptič v obroču
						
					}
				}
				else{
					gameOver = 1; //ptič ni v obroču, konec igre
					starting = 0; //ne igramo več
					console.log("over");
				}
			}
			mvPushMatrix();
			mat4.translate(mvMatrix, [-xMov + posX[j], -yMov + posY[j], posZ[j]]);
			console.log("x"+(-xMov+ posX[j]));
			console.log("y"+(-yMov+ posY[j]));
			for(var i = 0; i<4; i++){
				mvPushMatrix();
				mat4.rotate(mvMatrix, degToRad(i*90), [0, 0, 1]);
				//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
				//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
				//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ringVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				// Set the colors attribute for the vertices.
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexColorBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, ringVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringVertexIndexBuffer);
				
				// Draw the ring.
				setMatrixUniforms();
				gl.drawElements(gl.TRIANGLES, ringVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
				mvPopMatrix();
			}
			mvPopMatrix();
			if(gameOver == 0){
				posZ[j] = posZ[j] + speed;
			}
		}
	}
	else if(gameOver == 1){
		// isto kot zgoraj
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, viewpoint, 100.0, pMatrix);
		mat4.identity(mvMatrix);

		// Flappy:


		mvPushMatrix();
		if(camera == 1){
			mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
		}
		else{
			mat4.translate(mvMatrix, [0.0, 0.0, 0.0]);
		}
		
		//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
		//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
		//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);	

		// Draw the flappy by binding the array buffer to the flappy's vertices
		// array, setting attributes, and pushing it to GL.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, flappyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		// Set the colors attribute for the vertices.
		gl.bindBuffer(gl.ARRAY_BUFFER, flappyVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, flappyVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flappyVertexIndexBuffer);

		// Draw the flappy.
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, flappyVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		mvPopMatrix();
		for(var j = 0; j<posX.length; j++){		//RISANJE OBROČEV
			mvPushMatrix();
			mat4.translate(mvMatrix, [-xMov + posX[j], -yMov + posY[j], posZ[j]]);
			for(var i = 0; i<4; i++){
				mvPushMatrix();
				mat4.rotate(mvMatrix, degToRad(i*90), [0, 0, 1]);
				//mat4.translate(mvMatrix, [-1, -1.5, -10.0]);
				//mat4.rotate(mvMatrix, degToRad(10), [1, 0, 0]);
				//mat4.rotate(mvMatrix, degToRad(25), [0, 1, 0]);
				
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ringVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				// Set the colors attribute for the vertices.
				gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexColorBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, ringVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringVertexIndexBuffer);
				
				// Draw the ring.
				setMatrixUniforms();
				gl.drawElements(gl.TRIANGLES, ringVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
				mvPopMatrix();
			}
			mvPopMatrix();
		}
	}
}

//
// animate
//
// Called every time before redeawing the screen.
//
function animate() {  //dont really need this?
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    // rotate pyramid and flappy for a small amount
  }
  lastTime = timeNow;
}

/*
*
*
komande
*
*
*/
var currentlyPressedKeys = {};

function handleKeyDown(event) {
  // storing the pressed state for individual key
  //works if game is running
  if(gameOver == 0){
	currentlyPressedKeys[event.keyCode] = true;
  }
}

function handleKeyUp(event) {
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {
	
  if (currentlyPressedKeys[87]) {
    // W
	if (starting == 0){
		//trenutno igra ne teče, zaženemo z tipko W
		starting = 1;
		console.log("1");
	}
	falling = 0;
	fall = 0;
	yMov = yMov + asc*0.1;
	asc = asc + 0.05;
	
  }
  if (currentlyPressedKeys[65]) {
    //A
	xMov = xMov - speed;
  }
  if (currentlyPressedKeys[83]) {
    // S
	//če so settingi v htmlju, tega ne rabmo
	pause = 1;
  }
  if (currentlyPressedKeys[68]) {
    // D
	xMov = xMov + speed;
  }
  if (currentlyPressedKeys[32]) {
    // SPACE
	defense = 1;
  }
  if (currentlyPressedKeys[79]) {
    // O
	//damo to v htmlju narest??
  }
}


/*
*
*
zacetni zaslon
*
*
*/
function startWindow () {
	/*window.addEventListener("DOMContentLoaded", function() {
			var fr = new FileReader();
			
			var image  = "testbg.png";
			var canvas = document.createElement("canvas");
			document.body.appendChild(canvas);

			canvas.width  = image.width;
			canvas.height = image.height;

			var context = canvas.getContext("2d");

			context.drawImage(image, 0, 0);
		});*/
	/*backTexture = gl.createTexture();
	backTexture.Img = new Image();
	backTexture.Img.onload()= function() {
		handleBkTex(backTexture);
	}
	backTexture.Img.src = "testbg.png";*/
}


/*
*
*
igra
*
*
*/

function enemyBirds(){
	
}

function cameraPos(x){		//NOT USED YET
	camera = x;
	if(x == 1){
		viewpoint = 6.0;
	}
	else{
		viewpoint = 0.1;
	}
}

/*
*
*
koncni zaslon
*
*
*/

//funkcija start
function start() {
  canvas = document.getElementById("glcanvas");

  gl = initGL(canvas);      // Initialize the GL context

  // Only continue if WebGL is available and working
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);                      // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                                     // Clear everything
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    initBuffers();
    
    // Next, load and set up the textures we'll be using.
    //initTextures();

    // Bind keyboard handling functions to document handlers
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
	setInterval(function() {
      requestAnimationFrame(animate);
	  falling = 1;
	  defense = 0;
	  handleKeys();
      drawScene();
    }, 15);
  }
}
