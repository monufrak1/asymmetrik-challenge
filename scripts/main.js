var particleSelector;
var playButton;
var pauseButton;
var sizeSlider;
var sizeText;
var drawPanel;

var canvasWidth = 800;
var canvasHeight = 600;

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
    particleSize = size;
    sizeText.innerText = size;
}

function setParticleType(type) {
    particleType = type;
}

function initWebgl() {
    var canvas = document.createElement("canvas");
    canvas.id = "drawCanvas";
    canvas.setAttribute("width", canvasWidth + "px");
    canvas.setAttribute("height", canvasWidth + "px");

    drawPanel.appendChild(canvas);

    var gl = canvas.getContext("webgl");
    
    if(gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        gl.clearColor(0, 0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } else {
        alert("Webgl not supported. Imagine pretty particles...");
    }
}