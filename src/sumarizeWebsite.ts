import { getLLMModel } from "../sdk/utils/llm.util";
import { ActionState, endStream, getAiSettings, getDocsByUrl, isStreaming, pushContentStream, replaceContentStream, startStream } from "../sdk/main";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Summarizer } from "../sdk/utils/summarize.util";

const WAIT_TEXT = "Getting anything together <loading>";

async function extractUrlFromInput(input: string, llm) {
    const prompt = PromptTemplate.fromTemplate(`Do not explain or else just extract the URL as string of a given text.

    Text: tell me the xy of example.com
    URL: example.com

    Text: Why is this so uncool of https://shu.de
    URL: https://shu.de

    Text: {text}
    URL:`);
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ text: input });

    return result;
}

export async function main(input: string, actionState: ActionState) {
    const isStreamActive = await isStreaming();
    if (!isStreamActive) {
        await startStream();
    }
    await pushContentStream(WAIT_TEXT);
    // 1. Get the llm model according to the settings
    const settings = await getAiSettings(actionState.defaultLLMendpointId);
    const model = getLLMModel(settings);

    const url = await extractUrlFromInput(input, model);

    // 3. Get the docs
    const docs = await getDocsByUrl(url);


    // 4. Summarize the docs
    const chain = new Summarizer(model);
    const result = await chain.call(docs);

    await replaceContentStream(WAIT_TEXT, result);
    await endStream();

    return result;
}