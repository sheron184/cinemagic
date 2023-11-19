const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const jsonData = require('./handleData');

const { updateElectronApp } = require('update-electron-app')
updateElectronApp();

let win;

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
    win = new BrowserWindow({
        width: 970,
        height: 970,
        webPreferences: {
            preload: path.join(__dirname, './process.js'),
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

// IPCMain handler for opening video file
// Arg is coming from client side
ipcMain.handle('from_web_openfile', async (event, arg) => {
    try {
        // Read from dirs file
        let dirs = await jsonData.readFile('dirs.json');
        const filePath = `${dirs.dirs[0]}/${arg}`;

        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }

});
// IPCMain handler for selecting folder dir
ipcMain.handle('from_web_selectfolder', (event, arg) => {

    return dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(async result => {
        // Get selected folder papth
        let resp = result.filePaths[0];

        if (resp) {
            // Read from dirs file
            let dirs = await jsonData.readFile('dirs');
            // Add new path
            dirs.dirs.unshift(resp);
            // Write to sirs.json
            jsonData.writeFile(dirs, 'dirs');
            // Reload file
            win.loadFile('index.html');

            return resp;
        }

    }).catch(err => {
        console.log(err)
    });

});

