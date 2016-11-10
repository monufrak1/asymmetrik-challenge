var particleSelector;
var playButton;
var pauseButton;
var sizeSlider;
var sizeText;
var drawPanel;

var canvasWidth = 800;
var canvasHeight = 600;

var particleScalar = 0.05;

var particleSize;
var particleType;

function main() {
    playButton = document.getElementById("playButton");
    pauseButton = document.getElementById("pauseButton");
    sizeSlider = document.getElementById("sizeSlider");
    sizeText = document.getElementById("sizeText");
    drawPanel = document.getElementById("drawPanel");

    playButton.onclick = function() {
        toggleControlButtons();

        // Play animations

    }

    pauseButton.onclick = function() {
        toggleControlButtons();

        // Pause animations

    }

    document.getElementById("particleSelectorSnow").onchange = function() {
        setParticleType(document.getElementById("particleSelectorSnow").value);
    }

    document.getElementById("particleSelectorRain").onchange = function() {
        setParticleType(document.getElementById("particleSelectorRain").value);
    }

    document.getElementById("particleSelectorLeaves").onchange = function() {
        setParticleType(document.getElementById("particleSelectorLeaves").value);
    }

    document.getElementById("particleSelectorBugs").onchange = function() {
        setParticleType(document.getElementById("particleSelectorBugs").value);
    }

    sizeSlider.oninput = function() {
        setParticleSize(sizeSlider.value);
    }
    
    playButton.disabled = true;
    pauseButton.disabled = false;
    setParticleSize(1);

    initWebgl();
}

function toggleControlButtons() {
    playButton.disabled = !playButton.disabled;
    pauseButton.disabled = !pauseButton.disabled;
}

function setParticleSize(size) {
    particleSize = size * particleScalar;
    sizeText.innerText = size;
}

function setParticleType(type) {
    particleType = type;
}

function initWebgl() {
    drawPanel.innerHTML = "";

    var canvas = document.createElement("canvas");
    canvas.id = "drawCanvas";
    canvas.setAttribute("width", canvasWidth + "px");
    canvas.setAttribute("height", canvasHeight + "px");

    drawPanel.appendChild(canvas);

    var gl = canvas.getContext("webgl");
    
    if(gl) {
        var vertices = [+0.5, -0.5, 0,
                        +0.5, +0.5, 0,
                        -0.5, -0.5, 0,
                        -0.5, +0.5, 0];

        // Create vertex buffer
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 
        vertexBuffer.itemSize = 3;
        vertexBuffer.numItems = 4;
        
        var vertexShaderSource =
            'attribute vec3 a_position;' +
            'uniform float u_scale;' +
            'uniform mat4 u_translation;' +
            'void main() {' +
            '   vec3 pos = a_position;' +
            '   pos *= u_scale;' +
            '   gl_Position = u_translation * vec4(pos, 1);' +
            '}';
        var fragmentShaderSource =
            'precision mediump float;' +
            'void main() {' +
            '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1);' +
            '}';
        
        function buildTranslationMatrix(x, y) {
            return [1,0,0,0,
                    0,1,0,0,
                    0,0,1,0,
                    x,y,0,1];  
        }

        function getCurrTime () {
            return Date.now() * 0.001;
        }
        
        var buildShader = function (shaderSource, shaderType) {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert (gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
            }
            return shader;
        }
        
        // Compile shaders
        var compiledVertexShader = buildShader(vertexShaderSource, gl.VERTEX_SHADER);
        var compiledFragmentShader = buildShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        
        // Create GLSL program
        var program = gl.createProgram();
        gl.attachShader(program,compiledVertexShader);
        gl.attachShader(program,compiledFragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        
        // Get references to shader variables
        var positionVarLoc = gl.getAttribLocation(program, "a_position");
        var scaleVarLoc = gl.getUniformLocation(program, "u_scale");
        var translationVarLoc = gl.getUniformLocation(program, "u_translation");

        // Enable shaders
        gl.enableVertexAttribArray(positionVarLoc);
        gl.vertexAttribPointer(positionVarLoc, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.uniform1f(scaleVarLoc, particleSize);

        // Set viewport and clear color
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clearColor(0, 0, 0, 1.0);

        var particles = [];
        var elapsedTime = 0;
        var prevTime = 0;
        var spawnTime = 0;

        var particleSpeed = 1;
        var particleFreqInSecs = 0.5;

        var particleSpawnY = 1.0;
        var maxParticleAge = 3.0;

        // Main render 'loop' function
        function draw () {
            var currTime = getCurrTime();
            var deltaTime = currTime - prevTime;
            elapsedTime += deltaTime;
            prevTime = currTime;

            // Clear back buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Spawn new particles
            if(elapsedTime - spawnTime >= particleFreqInSecs) {
                // Spawn new particle
                particles.push({
                    posX: (Math.random() * 2) - 1,
                    posY: particleSpawnY,
                    velX: 0.1,
                    velY: -1,
                    age: 0.0,
                    rand: Math.random()
                });

                spawnTime = elapsedTime;
            }

            // Draw particles
            particles.forEach(function(particle, index) {
                // Update particle age
                particle.age += deltaTime;

                if(particle.age <= maxParticleAge) {
                    // Create translation matrix
                    var transMatrix = buildTranslationMatrix(particle.posX + particle.velX*particleSpeed*particle.age, particle.posY + particle.velY*particleSpeed*particle.age);
                    
                    // Draw vertices
                    gl.uniformMatrix4fv(translationVarLoc, false, new Float32Array(transMatrix));
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
                } else {
                    // Destroy particle
                    particles.splice(index, 1);
                }
            });
        
            window.requestAnimationFrame(draw);
        }
        
        // Kick off render loop
        draw();
    } else {
        alert("Webgl not supported. Imagine pretty particles...");
    }
}