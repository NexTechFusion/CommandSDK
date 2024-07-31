
const key = "test";
const clientUrl = "http://localhost:3440/execute";
const serverUrl = "http://localhost:3400/api";

export async function codeExec(code: string, retryCount = 0): Promise<any> {
    try {
        const req: ExternalCodeRequest = { code, key };
        const response = await fetch(clientUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (e) {
        console.log(e);
        retryCount++;
        if (retryCount === 3) {
            throw new Error(e);
        }
        return codeExec(code, retryCount);
    }
}

async function execSSR(req: {}, route = "code/exec"): Promise<any> {
    try {
        const response = await fetch(`${serverUrl}/${route}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
}

export async function getAllDocs(): Promise<DocumentData[]> {
    const code = `return await getAllDocs();`;
    const docs = await codeExec(code);
    return docs;
}

export async function getDocsBySimilarity(text: string, topK: number = 2, options: VectorCallOptions = {}, table = "global"): Promise<DocumentData[]> {
    const code = `return await getDocsBySimilarity(\`${stripChars(text)}\`, ${topK}, ${JSON.stringify(options)}, '${table}');`;
    const docs = await codeExec(code);
    return docs;
}

export async function getDocsByUrl(url: string): Promise<DocumentData[]> {
    const code = `return await getDocsByUrl('${url}');`;
    const docs = await codeExec(code);
    return docs;
}

// Saves the text to the instance knowledge base
export async function ingestText(text: string, settings?: TextIngestSettings, table: string = "global"): Promise<void> {
    const code = `await ingestText(\`${text}\`, ${JSON.stringify(settings ?? {})}, '${table}');`;
    await codeExec(code);
}
// Saves images to achive mulitmodal search
export async function ingestImages(images: string[], settings?: ImageIngestSettings, table: string = "images"): Promise<string[]> {
    const code = `return await ingestImages(${JSON.stringify(images)}, ${JSON.stringify(settings ?? {})}, '${table}');`;
    const paths = await codeExec(code);
    return paths;
}

export async function getImagesBySimilarity(srcOrBuffer: string | Buffer, topK: number = 2, options: VectorCallOptions = {}, table: string = "images"): Promise<ImageStoreModel[]> {
    const isBuffer = typeof srcOrBuffer !== "string";

    if (isBuffer) {
        srcOrBuffer = toBase64(srcOrBuffer as Buffer);
    }

    const code = `return await getImagesBySimilarity(\`${srcOrBuffer}\`, ${topK}, ${JSON.stringify(options)}, '${table}');`;
    const docs = await codeExec(code);
    return docs;
}

export async function getImagesByWindowName(windowName: string): Promise<ImageStoreModel[]> {
    const code = `return await getImagesByWindowName('${windowName}');`;
    const docs = await codeExec(code);
    return docs;
}

export async function newInteraction(): Promise<string> {
    const code = `return await newInteraction();`;
    const conversationId = await codeExec(code);
    return conversationId;
}

export async function getInteractionState(): Promise<{
    conversationId: string,
    history: LlmResultModel[]
}> {
    const code = `return await getInteractionState();`;
    const results = await codeExec(code);
    return results;
}

export async function updateState(state: any): Promise<void> {
    const code = `updateState(${JSON.stringify(state)});`;
    await codeExec(code);
}

export async function getState(): Promise<any> {
    const code = `return getState();`;
    return await codeExec(code);
}

// Content for direct interaction e.g QA on a specific text
export async function addInteractionContent(text: string): Promise<void> {
    const code = `await addInteractionContent(\`${text}\`);`;
    await codeExec(code);
}

// Sets the current interaction prompt
export async function setPrompt(text: string): Promise<void> {
    const code = `await setInput(\`${text}\`);`;
    await codeExec(code);
}

// Submits and starts the interaction
export async function submitPrompt(text?: string): Promise<void> {
    const code = `await submitPrompt(\`${text}\`);`;
    await codeExec(code);
}

export async function getKeyValues(): Promise<KeyValueSetting[]> {
    const code = `return await getKeyValues();`;
    const keyValues = await codeExec(code);
    return keyValues;
}

export async function getAiSettings(id: string | DefaultKeys): Promise<AiKeyValueSetting> {
    const settings = await getKeyValues();
    const aiSettings = settings.find(s => s.id === id);
    return aiSettings;
}

export async function getAiApiKey(id: string | DefaultKeys): Promise<string> {
    const settings = await getAiSettings(id);
    return settings.values.ApiKey;
}

export async function getCommands(): Promise<CommandModel[]> {
    const code = `return await getCommands();`;
    const commands = await codeExec(code);
    return commands;
}

export async function executeCommand<T>(input: string, cmdId: string): Promise<T> {
    const code = `return await execCommand(\`${input}\`, \`${cmdId}\`);`;
    return await codeExec(code);
}

export async function addPrompt(html: string): Promise<void> {
    const code = `addPrompt(\`${encodeContent(html)}\`, true);`;
    await codeExec(code);
}

export async function updatePrompt(html: string): Promise<void> {
    const code = `updatePrompt(\`${encodeContent(html)}\`, true);`;
    await codeExec(code);
}

export async function addResult(result: string): Promise<void> {
    const code = `addResult(\`${encodeContent(result)}\`, null, true);`;
    await codeExec(code);
}

export async function pushLog(log: string): Promise<void> {
    const code = `pushLog(\`${encodeContent(log)}\`, true);`;
    await codeExec(code);
}

export async function pushContentStream(token: string): Promise<void> {
    const code = `pushContentStream(\`${encodeContent(token)}\`);`;
    await codeExec(code);
}

export async function replaceContentStream(token: string, replaceText: string): Promise<void> {
    const code = `replaceContentStream(\`${encodeContent(token)}\`, \`${encodeContent(replaceText)}\`);`;
    await codeExec(code);
}

export async function endStream(): Promise<void> {
    const code = `endStream();`;
    await codeExec(code);
}

export async function startStream(): Promise<void> {
    const code = `await startStream();`;
    await codeExec(code);
}

export async function isStreaming(): Promise<boolean> {
    const code = `return await isStreaming();`;
    return await codeExec(code);
}

export async function waitForInput(): Promise<string> {
    const code = `return await waitForInput();`;
    return await codeExec(code);
}

// VAD and stops the audio recording if a voice ended
export async function startAudioRecording(): Promise<Buffer | null> {
    const code = `return await startAudioRecording();`;
    const bufferStr = await codeExec(code);
    return bufferStr ? Buffer.from(JSON.parse(bufferStr)) : null;
}

export async function stopAudioRecording(): Promise<void> {
    const code = `stopAudioRecording();`;
    await codeExec(code);
}

// mark areas on the screen
export async function markAreas(areas: Area[]) {
    const code = `await markAreas(${JSON.stringify(areas)});`;
    await codeExec(code);
}

export async function clearAreas() {
    const code = `await clearAreas();`;
    await codeExec(code);
}

// define an area by dragging the mouse
export async function waitUntilMarked(): Promise<MarkEvent> {
    const code = `return await waitUntilMarked();`;
    const result = await codeExec(code);
    const buffer = Buffer.from(JSON.parse(result.fileBuffer));
    return { fileBuffer: buffer, captureRect: result.captureRect };
}

export function toBase64(buffer: Buffer, ext = "png"): string {
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
}

export function toBuffer(base64: string): Buffer {
    return Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
}

export async function openNewWindow(htmlOrFilePath: string, options?: WindowOptions): Promise<void> {
    const code = `await openExternalWindow(\`${encodeContent(htmlOrFilePath)}\`, ${JSON.stringify(options ?? {})});`;
    await codeExec(code);
}

export async function displayContentAtPositions(contents: ContentPosition[], options = {
    clickable: false,
    additionalCss: ""
    // function: () => { } // will be exec on start
}): Promise<void> {
    const contentStr = encodeContent(contents);
    const optionsStr = encodeContent(options);
    const code = `await displayContentAtPositions(\`${(contentStr)}\`, \`${optionsStr}\`);`;
    await codeExec(code);
}

export async function clearContentAtPositions(): Promise<void> {
    const code = `await clearContentAtPositions();`;
    await codeExec(code);
}

export async function displayCursorContent(html: string): Promise<void> {
    const code = `await displayCursorContent(\`${encodeContent(html)}\`, true);`;
    await codeExec(code);
}

export async function hideCursorContent(): Promise<void> {
    const code = `await hideCursorContent();`;
    await codeExec(code);
}

export async function playAudio(urlOrArrayBufferStr: string, isArrayBuffer?: boolean): Promise<void> {
    const code = `await playAudio(\`${urlOrArrayBufferStr}\`, ${isArrayBuffer});`;
    await codeExec(code);
}

export async function extractWebsiteContent(url: string, maxDepth: number = 1): Promise<{ url: string, content: string }[]> {
    const code = `return await extractWebsiteContent(\`${url}\`, ${maxDepth}, true);`;
    const contents = await execSSR({ code });
    return JSON.parse(contents);
}

export async function extractTextFromImage(imgBuffer: Buffer, lang = "eng"): Promise<TextRecognitionResult> {
    const code = `return await extractTextFromImage(\`${JSON.stringify(imgBuffer)}\`, \`${lang}\`, true);`;
    const contents = await execSSR({ code });
    return JSON.parse(contents);
}

export async function extractYoutubeContent(url: string): Promise<TranscriptResponse[]> {
    const code = `return await extractYoutubeContent(\`${url}\`, true);`;
    const contents = await codeExec(code);
    return JSON.parse(contents);
}

export async function getEmbedding(texts: string[], model?: string): Promise<any> {
    const contents = await execSSR({ texts, model }, "vector/embedding");
    return contents;
}

export async function labelImage(imgSrc: string | Buffer): Promise<LabeledImage> {

    if (typeof imgSrc !== "string") {
        imgSrc = toBase64(imgSrc);
    }

    const code = `return await labelImage(\`${imgSrc}\`);`;
    const contents = await codeExec(code);
    return { img: Buffer.from(JSON.parse(contents.imgBufferStr)), fields: contents.fields };
}

export async function determineMatches(imagePath, templatePath, threshold = 0.8): Promise<{ x: number, y: number, width: number, height: number }> {

    const code = `return await determineMatches(\`${imagePath}\`, \`${templatePath}\`, ${threshold});`;
    const res = await codeExec(code);
    return res;
}

export async function callRag(prompt: string, llmSetting: AiKeyValueSetting, docs: DocumentData[]) {
    const code = `return await callRag(\`${prompt}\`, ${JSON.stringify(llmSetting)}, ${JSON.stringify(docs)});`;
    const contents = await codeExec(code);
    return contents;
}

/** Experimantal */
export async function addNewTaskFlow(mimicStore: any) {
    const code = `await addNewTaskFlow(${JSON.stringify(mimicStore)});`;
    await codeExec(code);
}

export async function getTaskFlows() {
    const code = `return await getTaskFlows();`;
    const contents = await codeExec(code);
    return contents;
}

export async function startTaskRecording() {
    const code = `await startTaskRecording()`;
    await codeExec(code);
}

export async function stopTaskRecording() {
    const code = `stopTaskRecording()`;
    await codeExec(code);
}

export async function taskMarkListener() {
    const code = `return await taskMarkListener()`;
    return await codeExec(code);
}

export async function taskExplainListener() {
    const code = `return await taskExplainListener()`;
    return await codeExec(code);
}
/** ---- */

export async function classifyText(text: string, labels: string[], model?: string): Promise<{ labels: string[], scores: number[] }> {
    const code = `return await classifyText(\`${text}\`, ${JSON.stringify(labels)}, ${model});`;
    const response = await codeExec(code);

    return response;
}

export async function waitforAnswer(options: string[]): Promise<number> {
    const ansertText = await waitForInput();
    const classify = await classifyText(ansertText, options);
    return classify.scores.indexOf(Math.max(...classify.scores));
}

function encodeContent(content: any): string {
    if (!content) {
        return "";
    }

    if (typeof content !== "string") {
        content = JSON.stringify(content);
    }

    return encodeURI(content);
}

// TODO encode properly
function stripChars(text): string {
    if (!text) {
        return "";
    }

    if (typeof text !== "string") {
        text = text.toString();
    }

    return text.replace(/`/g, '\\`')
}

export interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
}

export interface ExternalCodeRequest {
    key: string;
    code: string;
}

export interface ScreenData {
    id: string;
    name: string;
    display_id?: string;
    fileBuffer: Buffer;
    isAppWindow?: boolean; // if its a electron browser window
    isActiveDisplay?: boolean;
    bounds?: IRectangle;
}

interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CursorPosition {
    x: number;
    y: number;
}

export interface WindowOptions {
    browserWindowOptions?: any//Electron.BrowserWindowConstructorOptions,
    position?: { x: number, y: number },
    size?: { width: number, height: number },
    bringToFront?: boolean
    focus?: boolean,
    asFile?: string,
    code?: string,
    inShell?: boolean,
}
export interface LlmResultModel {
    header?: string;
    content?: string;
    date: Date;
    sources?: DocumentData[];
    logs?: string[];
    confirmElements?: { text: string, classes?: string }[];
}

export interface CommandModel {
    id: string;
    name: string;
    isTool?: boolean;
    description?: string;
}
export interface KeyValueSetting {
    id: string | DefaultKeys;
    name: string;
    values: any; // { [key: string]: any };
    isDefault?: boolean;
}

export interface AiKeyValueSetting extends KeyValueSetting {
    values: OpenAiValues;
}

export interface OpenAiValues {
    ApiKey: string | undefined,
    Model: string | undefined
}

export enum DefaultKeys {
    GOOGLE = "GOOGLE",
    OPENAI = "OPENAI",
    OLLAMA = "OLLAMA"
}

export interface DocumentData {
    pageContent: string;
    metadata: DocumentMetaData;
}

export interface DocumentMetaData {
    id: string;
    date: string;
    tags: string;
    file_path: string;
    file_total_pages: number;
    file_page_number: number;
    file_page_lines_from: number;
    file_page_lines_to: number;
    keywords: string;
}

export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
    classes?: string;
    label?: string;
    labelClasses?: string;
}

export interface ContentPosition {
    x: number;
    y: number;
    html: string;
    width?: number;
    height?: number;
}

// TODO extend filters
export interface VectorCallOptions {
    where?: string;
    filter?: string;
    metricType?: string;
}

export interface TextIngestSettings {
    id?: string;
    tags?: string;
    keywords?: string;
    relations?: [{ id: string, table: string }],
    file_path?: string;
}

export interface ImageIngestSettings {
    id?: string;
    relations?: [{ id: string, table: string }],
    additionalData?: string;
}

//TODO extend filters
export interface ImageVectorCallOptions {
    storeId?: string;
}

export interface ImageStoreModel {
    id: string;
    image: string;
    date: string;
    relations?: { id: string, table: string }[];
    distance?: number;
    path?: string;
}

interface WordDetail {
    bbox: { x0: number, y0: number, x1: number, y1: number };
    text: string;
    fontSize: number;
}
export interface TextRecognitionResult {
    text: string;
    words: WordDetail[];
}

export interface LabeledImage {
    img: Buffer,
    fields: LabelField[]
}

export interface LabelField {
    number: number;
    rect: { x, y, width, height };
}

export interface MarkEvent {
    fileBuffer: Buffer,
    captureRect: { x: number, y: number, width: number, height: number }
}
export interface ActionState {
    docs?: DocumentData[];
    initalInput?: string;
    command?: CommandModel;
    defaultLLMendpointId?: string;
}