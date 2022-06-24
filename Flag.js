let capture = false;

function loadFromFile(fileN) {
  let file = "";
  fetch("http://localhost" + fileN)
    .then((response) => response.text())
    .then((data) => (file = data));
  return file;
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

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
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl2");
  document.getElementById("capture").onclick = () => (capture = true);
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
    
    vec3 getCol(float c)
    {
        
        float coord = c / iResolution.y;
        if(ColNum == 1) 
            return  cols[0];
        if(ColNum ==2)
         return coord < .5? cols[0]:cols[1];
        float cstep = 1.0 / float(ColNum);
        for(int i  = 1; i < ColNum + 1; i++)        
            if(coord > cstep * float(i-1 )&& coord < cstep*float(i))        
                return cols[int(mod(float(i-1),float(ColNum)))];    
        return vec3(0);
    }
    

    void main()
    {
        FragColor =// vec4(gl_FragCoord.y / iResolution.y);
        FragColor = vec4(getCol(gl_FragCoord.y),1.0);
        //FragColor =vec4( cols[],1.0);
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
    const par = document.getElementById("List");
    const ColArr = new Array();

    Array.from(par.children)
      .reverse()
      .forEach((element) => {
        const col = hexToRgb(element.firstChild.value);
        ColArr.push(col.r / 255.0);
        ColArr.push(col.g / 255.0);
        ColArr.push(col.b / 255.0);
      });

    gl.useProgram(info.program);

    gl.uniform2f(info.attribLocations.iResolution, rect.width, rect.height);
    gl.uniform1i(info.attribLocations.ColNum, ColArr.length / 3);
    gl.uniform3fv(info.attribLocations.cols, new Float32Array(ColArr));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

    if (capture) {
      capture = false;
      const data = canvas.toDataURL();

      window.open(data);
    }
    requestAnimationFrame(render);
  }
}
function SlScript(slId, inId) {
  document.getElementById(inId).value = document.getElementById(slId).value;
}
function InScript(slId, inId, minVal, maxVal) {
  let val = document.getElementById(inId).value;
  val = Math.min(Math.max(val, minVal), maxVal);
  document.getElementById(inId).value = val;
  document.getElementById(slId).value = val;
}
function newEl() {
  if (document.getElementById("List").children.length >= 32) return;
  //const li = document.createElement("li");
  const b = document.createElement("input");
  const div = document.createElement("div");
  b.type = "color";
  b.value = "#FFFFFF";
  div.appendChild(b);
  div.appendChild(document.createElement("br"));
  div.className = "items";
  //li.className = "element";

  //li.appendChild(b);
  document.getElementById("List").appendChild(div);
}
function clearLi() {
  const par = document.getElementById("List");
  while (par.firstChild) par.removeChild(par.lastChild);
}

window.onload = main;
