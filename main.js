// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { readFileSync, writeFileSync, readdirSync, unlinkSync } = require('fs');
const schedule = require('node-schedule');
const bot = require("./post/bot")

let mainWindow;
let conn;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false, // Disable window resizing
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script path
            nodeIntegration: false,  // Disable Node.js integration for security
            contextIsolation: true,  // Enable context isolation (required)
        }
    });

    mainWindow.loadFile('index.html');
    //mainWindow.webContents.openDevTools();
    // Example of communication from main to renderer
    ipcMain.on('commit', async (event, message) => {
        if (message.type == "start") {
            let content = await readFileSync("./post/content.config.txt", "utf8")
            let Links = await readFileSync("./post/groups.json")
            let buffer = await readFileSync("./post/bot.config.json")
            let { headless } = await JSON.parse(buffer)
            let data = await JSON.parse(Links)
            // files for inject
            const files = await readdirSync("./post/images")
            await bot(data, headless, files, content)
        }
        if (message.type == "groups") {
            let content = await readFileSync("./post/content.config.txt", "utf8")
            let time = await readFileSync("./post/delay.config.json")
            let { delay } = await JSON.parse(time)
            let Links = await readFileSync("./post/groups.json")
            let data = await JSON.parse(Links)
            let buffer = await readFileSync("./post/bot.config.json")
            let { headless } = await JSON.parse(buffer)
            const files = await readdirSync("./post/images")
            if (delay == true) {
                console.log("DELAY START")
                conn = schedule.scheduleJob('0 */6 * * *', async function () {
                    event.reply("main-to-renderer", { type: "start" });
                });
            }
            event.reply('main-to-renderer', { type: "groups", data, headless, files, delay, content });
        }
        if (message.type == "newGroups") {
            let Links = await readFileSync("./post/groups.json")
            let data = await JSON.parse(Links)
            data.push({ link: message.data })
            await writeFileSync("./post/groups.json", JSON.stringify(data))
            Links = await readFileSync("./post/groups.json")
            data = await JSON.parse(Links)
            event.reply('main-to-renderer', { type: "groups", data });
        }
        if (message.type == "delete") {
            let Links = await readFileSync("./post/groups.json")
            let data = await JSON.parse(Links)
            data.splice(message.id, true)
            await writeFileSync("./post/groups.json", JSON.stringify(data));
            console.log(data)
            //event.reply('main-to-renderer', { type: "groups", data });
        }
        if (message.type == "config") {
            let buffer = await readFileSync("./post/bot.config.json")
            let data = await JSON.parse(buffer)
            if (data.headless == false) {
                data.headless = "shell"
            } else {
                data.headless = false
            }
            await writeFileSync("./post/bot.config.json", JSON.stringify(data))
        }
        if (message.type == "upload") {
            // Save file with pure text
            const fileName = `${Math.floor(Math.random() * 1000000)}.jpg`
            await writeFileSync(`./post/images/${fileName}`, message.data, { encoding: "base64" });
            // read all image and force update any opponent
            const files = await readdirSync("./post/images")
            // new update front end
            event.reply('main-to-renderer', { type: "uploaded" })
        }
        if (message.type == "deleteImage") {
            await unlinkSync(`./post/images/${message.data}`)
            // force update
            event.reply("main-to-renderer", { type: "deleteImage" })
        }
        if (message.type == 'delay') {
            let buffer = await readFileSync("./post/delay.config.json")
            let data = await JSON.parse(buffer)
            data.delay = !data.delay
            await writeFileSync("./post/delay.config.json", JSON.stringify(data))

            // time manager
            if (data.delay == true) {
                console.log("DELAY START")
                conn = schedule.scheduleJob('*/5 * * * *', async function () {
                    event.reply("main-to-renderer", { type: "start" })
                });
            } else {
                conn.cancel();
            }
            event.reply("main-to-renderer", { type: "delay", data })
        }
        if (message.type == "content") {
            await writeFileSync("./post/content.config.txt", message.data, { encoding: "utf8" })
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

try {
    require('electron-reloader')(module)
} catch (_) { }