import { spawn } from "child_process";

function getOpenUrlCommand(url) {
    let openCommand;
    let args;
    switch (process.platform) {
        case 'darwin': // macOS
            openCommand = 'open';
            args = [url];
            break;
        case 'win32': // Windows
            openCommand = 'cmd';
            args = ['/c', 'start', url];
            break;
        default: // Linux and other Unix-like systems
            openCommand = 'xdg-open';
            args = [url];
            break;
    }

    return { openCommand, args };
}

export async function openBrowserWindow(url, options = {}) {
    return new Promise((resolve, reject) => {
        const { args, openCommand } = getOpenUrlCommand(url);
        const process = spawn(openCommand, [args]);

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data) => {
            reject(`stderr: ${data}`);
            process.kill();
        });

        process.on('close', (code) => {
            resolve(code);
        });
    });
}
