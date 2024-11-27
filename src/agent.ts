//import type { AIMessage } from './types';
import { addMessages, getMessages, saveToolReponse } from './memory';
import { runLLM } from './llm';
import { logMessage, showLoader } from './ui';
import { runTool } from './toolRunner';

export const runAgent = async ({ userMessage, tools }: {
    userMessage: string,
    tools: any[]
}) => {
    await addMessages([{ role: 'user', content: userMessage }]);

    const loader = showLoader('Thinking...');
    const history = await getMessages();

    const response = await runLLM({ messages: history, tools });
    await addMessages([response]);


    if(response.tool_calls) {
        const toolCall = response.tool_calls[0];

        loader.update(`Running tool...${toolCall.function.name}`);

        const toolResponse = await runTool(toolCall, userMessage);
        await saveToolReponse(toolCall.id, toolResponse);

        loader.update(`done: ${toolCall.function.name}`);
    }


    logMessage(response);
    loader.stop();
    return getMessages();
}