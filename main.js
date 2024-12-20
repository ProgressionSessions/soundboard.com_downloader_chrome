document.querySelectorAll('div[data-id^="item-"]').forEach(trackElement => {
  const button = document.createElement("button");
  button.textContent = "Download";
  button.style.marginLeft = "10px";
  button.style.padding = "5px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    const trackId = trackElement.getAttribute("data-src");
    if (trackId) {
      console.log(`Sending track ID ${trackId} to background script.`); // Logging here
      chrome.runtime.sendMessage({ action: "download", trackId: trackId }, response => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError.message);
        } else {
          console.log("Message sent successfully to background script.");
          if (response && response.success) {
            console.log(`Track ${trackId} download initiated successfully.`);
          } else {
            console.error("Failed to initiate download.");
          }
        }
      });
    } else {
      console.error("Track ID not found in data-src attribute.");
    }
  });

  trackElement.appendChild(button);
});
