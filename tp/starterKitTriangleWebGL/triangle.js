"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 Position;
uniform mat4 MVP;//recuperation de la matrice mvp
uniform mat4 MODEL;
out vec4 fragcolor;
// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  fragcolor=Position;
  gl_Position= MVP* Position; 

}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
out vec4 outColor;
in vec4  fragcolor;
void main() {
  // Just set the output to a constant redish-purple
  outColor = fragcolor;
}
`;

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
  gl.deleteProgram(program);
  return undefined;
}


function initWEBGL(gl)
{
  gl.cullFace(gl.BACK);// on spécifie queil faut éliminer les face arriere
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);


  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var program = createProgram(gl, vertexShader, fragmentShader);


return program;


}





function toRadian(x)
{
  return x*Math.PI /180;
}

var positions = [
  0.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  0.0, 1.0, 0.0,
  1.0, 1.0, 0.0
];
var indices = [
  0, 3, 2
     
];

var vao;
var ibo;
var vbo ;

var cameraPosition=[0.,0.,3.];
var cameraDistance=0.;
var mouseLeftDown;
var mouseRightDown;
var mouseMiddleDown;
var mouseX=0.0;
var mouseY=0.0;
var cameraAngleX=0.;
var cameraAngleY=0.;





function genereBuffer(gl,indexVertex) {

  // Créer un tampon des coordonnées des sommets pour le triangle.
  vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);


  ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Int32Array(indices),
    gl.STATIC_DRAW);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(indexVertex);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(indexVertex,3,gl.FLOAT,false,0,0); 
  // démarrer à partir de combien d'octets dans le tampon
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindVertexArray(null);

 
}

function deleteVBO (gl)
//-----------------
{
  gl.deleteBuffer(vbo);
  gl.deleteBuffer(ibo);
 
    
}

function drawScene(gl, programInfo) {
  gl.clearColor(1.0,1.0,1.0,0.0);  // effacement en noir, complètement opaque
  gl.clearDepth(1.0);                 // tout effacer

  // Effacer le canevas avant que nous ne commencions à dessiner dessus.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  // Créer une matrice de perspective
  // Champ de vision de 45 degrés, avec un rapport largeur/hauteur qui correspond à la taille d'affichage du canvas, profondeur entre 0,1 et 100
  var fieldOfView = 60 * Math.PI / 180;   // en radians
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zNear = 0.1;
  var zFar = 1000.0;
  var Projection = mat4.create();

  // note: glmatrix.js a toujours comme premier argument la destination où stocker le résultat.  
  mat4.perspective(Projection,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Définir la position de dessin comme étant le point "origine", qui est le centre de la scène.
  var View = mat4.create();

  mat4.lookAt(View,cameraPosition,[0,0,0],[0,1,0]);
  // translation
  var Model = mat4.create();


  mat4.translate(Model,  Model, [0,0,cameraDistance]);  // amount to translate
  mat4.rotate(Model,  Model,toRadian(cameraAngleX), [1,0,0]); 
  mat4.rotate(Model, Model,toRadian(cameraAngleY) , [0,1,0]); 
 
  var MVP= mat4.create();
 mat4.multiply(MVP,Projection,View);
 mat4.multiply(MVP,MVP,Model);
 

 
// Indiquer à WebGL d'utiliser notre programme pour dessiner
gl.useProgram(programInfo.programID);

// Définir les uniformes du shader
gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDMVP,false, (MVP));
gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDView,false,(View));
gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDModel,false,(Model));
gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDPerspective,false, (Projection));

gl.uniform3f( programInfo.uniformLocations.locCameraPosition ,cameraPosition.x, cameraPosition.y, cameraPosition.z);

gl.bindVertexArray(vao);



   gl.drawElements(gl.TRIANGLES,indices.length , gl.UNSIGNED_INT, 0);
  
}













function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#glcanvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var programID=initWEBGL(gl);
 
  var programInfo = 
    {
      programID: programID,
      attribLocations: 
      {
          vertexPosition: gl.getAttribLocation(programID, 'Position'),//création d'un pointeur pour les données de vertex
    
      },
      uniformLocations:
      { 
        MatrixIDMVP :gl.getUniformLocation(programID, "MVP"),
        MatrixIDView: gl.getUniformLocation(programID, "VIEW"),
        MatrixIDModel: gl.getUniformLocation(programID, "MODEL"),
        MatrixIDPerspective :gl.getUniformLocation(programID, "PERSPECTIVE"),

        locCameraPosition : gl.getUniformLocation(programID, "cameraPosition"),
        locmaterialShininess :gl.getUniformLocation(programID, "materialShininess"),
        locmaterialSpecularColor:gl.getUniformLocation(programID, "materialSpecularColor"),
        locLightPosition :gl.getUniformLocation(programID, "light.position"),
        locLightIntensities:gl.getUniformLocation(programID, "light.intensities"),//a.k.a the color of the light
        locLightAttenuation:gl.getUniformLocation(programID, "light.attenuation"),
        locLightAmbientCoefficient: gl.getUniformLocation(programID, "light.ambientCoefficient"),
        locSilhouette:gl.getUniformLocation(programID, "silhouette"),
        locShad:gl.getUniformLocation(programID, "shad"),
      
      },
    };
    genereBuffer(gl,programInfo.attribLocations.vertexPosition);
    function render() {

          drawScene(gl, programInfo);
          requestAnimationFrame(render);
    }
  requestAnimationFrame(render);

  //deleteVBO (gl);
}


function handleKeyPressed(evenement){
  switch(evenement.keyCode){
    case 88:
      if(evenement.shiftKey) 
        rotAxeX =0.1;
      else 
        rotAxeX +=0.1; break;
  default: break;}}

  window.onkeydown = handleKeyPressed;
main();
