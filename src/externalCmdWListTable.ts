import { appEngine } from './appEngine';
import { Markdown } from './Markdown';

/**
 * External command-form functions that receive the raw command word list from
 * the MathJSLab interpreter.
 */
const externalCmdWListTable = {
    help: {
        func: (...args: string[]): void => {
            const loadHelpFile = async (url: string, topic: string): Promise<string> => {
                const response = await globalThis.fetch(url);
                const contentType = response.headers.get('content-type') ?? '';
                if (!response.ok || contentType.includes('text/html')) {
                    throw new Error(`help: ${topic} not found.`);
                }
                const text = await response.text();
                if (/^\s*(<!doctype\s+html|<html)\b/iu.test(text)) {
                    throw new Error(`help: ${topic} not found.`);
                }
                return text;
            };
            const encodeName = (name: string): string => {
                name = appEngine.interpreter.context.aliasNameFunction(name);
                const result: string[] = [];
                for (let i = 0; i < name.length; i++) {
                    const c = name.charCodeAt(i);
                    if (
                        (c >= 48 && c <= 57) || // digit
                        (c >= 65 && c <= 90) || // Upper case letter
                        (c >= 97 && c <= 122) // Lower case letter
                    ) {
                        result.push(name[i]);
                    } else {
                        result.push(`%${name.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0')}`);
                    }
                }
                return result.join('');
            };
            const promptEntry = appEngine.shell.commandShell.element.promptSet.currentPrompt;
            if (args.length == 1) {
                if (appEngine.shell.isFileProtocol) {
                    promptEntry.element.frameBox.className = 'bad';
                    promptEntry.element.output.innerHTML = 'help command unavailable <b>offline</b>.';
                } else {
                    loadHelpFile(`${appEngine.config.helpBaseUrl}help/${appEngine.lang}/${encodeURIComponent(encodeName(args[0]))}.md`, args[0])
                        .then((responseText) => {
                            promptEntry.element.frameBox.className = 'info';
                            promptEntry.element.output.innerHTML = Markdown.parse(responseText);
                            Markdown.typeset(promptEntry.element.output);
                        })
                        .catch((error) => {
                            promptEntry.element.frameBox.className = 'bad';
                            promptEntry.element.output.innerHTML = Markdown.parse((error as Error).message);
                        });
                }
            } else if (args.length == 0) {
                promptEntry.element.frameBox.className = 'info';
                loadHelpFile(`${appEngine.config.helpBaseUrl}help/${appEngine.lang}/help.md`, 'help')
                    .then((responseText) => {
                        promptEntry.element.frameBox.className = 'info';
                        promptEntry.element.output.innerHTML = Markdown.parse(
                            responseText +
                                appEngine.interpreter.context.builtInFunctionList
                                    .map((func) => `\`${func}\``)
                                    .sort()
                                    .join(', '),
                        );
                        Markdown.typeset(promptEntry.element.output);
                    })
                    .catch((error) => {
                        promptEntry.element.frameBox.className = 'bad';
                        promptEntry.element.output.innerHTML = Markdown.parse((error as Error).message);
                    });
            } else {
                promptEntry.element.frameBox.className = 'bad';
                promptEntry.element.output.innerHTML = `help: function called with too many inputs`;
            }
        },
    },
};
export { externalCmdWListTable };
export default { externalCmdWListTable };
