
function loadShader(gl, type, source) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}
function back()
{
  document.location.href = "../index.html";
}

function initShProg(gl, vsSource, fsSource) {
  const vS = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fS = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const sh = gl.createProgram();

  gl.attachShader(sh, vS);
  gl.attachShader(sh, fS);
  gl.linkProgram(sh);

  if (!gl.getProgramParameter(sh, gl.LINK_STATUS)) {
    alert(gl.getProgramInfoLog(sh));
    return null;
  }
  return sh;
}
function main() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl2"); 
  const rect = canvas.getBoundingClientRect();
  if (gl === null) {
    alert("Srry m8 yo pc not supported");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let fsSrc = `#version 300 es
    precision highp float;   

    uniform vec2 iResolution;
    out vec4 FragColor;
     
    vec4 getCol(float coord,int ColNum) //From my other shader https://www.shadertoy.com/view/fdScRt
    { 
        //Make these uniforms and allow user to select colors
        vec4[] cols =vec4[] (vec4(85,205,252,255),vec4(247,168,184,255),vec4(255),vec4(247,168,184,255),vec4(85,205,252,255));       
        //vec4[] cols1 = vec4[] (vec4(255,0,24,255),vec4(255,165,44,255),vec4(255,255,65,255),vec4(0,128,24,255),vec4(0,0,249,255),vec4(134,0,125,255));
        int arrLength = 5;
        
        if(ColNum == 1) 
            return cols[0];
            
        float cstep1 = 1.0 / float(ColNum - 1);//Num of subgradients = num of colors - 1
        
        for(int i = 1; i < ColNum; i++)
        {
            if(coord < cstep1 * float(i))
            return mix(cols[int(mod(float(i-1),float(arrLength)))],cols[int(mod(float(i),float(arrLength)))], coord / cstep1 - float (i - 1));
        }    
        return vec4(coord);
    }
    
    
    
    
    vec4 GetColor(vec2 uv,float i,float maxI)
    {
       if(i == maxI)
           return vec4(0);
        return getCol((maxI * .15 + i)  / maxI,200) / 255.;
    }
    
    void main( )
    {    
        vec2 MinVals = vec2(-1.05,-0.5); 
        vec2 uv = (gl_FragCoord.xy / iResolution.y);//Get ss coords
        uv = (uv + MinVals)  / 0.35; //Offset and scale ss coords     
        
        vec2 coords = vec2(0);    
        vec2 coords2 = vec2(0);
        int iter = 0;
        int maxIter = 1000;
        //Optimised escape time algorithm https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set
        while(dot(coords,coords)<= 4.0 && iter < maxIter)
        {
            coords.y = 2.0* coords.x * coords.y + uv.y;
            coords.x = coords2.x - coords2.y + uv.x;
            coords2 = coords * coords;
            iter++;
        }    
        // Output to screen
        FragColor =  GetColor(uv,float(iter) , float(maxIter));
        FragColor.w = 1.0;
    }`;
  let vsSrc = `#version 300 es
    layout (location = 0) in vec2 Pos;

    void main()
    {
        gl_Position = vec4(Pos,0,0);
    }
    `;
  const prog = initShProg(gl, vsSrc, fsSrc);

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  const posBuff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const info = {
    program: prog,
    attribLocations: {
      vertexPosition: 0,
      iResolution: gl.getUniformLocation(prog, "iResolution"),
      ColNum: gl.getUniformLocation(prog, "ColNum"),
      cols: gl.getUniformLocation(prog, "cols"),
    },
  };

  render();
  function render() {
    gl.useProgram(info.program);
      
    gl.uniform2f(info.attribLocations.iResolution,rect.width,rect.height);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
    gl.vertexAttribPointer(
      info.attribLocations.vertexPosition,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(info.attribLocations.vertexPosition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   // requestAnimationFrame(render);
  }
}


window.onload = main;
