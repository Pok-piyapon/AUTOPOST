const { contextBridge, ipcRenderer } = require('electron');

// Exposing the ipcRenderer API to the renderer in a safe way
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message) => ipcRenderer.send('renderer-to-main', message),
    onReply: (callback) => ipcRenderer.on('main-to-renderer', (event, message) => callback(message)),
    commit:(message)=> ipcRenderer.send('commit',message)
});