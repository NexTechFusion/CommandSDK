import { addResult, displayCursorContent, hideCursorContent, waitForInput } from "../sdk/main";
import { openBrowserWindow } from "../sdk/utils/browser.util";

async function test() {
    try {
        await addResult("Doy you want to see a magic trick? (yes/no)");
        const txt = await waitForInput();

        if (txt === "yes") {
            await openBrowserWindow("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }

        await displayCursorContent(`<h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Cool isnt it?</h1>`);

        await addResult("We are done? (yes/no)");
        const isDone = await waitForInput();
        await hideCursorContent();

        if (isDone === "yes") {
            await addResult("Goodbye!");
        } else {
            await addResult("Goodbye! (anyway)");
        }

    } catch (err) {
        console.error(err);
    }
}
test();
