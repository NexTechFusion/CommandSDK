import robot from "@jitsi/robotjs";
import { clipboard } from "clipboard-sys";
import { GlobalKeyboardListener } from "node-global-key-listener";

export async function pasteText(text: string) {
    await clipboard.writeText(text);
    pressPaste();
}

export const pressKey = (key: string) => {
    robot.keyTap(key);
}

export const pressCopy = async () => {
    if (process.platform === 'darwin') {
        robot.keyTap('c', 'command');
    } else {
        robot.keyTap('c', 'control');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
}

export const pressPaste = async () => {
    if (process.platform === 'darwin') {
        robot.keyTap('v', 'command');
    } else {
        robot.keyTap('v', 'control');
    }
}

export const pressCut = async () => {
    if (process.platform === 'darwin') {
        robot.keyTap('x', 'command');
    } else {
        robot.keyTap('x', 'control');
    }
}

export const getMarkedText = async () => {
    try {
        await pressCopy();
        return await clipboard.readText();
    } catch (e) {
        console.error(e);
        return "";
    }
}

export function addKeyboardListener(callback: (e: any) => void) {
    const keyboardListener = new GlobalKeyboardListener();

    keyboardListener.addListener((e) => {
        if (e.state == "DOWN") {
            return;
        }

        if (e.state == "UP") {
            callback(e);
        }
    });

    return keyboardListener;
}