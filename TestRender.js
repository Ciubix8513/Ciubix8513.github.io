
function loadFromFile(fileN)
{
    let file = "";
    fetch("http://localhost" + fileN).then(response => response.text()).then((data) => file = data);
    return file;
}

function loadShader(gl,type,source)
{
    const sh = gl.createShader(type);
    gl.shaderSource(sh,source);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))
    {
        alert(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}

function initShProg(gl,vsSource,fsSource)
{
    const vS = loadShader(gl,gl.VERTEX_SHADER,vsSource);
    const fS = loadShader(gl,gl.FRAGMENT_SHADER,fsSource);

    const sh = gl.createProgram();

    gl.attachShader(sh, vS);
    gl.attachShader(sh, fS);
    gl.linkProgram(sh);

    if(!gl.getProgramParameter(sh,gl.LINK_STATUS))
    {
        alert(gl.getProgramInfoLog(sh));
        return null;        
    }
    return sh;
}

function render(gl, info, buffer)
{
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.vertexAttribPointer(info.attribLocations.vertexPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(info.attribLocations.vertexPosition);
    gl.useProgram(info.program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}



function main()
{
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl");

    const rect = canvas.getBoundingClientRect();

    if(gl === null){
        alert("Srry m8 yo pc not supported");
        return;
    }
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let fsSrc ="void main(){gl_FragColor = vec4(0.95,0.76,0.86,1.0);}";
    let vsSrc ="attribute vec2 Pos;\nvoid main(){gl_Position = vec4(Pos,0,0);}";    
    const prog = initShProg(gl,vsSrc,fsSrc);

    const positions = [1.0,1.0,-1.0,1.0,1.0,-1.0,-1.0,-1.0];
    const posBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW);

    const info = {
        program : prog,
        attribLocations: {
            vertexPosition: 0,
            iResPos: gl.getUniformLocation(prog, "iResolution"),
            iMousePos: gl.getUniformLocation(prog, "iMouse"),
            zoomPos: gl.getUniformLocation(prog, "zoom"),
            arrLengthPos: gl.getUniformLocation(prog, "arrLength"),
            cFractalPos: gl.getUniformLocation(prog, "cFractal"),
            maxIterPos: gl.getUniformLocation(prog, "maxIteration"),
            colorNumPos: gl.getUniformLocation(prog, "colorNum"),
            MSAAPos: gl.getUniformLocation(prog, "MSAA")
        }
    };
    //render(gl,info,posBuff);
    document.querySelector("#renderBtn").onclick = ()=>{ render(gl,info,posBuff)};
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
function newEl()
{
    const li = document.createElement("li");    
    const b = document.createElement("input")
    b.type="color";
    b.value="#FFFFFF"
    li.className = "element";

    li.appendChild(b);    
    document.getElementById("List").appendChild(li);
}
function clearLi()
{
   const par = document.getElementById("List");
   while(par.firstChild)
   par.removeChild(par.lastChild);
   
}

window.onload = main;