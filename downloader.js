module.exports = {
    async downloadTrack(trackId) {
        try {
            // Fetch the track data from Soundboard
            const response = await fetch(`https://www.soundboard.com/track/${trackId}`);
            const json = await response.json();
    
            // Check if the JSON response is valid and contains audio data
            if (Array.isArray(json) && json.length > 0) {
                const base64Audio = json[0].data;
                
                if (base64Audio) {
                    // Decode the Base64 string to a binary Blob
                    const byteCharacters = atob(base64Audio.split(',')[1]); // Split in case there's a data URL prefix
                    const byteArrays = [];
                    
                    // Convert the Base64 string into a byte array
                    for (let offset = 0; offset < byteCharacters.length; offset++) {
                        byteArrays.push(byteCharacters.charCodeAt(offset));
                    }

                    const audioBlob = new Blob([new Uint8Array(byteArrays)], { type: "audio/wav" });

                    // Create an Object URL for the Blob (used in the downloads API)
                    const url = URL.createObjectURL(audioBlob);
    
                    // Initiate the download using Chrome's downloads API
                    chrome.downloads.download({
                        url: url,
                        filename: `${trackId}.wav`, // Set the filename based on trackId
                        saveAs: true, // Prompt the user to save
                    });

                    return { success: true };
                } else {
                    return { success: false, error: "No Audio Data Found." };
                }
            } else {
                return { success: false, error: "Invalid Track Data" };
            }
        } catch (error) {
            return { success: false, error: `Unknown Error: ${error.message}` };
        }
    }
};
