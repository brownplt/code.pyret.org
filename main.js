const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const {ipcMain} = require('electron')

let win

function createWindow() {
  let win = new BrowserWindow({ width: 800, height: 600})

  win.loadURL(url.format({
    pathname: path.join(__dirname, './build_experiment/web/views/editor.html'), //./code.pyret.org/build/web/views/editor.html
    protocol: 'file:',
    slashes: true
  }))

  win.webContents.openDevTools()

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  //win.loadFile('./code.pyret.org/build_experiment/web/views/editor.html')//./code.pyret.org/build/web/views/editor.html
}

ipcMain.on('openFile', (event, path) => {
  const {dialog} = require('electron')
  const fs = require('fs')
  dialog.showOpenDialog(function (fileNames) {
    if(fileNames === undefined) {
      console.log("No file selected");
    } else {
      readFile(fileNames[0]);
    }
  });

  function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', (err, data) => {
      if(err){
        alert("An error occurred reading the file:" + err.message)
        return
      }
      event.sender.send('fileData', data)
    })
  }
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
