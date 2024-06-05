import base64

def convert_png_to_base64(image_path):
    # Read the image file in binary mode
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
    
    # Encode the image data to Base64
    base64_encoded_data = base64.b64encode(image_data)
    base64_image = base64_encoded_data.decode('utf-8')
    
    # Format the Base64 string as a data URI
    base64_image_data_uri = f"data:image/png;base64,{base64_image}"
    
    return base64_image_data_uri

# Example usage
image_path = "test.png"  # Replace with your image file path
base64_image_data_uri = convert_png_to_base64(image_path)
print(base64_image_data_uri)

with open('raw.txt', 'w') as f:
    f.write(base64_image_data_uri)
