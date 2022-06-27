
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

    out vec4 FragColor;
     
    uniform vec2 iResolution;
    uniform int ColNum;
    uniform vec3 cols[32];
    
    void main()
    {
        FragColor = vec4(1,0,0,1);
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
    requestAnimationFrame(render);
  }
}


window.onload = main;
