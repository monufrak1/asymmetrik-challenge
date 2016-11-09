var particleSelector;
var playButton;
var pauseButton;
var sizeSlider;
var sizeText;
var drawPanel;

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

}