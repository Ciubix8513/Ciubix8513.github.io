
function loadFromFile(fileN)
{
    let file = "";
    fetch("http://localhost" + fileN).then(response => response.text()).then((data) => file = data);
    return file;
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
function main()
{
    const canvas = document.querySelector("#glCanvas");
    const gl = canvas.getContext("webgl2");

    const rect = canvas.getBoundingClientRect();
    if(gl === null){
        alert("Srry m8 yo pc not supported");
        return;
    }
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let fsSrc =`#version 300 es
    precision highp float;   

    out vec4 FragColor;

    uniform data
    {
        vec2 iResolution;
        int ColNum;
        vec3 cols[32];
    };
    
    vec3 getCol(float c)
    {
        float coord = c / iResolution.y;    
        vec3[] cols1 =vec3[] (vec3(85,205,252),vec3(247,168,184),vec3(255),vec3(247,168,184),vec3(85,205,252));//Trans rights!
        //int ColNum = 5;    
        if(ColNum == 1) //Better safe than sorry
            return  cols[0];
        if(ColNum ==2)
            return mix(cols[0],cols[1],coord);
                
        float cstep = 1.0 /float(ColNum );
        
        for(int i  = 1; i < ColNum + 1; i++)
        {
            if(coord > cstep * float(i-1 )
            && coord < cstep*float(i))        
                return cols[int(mod(float(i-1),5.))]; // 255.;//Incase number of stripes is bigger than the array
        }    
        return vec3(0);
    }
    

    void main()
    {
        FragColor =// vec4(gl_FragCoord.y / iResolution.y);
        FragColor = vec4(getCol(gl_FragCoord.y).xyz,1.0);
    }`;
    let vsSrc =`#version 300 es
    layout (location = 0) in vec2 Pos;

    void main()
    {
        gl_Position = vec4(Pos,0,0);
    }
    `;    
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

    const blockInd = gl.getUniformBlockIndex(info.program,"data");
    const blockSize = gl.getActiveUniformBlockParameter(info.program,blockInd,gl.UNIFORM_BLOCK_DATA_SIZE);

    const ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER,ubo);
    gl.bufferData(gl.UNIFORM_BUFFER,blockSize,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER,null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER,0,ubo);

    const uboVariableNames = ["iResolution","ColNum","cols"];
    const uboVariableIndecies =gl.getUniformIndices(info.program,uboVariableNames);
    const uboVarOffset =gl.getActiveUniforms(info.program,uboVariableIndecies,gl.UNIFORM_OFFSET) //gl.getActiveUniforms(info.program, uboVariableIndecies,gl.UNIFORM_OFFSET);

    const uboVarInfo = {};

    uboVariableNames.forEach((name,index)=>
    {
        uboVarInfo[name] = 
        {
            index: uboVariableIndecies[index],
            offset: uboVarOffset[index],
        };
    });

    //render(gl,info,posBuff);
    //document.querySelector("#renderBtn").onclick = ()=>{ render(gl,info,posBuff,ubo,uboVarInfo)};
    render()
    function render()//gl, info, posBuff,ubo,uboVarInfo)
    {
    const par = document.getElementById("List");
    const ColArr = new Array();
    //I could not make offsets work soooo this is a workaround
 /*   ColArr.push(0);
    ColArr.push(0);
    ColArr.push(0);
    ColArr.push(0);*/
    Array.from(par.children).forEach(element =>{
        const col = hexToRgb(element.firstChild.value);
        ColArr.push( col.r/ 255.0) ;
        ColArr.push( col.g/ 255.0) ;
        ColArr.push( col.b/ 255.0);        
    });
    const sLen = ColArr.length;
    //for(let i = 0; i < 128 - sLen; i++)ColArr.push(0.0);
    
    

    gl.bindBuffer(gl.UNIFORM_BUFFER,ubo);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array( [rect.width,rect.height]),0 );
    gl.bufferSubData(gl.UNIFORM_BUFFER, 8, new Int32Array( [par.children.length]),0 );
    gl.bufferSubData(gl.UNIFORM_BUFFER,24, new Float32Array(ColArr),0 );
    gl.bindBuffer(gl.UNIFORM_BUFFER,null);


    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER,posBuff);
    gl.vertexAttribPointer(info.attribLocations.vertexPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(info.attribLocations.vertexPosition);
    gl.useProgram(info.program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
    }
    //document.getElementById("glCanvas").onrender
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
    if(document.getElementById("List").children.length >= 32)
        return;
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