// ticklishscreen - p5.js conversion of the original Processing sketch
// Requires p5.js and p5.sound.
// Put your .wav files in the ./samples folder and list them below.

let sampleFiles = [
  "samples/laugh1.wav",
  "samples/laugh2.wav",
  "samples/laugh3.wav",
  "samples/laugh4.wav",
  "samples/laugh5.wav",
  "samples/laugh6.wav",
  "samples/laugh7.wav",
  "samples/laugh8.wav",
  "samples/laugh9.wav",
  "samples/laugh10.wav",
  "samples/laugh11.wav",
  "samples/laugh12.wav",
  "samples/laugh13.wav",
  "samples/laugh14.wav",
  "samples/laugh15.wav",
  "samples/laugh16.wav"
];

let forwardSounds = [];
let reverseBuffers = [];

let xChange = 0;
let yChange = 0;
let lastMouseX = 0;
let lastMouseY = 0;

let numSamples = 0;
let sampleWidth = 0;
let audioStarted = false;

let masterGain;
let dryGain;
let wetGain;
let delayNode;
let feedbackGain;

function preload() {
  numSamples = sampleFiles.length;
  for (let i = 0; i < sampleFiles.length; i++) {
    forwardSounds[i] = loadSound(sampleFiles[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  fill(255);
  textSize(20);

  numSamples = sampleFiles.length;
  sampleWidth = numSamples > 0 ? width / numSamples : width;

  setupAudioGraph();
  buildReverseBuffers();
}

function draw() {
  background(0);
  fill(255);

  if (numSamples <= 0) {
    text('No samples listed yet.', 100, 100);
    text('Add your .wav files to the samples folder and list them in sampleFiles in sketch.js.', 100, 130);
    text('Then reload the page.', 100, 160);
    return;
  }

  text('Click once to enable audio.', 100, 90);
  text('Move the mouse quickly to trigger playback.', 100, 120);
  text('Faster movement will trigger more and louder sounds.', 100, 150);
  text('Moving upward can trigger reverse playback.', 100, 180);

  if (!audioStarted) {
    return;
  }

  xChange = abs(lastMouseX - mouseX);
  yChange = lastMouseY - mouseY;
  lastMouseX = mouseX;
  lastMouseY = mouseY;

  let newGain = (abs(yChange) + xChange) / width;
  newGain = constrain(newGain, 0, 1);

  const pitchRange = yChange / 200.0;

  if (newGain > 0.09) {
    let currentSampleIndex = floor(mouseX / sampleWidth);
    currentSampleIndex = constrain(currentSampleIndex, 0, numSamples - 1);
    triggerSample(currentSampleIndex, yChange < 0, newGain, pitchRange);
  }

  for (let currentSample = 0; currentSample < numSamples; currentSample++) {
    if (random(1) < newGain / 2.0) {
      triggerSample(
        currentSample,
        yChange < 0 && random(1) < 0.33,
        newGain,
        pitchRange
      );
    }
  }
}

function mousePressed() {
  userStartAudio();
  const ctx = getAudioContext();
  if (ctx.state !== 'running') {
    ctx.resume();
  }
  audioStarted = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sampleWidth = numSamples > 0 ? width / numSamples : width;
}

function setupAudioGraph() {
  const ctx = getAudioContext();

  masterGain = ctx.createGain();
  dryGain = ctx.createGain();
  wetGain = ctx.createGain();
  delayNode = ctx.createDelay(2.0);
  feedbackGain = ctx.createGain();

  delayNode.delayTime.value = 0.2;
  feedbackGain.gain.value = 0.15;

  dryGain.connect(masterGain);
  wetGain.connect(delayNode);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  delayNode.connect(masterGain);
  masterGain.connect(ctx.destination);
}

function buildReverseBuffers() {
  const ctx = getAudioContext();

  reverseBuffers = forwardSounds.map((soundFile) => {
    const src = soundFile && soundFile.buffer;
    if (!src) {
      return null;
    }

    const reversed = ctx.createBuffer(
      src.numberOfChannels,
      src.length,
      src.sampleRate
    );

    for (let ch = 0; ch < src.numberOfChannels; ch++) {
      const input = src.getChannelData(ch);
      const output = reversed.getChannelData(ch);
      for (let i = 0, j = input.length - 1; i < input.length; i++, j--) {
        output[i] = input[j];
      }
    }

    return reversed;
  });
}

function triggerSample(index, reverse, newGain, pitchRange) {
  if (index < 0 || index >= numSamples) {
    return;
  }

  const ctx = getAudioContext();
  const buffer = reverse ? reverseBuffers[index] : forwardSounds[index].buffer;
  if (!buffer) {
    return;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const low = max(0.01, 1.0 - pitchRange);
  const high = max(0.01, 1.0 + pitchRange);
  const minRate = min(low, high);
  const maxRate = max(low, high);
  source.playbackRate.value = random(minRate, maxRate);

  const gainNode = ctx.createGain();
  gainNode.gain.value = newGain;

  source.connect(gainNode);
  gainNode.connect(dryGain);
  gainNode.connect(wetGain);

  source.start();
}
