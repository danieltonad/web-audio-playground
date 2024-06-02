const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const recordingsList = document.getElementById('recordingsList');

let mediaRecorder;
let audioChunks = [];
let audioContext;
let mediaStreamSource;
let processor;
let filter;

recordButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a BiquadFilterNode (e.g., lowpass filter)
    filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);

    // Connect the filter to the destination
    mediaStreamSource.connect(filter);
    filter.connect(audioContext.destination);

    // Create a ScriptProcessorNode to handle the audio processing
    processor = audioContext.createScriptProcessor(1024, 1, 1);
    mediaStreamSource.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer;
        const outputBuffer = e.outputBuffer;

        // Apply the filter to the input buffer
        for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);

            for (let sample = 0; sample < inputBuffer.length; sample++) {
                outputData[sample] = inputData[sample]; // Apply filter logic here
            }
        }
    };

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    recordButton.disabled = true;
    stopButton.disabled = false;

    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.controls = true;

        const li = document.createElement('li');
        li.appendChild(audio);
        recordingsList.appendChild(li);

        audioChunks = [];
    });
});

stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
    processor.disconnect();
    filter.disconnect();
    mediaStreamSource.disconnect();
});




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


function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}