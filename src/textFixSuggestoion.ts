import { getLLMModel } from "../sdk/utils/llm.util";
import { ActionState, addResult, displayCursorContent, getAiSettings, hideCursorContent } from "../sdk/main";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { addKeyboardListener, getMarkedText, pasteText } from "../sdk/utils/keyboard.utils";
import { windowManager } from "node-window-manager";

const ACTION_KEY = "LEFT CTRL";
const ESC_KEY = "ESCAPE";

const template = `Fix or enhance the provided text.
Original Text: {text}

Revised Text:`

const html_template = `<div class="bg-white shadow-md rounded-lg p-2 opacity-85 max-w-md">
        <div class="mb-4 text-gray-700">
            {{text}}
        </div>
        <div class="flex justify-between">
            <button class=" text-gray-800 font-bold py-2  text-xs px-4 rounded">
                ESC - Cancel
            </button>
            <button class="text-blue-500 font-bold py-2 px-4 text-xs rounded flex small items-center">
                CTRL <span class="mx-2">→</span>  Take suggestion
            </button>
        </div>
    </div>`;

function extractCodeFromText(text: string) {
    const codeBlockPattern = /```[a-z]*\n([\s\S]*?)```/i;
    const match = text.match(codeBlockPattern);
    if (match) {
        return match[1].trim();
    }
    return text;
}

async function waitUntilTabOrEsc() {
    return new Promise((resolve) => {
        const listener = addKeyboardListener((e) => {
            if (e.name == ACTION_KEY || e.name == ESC_KEY) {
                listener.kill();
                resolve(e.name);
            }
        });
    });
}

export async function main(input: string, actionState: ActionState) {
    try {

        await displayCursorContent(`<div class="flex text-orange-300"> <i class="animate-spin w-5 h-5 mr-2" data-feather="aperture"></i>Checking...</div>`);
        const activeWindow = windowManager.getActiveWindow();
        if (input == undefined || input.trim() == "") {
            const markedText = await getMarkedText();
            if (markedText == "") {
                await addResult("No text provided");
                return;
            }

            input = markedText;
        }


        const settings = await getAiSettings(actionState.defaultLLMendpointId);
        const model = getLLMModel(settings);

        const prompt = ChatPromptTemplate.fromTemplate(template);
        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        let result = await chain.invoke({ text: input });

        if (result === "" || result === undefined) {
            await addResult("No suggestion found");
            return;
        }

        if (result.includes("```")) {
            result = extractCodeFromText(result);
        }

        await hideCursorContent();
        await displayCursorContent(html_template.replace("{{text}}", result));

        const vKey = await waitUntilTabOrEsc();

        if (vKey == ACTION_KEY) {
            activeWindow.bringToTop();
            await new Promise((resolve) => setTimeout(resolve, 100));
            await pasteText(result);
        }

    } catch (e) {
        console.log("ERROR: ", e);
        await addResult("An error occured");
    } finally {
        await hideCursorContent();
    }
}