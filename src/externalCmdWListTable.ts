import { appEngine } from './appEngine';
import { Markdown } from './Markdown';

const externalCmdWListTable = {
    help: {
        func: (...args: string[]): void => {
            const encodeName = (name: string): string => {
                name = appEngine.evaluator.aliasNameFunction(name);
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
                    globalThis
                        .fetch(`${appEngine.config.helpBaseUrl}help/${appEngine.lang}/${encodeURIComponent(encodeName(args[0]))}.md`)
                        .then((response) => {
                            if (response.ok) {
                                promptEntry.element.frameBox.className = 'info';
                                return response.text();
                            } else {
                                promptEntry.element.frameBox.className = 'bad';
                                return `help ${args[0]} not found.`;
                            }
                        })
                        .then((responseText) => {
                            promptEntry.element.output.innerHTML = Markdown.parse(responseText);
                            Markdown.typeset(promptEntry.element.output);
                        });
                }
            } else if (args.length == 0) {
                promptEntry.element.frameBox.className = 'info';
                globalThis
                    .fetch(`${appEngine.config.helpBaseUrl}help/${appEngine.lang}/help.md`)
                    .then((response) => {
                        if (response.ok) {
                            promptEntry.element.frameBox.className = 'info';
                            return response.text();
                        } else {
                            promptEntry.element.frameBox.className = 'bad';
                            return `help ${args[0]} not found.`;
                        }
                    })
                    .then((responseText) => {
                        promptEntry.element.output.innerHTML = Markdown.parse(
                            responseText +
                                appEngine.evaluator.builtInFunctionList
                                    .map((func) => `\`${func}\``)
                                    .sort()
                                    .join(', '),
                        );
                        Markdown.typeset(promptEntry.element.output);
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
