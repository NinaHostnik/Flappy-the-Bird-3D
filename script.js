//globalne spremenljivke
var canvas;
var gl;
var shaderProgram;

//Buffers
var flappyVertexPositionBuffer;
var flappyVertexColorBuffer;
var flappyVertexIndexBuffer;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

//var rotationFlappy = 0;  maybe bomo rabl
var lastTime = 0;

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
  colors = [
      [1.0, 1.0, 0.0, 1.0], // Front face
      [1.0, 1.0, 0.0, 1.0], // Back face
      [1.0, 1.0, 0.0, 1.0], // Top face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
      [1.0, 1.0, 0.0, 1.0], // Right face
      [1.0, 1.0, 0.0, 1.0]  // Left face
  ];

  // Convert the array of colors into a table for all the vertices.
  var unpackedColors = [];
  for (var i in colors) {
    var color = colors[i];

    // Repeat each color four times for the four vertices of the face
    for (var j=0; j < 4; j++) {
          unpackedColors = unpackedColors.concat(color);
      }
  }

  // Pass the colors into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
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
}

function drawScene() {
  // set the rendering environment to full canvas size
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  mat4.identity(mvMatrix);


  // Flappy:

  // Now move the drawing position a bit to where we want to start
  // drawing the flappy.
  mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);


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
}

//
// animate
//
// Called every time before redeawing the screen.
//
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    // rotate pyramid and flappy for a small amount
    //rotationflappy += (75 * elapsed) / 1000.0;
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
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {
	
  if (currentlyPressedKeys[87]) {
    // W
  }
  if (currentlyPressedKeys[65]) {
    // A
  }
  if (currentlyPressedKeys[83]) {
    // S
  }
  if (currentlyPressedKeys[68]) {
    // D
  }
  if (currentlyPressedKeys[32]) {
    // SPACE
  }
  if (currentlyPressedKeys[79]) {
    // O
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

function handleBkTex(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.Img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/*
*
*
igra
*
*
*/



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
	//startWindow();
	console.log("1");
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
    
    // Set up to draw the scene periodically.
    /*setInterval(function() {
      if (texturesLoaded) { // only draw scene and animate when textures are loaded.
        requestAnimationFrame(animate);
        handleKeys();
        drawScene();
      }
    }, 15);*/
	setInterval(function() {
      requestAnimationFrame(animate);
      drawScene();
    }, 15);
  }
}

//MIGHT BE USEFUL FOR READING OBJECTS

/*this.render = function(gl){
    // push identity to the matrix stack (to apply changes only to this object)
    mvPushMatrix();

    // apply translations
    mat4.translate(mvMatrix, [this.transX, this.transY, this.transZ]);

    // apply scaling
    mat4.scale(mvMatrix, [this.scaleX, this.scaleY, this.scaleZ]);

    // apply rotations
    mat4.rotate(mvMatrix, this.rotX, [1, 0, 0]);
    mat4.rotate(mvMatrix, this.rotY, [0, 1, 0]);
    mat4.rotate(mvMatrix, this.rotZ, [0, 0, 1]);

    // load position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        this.positionVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // load normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
        this.normalVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // load texture buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
        this.textureVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // load and apply the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // if blending is turned on, apply the blending and alpha value
    if(this.blending || this.firstRun){
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.uniform1f(shaderProgram.alphaUniform, this.alpha);
    }
    // otherwise, disable blending mode and render normally
    else{
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.uniform1f(shaderProgram.alphaUniform, 1.0);
    }

    // render with indices IF indices are enabled
    if(this.indicesEnabled){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexVertexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES,
            this.indexVertexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    // otherwise, render normally
    else {
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, this.textureVertexBuffer.numItems);
    }

    // pop the matrix stack
    mvPopMatrix();

    // unflag first run after first frame rendering
    this.firstRun = false;
}*/
