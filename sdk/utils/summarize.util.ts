import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DocumentData } from "../main";
import { PromptTemplate } from "@langchain/core/prompts";

export class Summarizer {
    private llm: any;

    constructor(llm: any) {
        this.llm = llm;
    }

    // TODO callback
    async call(content: string | DocumentData[], prompt?: string, callback?: (prompt: string) => void, options?: { callbacks?: any }): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let docs = content;

                if (typeof content === "string") {
                    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 800 });
                    docs = await textSplitter.createDocuments([content]) as DocumentData[];
                }

                const addition = prompt ? `and take ${prompt} into account` : ``;
                const template = `Write a concise summary ${addition} of the following:


                "{text}"
                
                
                CONCISE SUMMARY:`

                const chain = loadSummarizationChain(this.llm, {
                    type: "refine", refinePrompt: new PromptTemplate({
                        template,
                        inputVariables: ['text'],
                    })
                });
                const result = await chain.invoke({
                    input_documents: docs
                }, {
                    callbacks: options?.callbacks
                });

                resolve(result.output_text?.trimStart() ?? "Nothing to summarize");
            } catch (err) {
                reject(err);
            }
        });
    }
}