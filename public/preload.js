const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel, data) => {
        // whitelist channels
        let validChannels = ['set-timer-notification'];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      invoke: (channel, data) => {
        let validChannels = ['get-data', 'save-data'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, data);
        }
      }
    }
  }
); 