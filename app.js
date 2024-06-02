// Get references to the buttons and recordings list
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const recordingsList = document.getElementById('recordingsList');

let mediaRecorder;
let audioChunks = [];

// Event listener for the record button
recordButton.addEventListener('click', async () => {
    // Request permission to access the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create a MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);

    // Start recording
    mediaRecorder.start();

    // Disable the record button and enable the stop button
    recordButton.disabled = true;
    stopButton.disabled = false;

    // Event listener for when the data is available
    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
    });

    // Event listener for when the recording stops
    mediaRecorder.addEventListener('stop', async () => {
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        // Array buffer to blob

        const modifiedBlob = await processAudioBlob(audioBlob)

        const audioUrl = URL.createObjectURL(modifiedBlob);
        // const audioUrl = URL.createObjectURL(audioBlob);

        // Create an audio element and set its source to the audio URL
        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.controls = true;

        // Create a list item and append the audio element to it
        const li = document.createElement('li');
        li.appendChild(audio);

        // Append the list item to the recordings list
        recordingsList.appendChild(li);

        // Reset the audio chunks array
        audioChunks = [];
    });
});

// Event listener for the stop button
stopButton.addEventListener('click', () => {
    // Stop recording
    mediaRecorder.stop();

    // Disable the stop button and enable the record button
    stopButton.disabled = true;
    recordButton.disabled = false;
});



async function processAudioBlob(audioBlob) {
    // Convert the Blob to ArrayBuffer
    const arrayBuffer = await blobToArrayBuffer(audioBlob);

    // Create an AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create a buffer source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Create a low-pass filter
    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.setValueAtTime(1000, audioContext.currentTime); // Set the cutoff frequency to 1000 Hz

    // Connect the source to the filter, and the filter to the destination (speakers)
    source.connect(lowPassFilter);
    lowPassFilter.connect(audioContext.destination);
    
    // Start the source to apply the filter
    source.start();

    // Render the audio with the filter applied
    const renderedBuffer = await audioContext.startRendering();
    
    // Convert the rendered audio buffer back to a Blob
    const modifiedArrayBuffer = renderedBuffer.getChannelData(0).buffer;
    return arrayBufferToBlob(modifiedArrayBuffer, audioBlob.type);

}



// Utility function to convert ArrayBuffer to Blob
function arrayBufferToBlob(buffer, type) {
    return new Blob([buffer], { type: type });
}

// Utility function to convert Blob to ArrayBuffer
function blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}