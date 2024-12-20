chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download" && message.trackId) {
    const trackId = message.trackId;
    console.log(`Received track ID ${trackId} for download.`);

    // Fetch the audio data from Soundboard
    fetch(`https://www.soundboard.com/track/${trackId}`)
      .then(response => response.json())
      .then(json => {
        // Check if the JSON response is valid and contains audio data
        if (Array.isArray(json) && json.length > 0) {
          const base64Audio = json[0].data;

          if (base64Audio) {
            // Strip 'data:audio/wav;base64,' if it exists
            const base64Data = base64Audio.includes('base64,') ? base64Audio.split('base64,')[1] : base64Audio;

            // Decode the Base64 string into binary data
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            // Convert the Base64 string to a byte array
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArrays.push(byteCharacters.charCodeAt(i));
            }

            // Create a Blob from the byte array
            const audioBlob = new Blob([new Uint8Array(byteArrays)], { type: 'audio/wav' });

            // Instead of URL.createObjectURL, directly use chrome.downloads.download to download the Blob
            const reader = new FileReader();
            reader.onload = function () {
              // Create a download link for the Blob data
              chrome.downloads.download({
                url: reader.result, // The result is a data URL
                filename: `${trackId}.wav`, // Use trackId as the filename
                saveAs: true, // Prompt the user to save the file
              });

              // Send success response
              sendResponse({ success: true });
            };
            reader.onerror = function (error) {
              console.error("Error reading Blob:", error);
              sendResponse({ success: false, error: `Error reading Blob: ${error}` });
            };

            // Read the Blob as a data URL
            reader.readAsDataURL(audioBlob);
          } else {
            sendResponse({ success: false, error: "No Audio Data Found." });
          }
        } else {
          sendResponse({ success: false, error: "Invalid Track Data" });
        }
      })
      .catch(error => {
        console.error("Error fetching track data:", error);
        sendResponse({ success: false, error: `Unknown Error: ${error.message}` });
      });

    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
