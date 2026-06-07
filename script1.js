function toggleSystemAudio() {
    const audio = document.getElementById('core-bg-sound');
    const controller = document.querySelector('.audio-hardware-controller');
    const btnIcon = document.querySelector('.audio-icon');

    if (audio.paused) {
        audio.play().then(() => {
            controller.classList.add('audio-active');
            btnIcon.textContent = '█'; // Stop / Pause symbol representation
        }).catch(err => console.log("Core Hardware Audio waiting for user interaction matrix unlock."));
    } else {
        audio.pause();
        controller.classList.remove('audio-active');
        btnIcon.textContent = '▶';
    }
}

function adjustSystemVolume(val) {
    const audio = document.getElementById('core-bg-sound');
    if (audio) {
        audio.volume = val / 100;
    }
} 
