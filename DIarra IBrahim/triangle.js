"use strict";

var vertexShaderSource = `#version 300 es

in vec4 Position;
uniform mat4 MVP;
uniform mat4 MODEL;
out vec4 fragcolor;
uniform vec3 color;
void main() 
{

  fragcolor=vec4(color,1);
  gl_Position= MVP* Position; 

}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;
out vec4 outColor;
in vec4  fragcolor;

void main() 
{
 
  outColor = fragcolor;
}
`;

function createShader(gl, type, source) 
{
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

function createProgram(gl, vertexShader, fragmentShader) 
{
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
  //var program = createProgram(gl, vertexShader, fragmentShader);
  var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

  return program;

}



function toRadian(x)
{
  return x*Math.PI /180;
}


var canvas = document.querySelector("#glcanvas");

var indiceselement=36;
var positions = [
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  -0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,

  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  -0.5, 0.5, -0.5,
  0.5, 0.5, -0.5
 
];
var indices = [
  
  0, 3, 2,
  0, 1, 3, 

  1,7,3,
  1,5,7,
  

  5,6,7,
  5,4,6,
  
  4,2,6,
  4,0,2,

  2,7,6,
  2,3,7,

  4,1,0,
  4,5,1,
  
];

var vao;
var ibo;
var vbo ;


var vaotriangle;
var ibotriangle;
var vbotriangle ;

var vaocarre;
var ibocarre;
var vbocarre ;

var vaorectangle;
var iborectangle;
var vborectangle ;

var vaopentagone;
var ibopentagone;
var vbopentagone ;

var vaohexagone;
var ibohexagone;
var vbohexagone ;

var vaooctogone;
var ibooctogone;
var vbooctogone ;

var vaodisque;
var ibodisque;
var vbodisque ;

var vaocube;
var ibocube;
var vbocube ;




var cameraPosition=[0.,0.,3.];
var cameraDistance=0.;
var mouseLeftDown=false;
var mouseRightDown=false;
var mouseMiddleDown=false;
var mouseX=0.0;
var mouseY=0.0;
var cameraAngleX=0.;
var cameraAngleY=0.;
var couleur=[0.0,0.0,1.0];





function genereBuffer(gl,indexVertex) 
{

  ///////VBO///////
 var vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);

  ///////IBO///////
 var ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Int32Array(indices),gl.STATIC_DRAW);

  ///////VAO///////
 var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(indexVertex);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(indexVertex,3,gl.FLOAT,false,0,0); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  return vao;
}

function deleteVBO (gl)
//-----------------
{
  gl.deleteBuffer(vbo);
  gl.deleteBuffer(ibo);   
}

function drawScene(gl, programInfo) 
{
  //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0,0.0,0.0,0.0); 
  gl.clearDepth(10.0);                 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  

  //alert(gl.canvas.clientWidth);
  var fieldOfView = 60 * Math.PI / 180;   // en radians
  var aspect = canvas.clientWidth / canvas.clientHeight;
  var zNear = 0.1;
  var zFar = 1000.0;
  var Projection = mat4.create();  
  mat4.perspective(Projection,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

 

  var View = mat4.create();
  mat4.lookAt(View,cameraPosition,[0,0,0],[0,1,0]);
  


  var Model = mat4.create();
  mat4.translate(Model,Model,[0,0,cameraDistance]);  
  mat4.rotate(Model,Model,toRadian(cameraAngleX),[1,0,0]); 
  mat4.rotate(Model,Model,toRadian(cameraAngleY),[0,1,0]); 
  mat4.scale(Model,Model,[0.8,0.8,0.8]);
 


  var MVP= mat4.create();
  mat4.multiply(MVP,Projection,View);
  mat4.multiply(MVP,MVP,Model);
  

  gl.useProgram(programInfo.programID);
  gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDMVP,false, (MVP));
  gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDView,false,(View));
  gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDModel,false,(Model));
  gl.uniformMatrix4fv(programInfo.uniformLocations.MatrixIDPerspective,false, (Projection));

  gl.uniform3f( programInfo.uniformLocations.locCouleur ,couleur[0], couleur[1], couleur[2]);
 // console.log(couleur);
  gl.uniform3f( programInfo.uniformLocations.locCameraPosition ,cameraPosition.x, cameraPosition.y, cameraPosition.z);

  gl.bindVertexArray(vao);


   gl.drawElements(gl.TRIANGLES,indiceselement , gl.UNSIGNED_INT, 0);
  
}

function updateMousePosition(e){
  var x = e.offsetX;
  var y = e.offsetY;
  if(mouseLeftDown)
    {
      cameraAngleY+=(x-mouseX);
      cameraAngleX+=(y-mouseY);
      mouseX=x;
      mouseY=y;
    }
    if(mouseMiddleDown)
    {
        cameraDistance += (y - mouseY) * 0.2;
        mouseY = y;
    }
 
  
}

function mouseDown(e) {
  var x = e.offsetX;
  var y = e.offsetY;
  mouseX=x;
  mouseY=y;
  if(e.button==0)
  mouseLeftDown=true;
  else
  if(e.button==1)
  mouseMiddleDown=true;
  else
  if(e.button==2)
  mouseRightDown=true;
 
}

