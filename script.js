//globalne spremenljivke
var canvas;
var gl;

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
	window.addEventListener("DOMContentLoaded", function() {
			var fr = new FileReader();
			
			var image  = "testbg.png";
			var canvas = document.createElement("canvas");
			document.body.appendChild(canvas);

			canvas.width  = image.width;
			canvas.height = image.height;

			var context = canvas.getContext("2d");

			context.drawImage(image, 0, 0);
		});
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
    gl.clearDepth(1.0);                                     // Clear everything
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    //initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    //initBuffers();
    
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
  }
}