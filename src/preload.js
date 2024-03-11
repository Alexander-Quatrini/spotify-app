const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
          // whitelist channels
          let validChannels = ["callAPI", "saveData", "saveDataSTATS"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      receive: (channel, func) => {
          let validChannels = ["receiveAPI", "receiveUser", "receiveQueue", "receiveLibrary", "receiveCurrentlyPlaying"];
          if (validChannels.includes(channel) && ipcRenderer.rawListeners(channel) == 0) {
              // Deliberately strip event as it includes `sender` 
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          } else {
            console.log('Channel: ' + channel + ' is either invalid, or already has a listener!');
          }
      }
  }
);