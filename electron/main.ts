import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

let win: BrowserWindow | null;
function createWindow() {
    win = new BrowserWindow({
        frame: false,
        icon: path.join(process.env.VITE_PUBLIC || "", "excalidraw-icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
        },
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(createWindow);

const vargs = [...process.argv].slice(1);

ipcMain.on("get-command-line-args", (event) => {
    event.reply("command-line-args", vargs);
});

const filePath: string =
	(import.meta.env.DEV ? import.meta.env.VITE_TESTING_FILE_PATH??"" : null) ??
		vargs[0] ?? "";

ipcMain.handle("get-file-data", async () => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            return { path: filePath, content: data };
        }
        return { path: filePath, error: "File not found" };
    } catch (error) {
        console.log(error);
    }
});

ipcMain.on("set-file-data", (event, { content }) => {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            event.reply("set-file-data-reply", {
                success: false,
                error: err.message,
            });
        } else {
            event.reply("set-file-data-reply", { success: true });
        }
    });
});

const imagePath = /\./.test(filePath)
    ? filePath.split(".").slice(0, -1).join(".")
    : filePath;

ipcMain.on("set-image-svg-data", (event, { content }) => {
    const replacedContent = (content as string).replace(
        'filter="invert(93%) hue-rotate(180deg)"',
        'filter="invert(98.5%) hue-rotate(180deg)"',
    );
    fs.writeFile(`${imagePath}.svg`, replacedContent, (err) => {
        if (err) {
            event.reply("set-image-svg-data-reply", {
                success: false,
                error: err.message,
            });
        } else {
            event.reply("set-image-svg-data-reply", { success: true });
        }
    });
});

ipcMain.on("set-image-png-data", (event, { content }) => {
    fs.writeFile(`${imagePath}.png`, Buffer.from(content), (err) => {
        if (err) {
            event.reply("set-image-png-data-reply", {
                success: false,
                error: err.message,
            });
        } else {
            event.reply("set-image-png-data-reply", { success: true });
        }
    });
});
