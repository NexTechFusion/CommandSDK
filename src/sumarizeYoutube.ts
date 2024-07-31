import { getLLMModel } from "../sdk/utils/llm.util";
import { ActionState, endStream, getAiSettings, getDocsByUrl, isStreaming, pushContentStream, pushLog, replaceContentStream, startStream } from "../sdk/main";
import { Summarizer } from "../sdk/utils/summarize.util";

const WAIT_TEXT = "Getting transcription <loading>";

export async function main(input: string, actionState: ActionState) {
    const isStreamActive = await isStreaming();
    if (!isStreamActive) {
        await startStream();
    }
    await pushContentStream(WAIT_TEXT);
    // 1. Get the docs
    const docs = await getDocsByUrl(input);

    // 2. Get the llm model according to the settings
    const settings = await getAiSettings(actionState.defaultLLMendpointId);
    const model = getLLMModel(settings);

    // 3. Summarize the docs
    const chain = new Summarizer(model);
    const result = await chain.call(docs);

    await replaceContentStream(WAIT_TEXT, result);
    await endStream();

    return result;
}