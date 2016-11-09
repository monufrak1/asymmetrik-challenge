var playButton;
var pauseButton;
var sizeSlider;
var sizeText;
var drawPanel;

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

    sizeSlider.oninput = function() {
        updateSliderText();
    }

    
    playButton.disabled = false;
    pauseButton.disabled = true;
    updateSliderText();

    initWebgl();
}

function toggleControlButtons() {
    playButton.disabled = !playButton.disabled;
    pauseButton.disabled = !pauseButton.disabled;
}

function updateSliderText() {
    sizeText.innerText = sizeSlider.value;
}

function initWebgl() {

}