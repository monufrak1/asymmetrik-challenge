var particleSelector;
var sizeSlider;
var freqSlider;
var sizeText;
var drawPanel;

var canvasWidth = 800;
var canvasHeight = 600;

var playIconSrc = "assets/play-icon.png";
var pauseIconSrc = "assets/pause-icon.png";

var PARTICLE_TYPE_SNOW = "SNOW";
var PARTICLE_TYPE_RAIN = "RAIN";
var PARTICLE_TYPE_LEAVES = "LEAVES";
var PARTICLE_TYPE_BUGS = "BUGS";

var particleSpeeds = {};
particleSpeeds[PARTICLE_TYPE_SNOW] = 1;
particleSpeeds[PARTICLE_TYPE_RAIN] = 3;
particleSpeeds[PARTICLE_TYPE_LEAVES] = 0.5;
particleSpeeds[PARTICLE_TYPE_BUGS] = 0.5;

var particleScalar = 0.05;
var maxParticleAge = 6.0;

var particleSize;
var particleFreq;
var particleType;

var animationPaused;

function main() {
    var playPauseButton = document.getElementById("playPauseButton");
    sizeSlider = document.getElementById("sizeSlider");
    freqSlider = document.getElementById("freqSlider");
    sizeText = document.getElementById("sizeText");
    drawPanel = document.getElementById("drawPanel");

    playPauseButton.onclick = function() {
        animationPaused = !animationPaused;

        playPauseButton.src = animationPaused ? playIconSrc : pauseIconSrc;
    }

    document.getElementById("particleSelectorSnow").onchange = function() {
        setParticleType(PARTICLE_TYPE_SNOW);
    }

    document.getElementById("particleSelectorRain").onchange = function() {
        setParticleType(PARTICLE_TYPE_RAIN);
    }

    document.getElementById("particleSelectorLeaves").onchange = function() {
        setParticleType(PARTICLE_TYPE_LEAVES);
    }

    document.getElementById("particleSelectorBugs").onchange = function() {
        setParticleType(PARTICLE_TYPE_BUGS);
    }

    sizeSlider.oninput = function() {
        setParticleSize(sizeSlider.value);
    }

    freqSlider.oninput = function() {
        setParticleFreq(freqSlider.value);
    }
    
    animationPaused = false;
    setParticleSize(sizeSlider.value);
    setParticleFreq(freqSlider.value);
    setParticleType(PARTICLE_TYPE_SNOW);

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

function setParticleFreq(freq) {
    particleFreq = 1 / freq;
    freqText.innerText = freq + "/Sec";
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

    var gl = canvas.getContext("experimental-webgl");
    
    if(gl) {
        // Create vertex buffer
        var vertices = [+0.5, -0.5, 0,
                        +0.5, +0.5, 0,
                        -0.5, -0.5, 0,
                        -0.5, +0.5, 0];
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 
        vertexBuffer.itemSize = 3;
        vertexBuffer.numItems = 4;

        // Create texture coordinates
        var texCoords = [1, 1,
                         1, 0,
                         0, 1,
                         0, 0];
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        texCoordBuffer.itemSize = 2;
        texCoordBuffer.numItems = 4;
        
        var vertexShaderSource =
            'attribute vec3 a_position;' +
            'attribute vec2 a_texCoord;' +
            'uniform float u_scale;' +
            'uniform mat4 u_translation;' +
            'varying highp vec2 texCoord;' +
            'void main() {' +
            '   vec3 pos = a_position;' +
            '   pos *= u_scale;' +
            '   gl_Position = u_translation * vec4(pos, 1);' +
            '   texCoord = a_texCoord;' +
            '}';

        var fragmentShaderSource =
            'precision mediump float;' +
            'varying highp vec2 texCoord;' +
            'uniform sampler2D u_sampler;' +
            'void main() {' +
            '   vec4 sample = texture2D(u_sampler, texCoord);' +
            '   if(sample.a < 0.5)' +
            '       discard;' +
            '   gl_FragColor = sample;' +
            '}';
        
        function buildTranslationMatrix(x, y) {
            return [1,0,0,0,
                    0,1,0,0,
                    0,0,1,0,
                    x,y,0,1];  
        }

        function buildOscillatingMatrix(x, y, speed, multiplier) {
            return buildTranslationMatrix(x + Math.cos(y * speed) * multiplier, y);
        }

        function buildSpinningMatrix(x, y, speed, multiplier) {
            return buildTranslationMatrix(x + Math.sin(y * speed) * multiplier, y + Math.cos(y * speed) * multiplier);
        }

        function createTexture(src) {
            var texture = gl.createTexture();
            var image = new Image();
            image.onload = function() { handleTextureLoaded(image, texture); }
            image.src = src;

            function handleTextureLoaded(imageElement, glTexture) {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageElement);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            return texture;
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
        var texCoordVarLoc = gl.getAttribLocation(program, "a_texCoord");
        var scaleVarLoc = gl.getUniformLocation(program, "u_scale");
        var translationVarLoc = gl.getUniformLocation(program, "u_translation");
        var samplerVarLoc = gl.getUniformLocation(program, "u_sampler");

        // Init shaders
        gl.enableVertexAttribArray(positionVarLoc);
        gl.enableVertexAttribArray(texCoordVarLoc);
        gl.uniform1f(scaleVarLoc, particleSize);
        gl.uniform1i(samplerVarLoc, 0);

        // Set viewport and clear color
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clearColor(0.75, 0.75, 0.75, 1.0);

        // Create textures for all particle types
        var particleTextures = {};
        particleTextures[PARTICLE_TYPE_SNOW] = createTexture("assets/snowflake.png");
        particleTextures[PARTICLE_TYPE_RAIN] = createTexture("assets/raindrop.png");
        particleTextures[PARTICLE_TYPE_LEAVES] = createTexture("assets/leaf.png");
        particleTextures[PARTICLE_TYPE_BUGS] = createTexture("assets/bug.png");

        var particles = [];
        var elapsedTime = 0;
        var prevTime = 0;
        var spawnTime = 0;

        // Main render 'loop' function
        function draw () {
            var currTime = getCurrTime();
            var deltaTime = currTime - prevTime;
            prevTime = currTime;

            if(!animationPaused) {
                elapsedTime += deltaTime;

                // Clear back buffer
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Spawn new particles
                var particleSpawnY = 1.0 + particleSize;
                if(elapsedTime - spawnTime >= particleFreq) {
                    // Spawn new particle
                    particles.push({
                        posX: (Math.random() * 2) - 1,      // Random X position within view window
                        posY: particleSpawnY,               
                        velX: 0.1,
                        velY: -1,
                        age: 0.0,
                        rand: Math.random(),
                        texture: particleTextures[particleType],
                        type: particleType,
                        size: particleSize,
                        speed: particleSpeeds[particleType]
                    });

                    spawnTime = elapsedTime;
                }

                // Update and active draw particles
                particles.forEach(function(particle, index) {
                    // Update particle age
                    particle.age += deltaTime;

                    if(particle.age <= maxParticleAge) {
                        // Create translation matrix
                        var transMatrix;
                        var curPosX = particle.posX + (particle.velX * particle.age * particle.speed);
                        var curPosY = particle.posY + (particle.velY * particle.age * particle.speed);

                        // Define particle specific behavior
                        if(particle.type === PARTICLE_TYPE_SNOW) {
                            // Fall with random sway along X axis
                            transMatrix = buildOscillatingMatrix(curPosX, curPosY, particle.rand*5.0, 0.1);
                        } else if(particle.type === PARTICLE_TYPE_RAIN) {
                            // Fall at a constant rate following default velocity
                            transMatrix = buildTranslationMatrix(curPosX, curPosY);
                        } else if(particle.type === PARTICLE_TYPE_LEAVES) {
                            // Fall with random sway with random length along X axis 
                            transMatrix = buildOscillatingMatrix(curPosX, curPosY, particle.rand*5.0, particle.rand*0.2);
                        } else if(particle.type === PARTICLE_TYPE_BUGS) {
                            // Fall with random circles along X and Y axes
                            transMatrix = buildSpinningMatrix(curPosX, curPosY, particle.rand*20, particle.rand*0.1);
                        } else {
                            transMatrix = buildTranslationMatrix(curPosX, curPosY);
                        }

                        gl.uniformMatrix4fv(translationVarLoc, false, new Float32Array(transMatrix));

                        // Set particle size
                        gl.uniform1f(scaleVarLoc, particle.size);

                        // Apply texture
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, particle.texture);

                        // Draw vertices
                        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                        gl.vertexAttribPointer(positionVarLoc, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

                        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                        gl.vertexAttribPointer(texCoordVarLoc, texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

                        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
                    } else {
                        // Destroy particle
                        particles.splice(index, 1);
                    }
                });
            }
        
            window.requestAnimationFrame(draw);
        }
        
        // Kick off render loop
        draw();
    } else {
        alert("Webgl not supported. Imagine pretty particles...");
    }
}