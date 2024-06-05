from pydub import AudioSegment
from pydub.playback import play
import numpy as np
import wave
import struct

def change_to_robotic(input_file, output_file):
    # Load audio file
    audio = AudioSegment.from_file(input_file)
    
    # Convert to raw audio data
    samples = np.array(audio.get_array_of_samples())

    # Parameters
    sample_rate = audio.frame_rate
    duration = len(samples) / sample_rate
    freq = 10  # Frequency of the carrier wave
    
    # Create carrier wave (square wave for robotic effect)
    t = np.linspace(0, duration, len(samples), endpoint=False)
    carrier = 0.5 * np.sign(np.sin(2 * np.pi * freq * t))  # Square wave

    # Modulate the original audio with the carrier wave
    modulated_samples = samples * carrier

    # Normalize the modulated samples
    modulated_samples = np.int16(modulated_samples / np.max(np.abs(modulated_samples)) * 32767)
    
    # Create a new audio segment with the modulated samples
    modulated_audio = audio._spawn(modulated_samples.tobytes())
    
    # Export the modified audio
    modulated_audio.export(output_file, format="wav")

# Input and output files
input_file = "./test.wav"
output_file = "output_robotic.wav"

# Apply robotic effect
change_to_robotic(input_file, output_file)
