const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const DataStroe = require('./renderer/MusicDataStore');
const myStore = new DataStroe({
    'name': 'Music Data'
})
class AppWindow extends BrowserWindow {
    constructor(config, fileLocation) {
        const basicConfig = {
            width: 500,
            height: 800,
            webPreferences: {
                nodeIntegration: true
            }
        };
        const finalConfig = { ...basicConfig, ...config }; // <===>const finalConfig = Object.assign(basicConfig, config);
        super(finalConfig);
        this.loadFile(fileLocation);
        this.once('ready-to-show', () => {
            this.show();
        });
    }
}

app.on('ready', () => {
    const mainWindow = new AppWindow({}, './renderer/index.html');
    mainWindow.webContents.on('did-finish-load', () => {
        // console.log('page load')
        mainWindow.send('getTracks', myStore.getTracks());
    })
    ipcMain.on('add-music-window', () => {
        const addWindow = new AppWindow({
            width: 500,
            height: 600,
            parent: mainWindow,
        }, './renderer/add.html');
    });
    ipcMain.on('add-tracks', (event, tracks) => {
        // console.log(tracks);
        const updatedTracks = myStore.addTracks(tracks).getTracks();
        console.log(updatedTracks);
        mainWindow.send('getTracks', updatedTracks);
    });
    ipcMain.on('delete-track', (event, id) => {
        const updatedTracks = myStore.deleteTrack(id).getTracks();
        mainWindow.send('getTracks', updatedTracks);
    })
    ipcMain.on('open-music-file', (event) => {
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{
                name: 'Music',
                extensions: ['mp3']
            }],
        }).then(result => {
            console.log(result)
            if (result.filePaths) {
                event.sender.send('selected-file', result.filePaths);
            }
        }).catch(err => {
            console.log(err)
        });
        // console.log('打开本地资源文件')
    });
    // mainWindow.on('closed', function() {
    //     mainWindow = null;
    // });
});
app.allowRendererProcessReuse = true;