function mouseUp(e) {
  var x = e.offsetX;
  var y = e.offsetY;
  mouseX=x;
  mouseY=y;
  if(e.button==0)
  mouseLeftDown=false;
  else
  if(e.button==1)
  mouseMiddleDown=false;
  else
  if(e.button==2)
  mouseRightDown=false;
}
function Couleur(e)
{
  var couleurCourante= new String(e.target.value);

  document.getElementById("titre").style.color=couleurCourante;
  couleurCourante= couleurCourante.slice(1,6);
  var aRgbHex = couleurCourante.match(/.{1,2}/g);
  var aRgb = [
      parseInt(aRgbHex[0],16),
      parseInt(aRgbHex[1],16),
      parseInt(aRgbHex[2],16)
  ]
  console.log(couleurCourante);
  console.log(aRgb);
couleur[0]=aRgb[0]/255;
couleur[1]=aRgb[1]/255;
couleur[2]=aRgb[2]/255;
console.log(couleur);
}

function click(e)
{
  
  switch (e.target.id) {
case "cube":
vao=vaocube;
indiceselement=ibocube;

break;

case "triangle":
vao=vaotriangle;
indiceselement=ibotriangle;

break;
case "carre":
vao=vaocarre;
indiceselement=ibocarre
  
break;

case "rectangle":
vao=vaorectangle;
indiceselement=iborectangle

break;

case "pentagone":
vao=vaopentagone;
indiceselement=ibopentagone
break;
case "hexagone":
vao=vaohexagone;
indiceselement=ibohexagone
break;


case "octogone":
vao=vaooctogone;
indiceselement=ibooctogone
break;

case "disque":
vao=vaodisque;
indiceselement=ibodisque
  
break;
   
   
 
  
  }
  


}

function genereALLBuffer(gl,vertexPosition)
{
  vaocube=  genereBuffer(gl,vertexPosition);
  vao=vaocube;
  ibocube=indices.length;

//carré
  positions = [
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    -0.5, 0.5, 0,
    0.5, 0.5, 0,
  ];
  indices = [
    
    0, 3, 2,
    0, 1, 3, 
  
  ];
  vaocarre=  genereBuffer(gl,vertexPosition);
  ibocarre=indices.length;
//rectangle

  positions = [
    -1, -0.5, 0,
    1, -0.5, 0,
    -1, 0.5, 0,
    1, 0.5, 0,
  ];
  indices = [
    
    0, 3, 2,
    0, 1, 3, 
  
  ];
  vaorectangle=  genereBuffer(gl,vertexPosition);
  iborectangle=indices.length;
  //TRIANGLES
  positions = [
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0, 0.5, 0
    
  ];
  indices = [
    
    0, 1, 2
  
  
  ];
 
  vaotriangle=  genereBuffer(gl,vertexPosition);
  ibotriangle=indices.length;




   //cercle
   positions = [
    0,0,0
  ];
  indices = [
  
  
  ];

var n=20
  for (let i = 1; i < n; i++) {
    positions.push(Math.cos(i* 2*Math.PI /n ));
    positions.push(Math.sin(i* 2*Math.PI /n ));
    positions.push(0);
    indices.push(0);
    indices.push(i);
    indices.push(i+1);
  }

  positions.push(Math.cos( 2*Math.PI  ));
  positions.push(Math.sin( 2*Math.PI  ));
  positions.push(0);
  indices.push(0);
    indices.push(20);
    indices.push(1);
  vaodisque=  genereBuffer(gl,vertexPosition);
  ibodisque=indices.length;


 
  positions = [
    0,0,0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.8, 0.25, 0,
    0,0.8,0,
    -0.8, 0.25, 0,
   
  ];
  indices = [
    0,1,2,
    0,2,3,
    0,3,4,
    0,4,5,
    0, 5, 1,
  
  
  ];
  vaopentagone=  genereBuffer(gl,vertexPosition);
  ibopentagone=indices.length;



  positions = [
    0,0,0,
    -0.5, -0.8, 0,
    0.5, -0.8, 0,
    0.8, 0, 0,
    0.5, 0.8, 0,
    -0.5, 0.8, 0,
    
    -0.8, 0, 0,
   
  ];
  indices = [
    0,1,2,
    0,2,3,
    0,3,4,
    0,4,5,
    0,5, 6,
    0,6, 1
  
  ];
  vaohexagone=  genereBuffer(gl,vertexPosition);
  ibohexagone=indices.length;

}
function main() {
  // Get A WebGL context
  var Choixcouleur=document.getElementById("color");
  Choixcouleur.addEventListener("change",Couleur,false);

 
  document.getElementById("triangle").addEventListener( 'click', click, false );
  document.getElementById("carre").addEventListener( 'click', click, false );
  document.getElementById("rectangle").addEventListener( 'click', click, false );
  document.getElementById("pentagone").addEventListener( 'click', click, false );
  document.getElementById("hexagone").addEventListener( 'click', click, false );
  document.getElementById("octogone").addEventListener( 'click', click, false );
  document.getElementById("disque").addEventListener( 'click', click, false );
  document.getElementById("cube").addEventListener( 'click', click, false );
  var gl = canvas.getContext("webgl2");
  canvas.addEventListener( 'mousedown', mouseDown, false );
  canvas.addEventListener( 'mouseup', mouseUp, false );
  canvas.addEventListener( 'mousemove', updateMousePosition, false );

  
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

        locCouleur:gl.getUniformLocation(programID, "color"),
      
      },
    };
    genereALLBuffer(gl,programInfo.attribLocations.vertexPosition);
    function render() {
         
          drawScene(gl, programInfo);
          requestAnimationFrame(render);
    }
  requestAnimationFrame(render);


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
