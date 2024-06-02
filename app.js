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
    mediaRecorder.addEventListener('stop', () => {
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

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
