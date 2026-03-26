ticklishscreen p5.js conversion

Files:
- index.html
- sketch.js
- samples/   (put your .wav files here)

Setup:
1. Put your .wav files into the samples folder.
2. Open sketch.js.
3. Add each file to the sampleFiles array, for example:

const sampleFiles = [
  "samples/sample1.wav",
  "samples/sample2.wav",
  "samples/sample3.wav"
];

4. Open index.html in a local web server.

Notes:
- Browsers require a user click before audio can start.
- p5.js in the browser cannot automatically scan a folder for audio files,
  so the filenames must be listed manually.
