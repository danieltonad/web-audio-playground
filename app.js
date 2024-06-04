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
        const audioBlob = arrayBufferToBlob(audioChunks, mediaRecorder);
        console.log(audioChunks)
        const audioUrl = URL.createObjectURL(audioBlob);
        // const audioB64 = await blobToBase64(audioBlob)
        // console.info("Audio B64"+ audioB64)
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

stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
});


// save blob to file
function arrayBufferToFile(buffer, mediaRecorder) {
    return new File(
        buffer,
        `./my-file.${mediaRecorder.mimeType.match(/\/([\w\d]+);?/)[1]}`,
        { type: mediaRecorder.mimeType }
    );
}


// Utility function to convert ArrayBuffer to Blob
function arrayBufferToBlob(buffer, mediaRecorder) {
    return new Blob(buffer, {type: mediaRecorder.mimeType });
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