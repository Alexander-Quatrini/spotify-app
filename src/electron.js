const { app, BrowserWindow, protocol, shell, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const url = require("url");
const AuthService = require ("./services/auth-service");
const os = require("os");
const { channels } = require('./shared/constants');
const { error } = require("console");
const { CONNREFUSED } = require("dns");


const user = os.userInfo().username;

let mainWindow

if (process.defaultApp) {
  if(process.argv.length >= 2){
    app.setAsDefaultProtocolClient('nuclear-spotify', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('nuclear-spotify');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // the commandLine is array of strings in which last element is deep link url
    AuthService.storeAuthCredentials(user, commandLine.pop());
    mainWindow.loadURL('http://localhost:3000/dashboard');
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
}

app.on('open-url', (event, url) => {
  AuthService.storeAuthCredentials(user, url);
  mainWindow.loadURL('http://localhost:3000/dashboard');
})

// Create the native browser window.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    icon: "icon.png",
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return{ action: 'deny'}
  })
 
  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000/login";
  mainWindow.loadURL(appURL);
 
  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}
 
// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).


// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    AuthService.deleteAuthCredentials(user);
    app.quit();
  }
});
 
// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
// const allowedNavigationDestinations = "https://my-electron-app.com";
// app.on("web-contents-created", (event, contents) => {
//   contents.on("will-navigate", (event, navigationUrl) => {
//     const parsedUrl = new URL(navigationUrl);
 
//     if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
//       event.preventDefault();
//     }
//   });
// });
 
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on(channels.CALL_API, (event, arg) => {

  let options = {}

  AuthService.getAccessToken(user, (accessToken) => {
    options = {
      method: arg.method,
      headers: {'Authorization' : 'Bearer ' + accessToken},
      ...(arg.isBody == true ? {body: arg.body} : {}),
    }

    fetch('http://localhost:5000' + arg.url + '?' + new URLSearchParams(arg.params) , options).then((response) =>{
      
      if(response.ok){
        response.json().then(responseJson => {
          event.sender.send(arg.channel, responseJson);
        })
      }
      else{
        switch (response.status) {
          case 401:
          case 403:
            AuthService.deleteAuthCredentials(user).then(value => {
              mainWindow.loadURL('http://localhost:3000/login');
            });
            break;
          case 429:
            event.sender.send(channels.RATE_LIMIT_EXCEEDED, arg.url)
            break;
          default:
            event.sender.send(channels.UNKNOWN_ERROR)
            break;
        }
      }
    })
  })

});

ipcMain.on(channels.SAVE_DATA, (event, arg) => {
  let stringToWrite = '';
  const filePath = path.join(__dirname, "coolguylibrary.nucspot");
  try{
    fs.unlinkSync(filePath, err => {
      console.log("Error deleting "+ filePath);
    })
  } catch (e){
  }

  arg.songList.map((entry) => {
    stringToWrite += entry.track.name + '\n';
  });

  stringToWrite = stringToWrite.slice(0, stringToWrite.length - 1);

    fs.open(filePath, 'w', (err, data) => {
      fs.write(data, stringToWrite, (err, w) => {
        if(err){
          console.log('Error writing to file.');
        }
      })
    });
  }
)

// this is where i will read the save file to see if ive listened to a song before 
// if i have then i will append the file and add a counter to it a
ipcMain.on(channels.SAVE_DATA_STATS, (event, arg) => {
  console.log("TEST");
  let count=1
  const filePath = path.join(__dirname, "songSTATS.nucspot");
  let stats = fs.readFileSync(filePath);

  // let stats = fs.readFile(filePath, (error, data) => {
  //   // if(err){
  //   //   console.log('Error reading to file.');
  //   // }
  //   // console.log("read file data below")
  //   // console.log(data.toString())
  // })

  console.log(typeof count);
  let statsArray = stats.toString().split('\n')
  let songObjArray = []

  for (let index = 0; index < statsArray.length; index++) {
    let statsArraySplit = statsArray[index].split(",")
    let songObj = {
      id: statsArraySplit[0],
      name: statsArraySplit[1],
      count: statsArraySplit[2]
    }  
    songObjArray.push(songObj);  
  }

  //const foundObject = songObjArray.find(obj => obj.id === arg.song_id);
  let foundObject = songObjArray.findIndex(obj => obj.id === arg.song_id);
  console.log("FOUNDobject")
  console.log(songObjArray)
  console.log(foundObject)

  if (foundObject != -1){
    console.log("FOUND");
    let countToNum = Number(songObjArray[foundObject].count);
    let numCountAddition = countToNum+=1;
    songObjArray[foundObject].count = numCountAddition.toString();
  } else {
    console.log("NOT FOUND")
    let newSongObj = {
      id: arg.song_id,
      name: arg.song_name,
      count: 1
    } 
    songObjArray.push(newSongObj)
  }
  let songString = ""

  //still need to track down why the final index is all undefinded
  for (let index = 0; index < songObjArray.length; index++) {
    if (songObjArray[index].id != "") {
      songString+=songObjArray[index].id+","+songObjArray[index].name+","+songObjArray[index].count+"\n"
    }
    if (songObjArray[index].id == "") {
      console.log("next is the phantom id")
      console.log(arg.song_id)
    }
    
  }
  
  fs.open(filePath, 'w', (err, data) => {
    fs.write(data, songString, (err, w) => {
      if(err){
        console.log('Error writing to file.');
      }
    })
  });
}
)
