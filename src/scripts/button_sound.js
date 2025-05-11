export function playButtonSound() {
    const context = new window.AudioContext;
    const duration = 0.02;
    const time = context.currentTime;
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;

    const dlcSound = 2;
    for (let i = 0; i < data.length; ++i) {
        data[i] = (Math.random() * 2 - 1) * dlcSound;
    }

    const low_frequencies = context.createBiquadFilter();
    low_frequencies.type = 'highpass';
    low_frequencies.value = 200;

    const high_frequencies = context.createBiquadFilter();
    high_frequencies.type = 'lowpass';
    high_frequencies.value = 1000;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(1.8, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noiseSource.connect(low_frequencies);
    low_frequencies.connect(high_frequencies);
    high_frequencies.connect(gain);
    gain.connect(context.destination);

    noiseSource.start(time);
    noiseSource.start(time + duration);
}

document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('mousedown', playButtonSound);
});