import { appEngine, getCommandOutputTarget } from './appEngine';
import i18n from './i18n';
import { Markdown, markdownEngine } from './Markdown';
import { disposeMarkdownDocument, mountMarkdownDocument } from './markdown/MarkdownDocumentHost';

/**
 * External command-form functions that receive the raw command word list from
 * the MathJSLab interpreter.
 */
const externalCmdWListTable = {
    help: {
        func: (...args: string[]): void => {
            /**
             * Load a Markdown help page and reject SPA fallbacks returned as HTML.
             */
            const loadHelpFile = async (url: string, topic: string): Promise<string> => {
                const response = await globalThis.fetch(url);
                const contentType = response.headers.get('content-type') ?? '';
                if (!response.ok || contentType.includes('text/html')) {
                    throw new Error(i18n.format('help.notFound', { topic }));
                }
                const text = await response.text();
                if (/^\s*(<!doctype\s+html|<html)\b/iu.test(text)) {
                    throw new Error(i18n.format('help.notFound', { topic }));
                }
                return text;
            };

            /**
             * Encode command names after applying interpreter aliases.
             */
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
                        result.push(name[i]!);
                    } else {
                        result.push(`%${name.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0')}`);
                    }
                }
                return result.join('');
            };
            const outputTarget = getCommandOutputTarget();
            if (args.length == 1) {
                if (appEngine.shell.isFileProtocol) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML(i18n.page.help.unavailableOfflineHtml);
                } else {
                    const topic = args[0]!;
                    const helpUrl = new URL(`${appEngine.config.helpBaseUrl}help/${i18n.locale}/${encodeURIComponent(encodeName(topic))}.md`, globalThis.location.href);
                    loadHelpFile(helpUrl.href, topic)
                        .catch((error: unknown) => {
                            const userHelp = appEngine.interpreter.GetFunctionHelp(topic);
                            if (!userHelp) throw error;
                            const sourceUrl = userHelp.sourceName ? new URL(userHelp.sourceName, globalThis.location.href) : helpUrl;
                            return { markdown: userHelp.text, sourceUrl };
                        })
                        .then(async (result) => {
                            const markdown = typeof result === 'string' ? result : result.markdown;
                            const sourceUrl = typeof result === 'string' ? helpUrl : result.sourceUrl;
                            outputTarget.setState('info');
                            await mountMarkdownDocument(outputTarget.content, {
                                engine: markdownEngine,
                                markdown,
                                context: { sourceUrl },
                                locale: i18n.locale,
                                outline: 'hidden',
                                externalLinks: 'new-tab',
                            });
                        })
                        .catch(async (error) => {
                            await disposeMarkdownDocument(outputTarget.content);
                            outputTarget.setState('bad');
                            outputTarget.setHTML(Markdown.parse((error as Error).message));
                        });
                }
            } else if (args.length == 0) {
                if (appEngine.shell.isFileProtocol) {
                    outputTarget.setState('bad');
                    outputTarget.setHTML(i18n.page.help.unavailableOfflineHtml);
                    return;
                }
                outputTarget.setState('info');
                const helpUrl = new URL(`${appEngine.config.helpBaseUrl}help/${i18n.locale}/help.md`, globalThis.location.href);
                loadHelpFile(helpUrl.href, 'help')
                    .then(async (responseText) => {
                        outputTarget.setState('info');
                        await mountMarkdownDocument(outputTarget.content, {
                            engine: markdownEngine,
                            markdown:
                                responseText +
                                appEngine.interpreter.context.builtInFunctionList
                                    .map((func) => `\`${func}\``)
                                    .sort()
                                    .join(', '),
                            context: { sourceUrl: helpUrl },
                            locale: i18n.locale,
                            outline: 'hidden',
                            externalLinks: 'new-tab',
                        });
                    })
                    .catch(async (error) => {
                        await disposeMarkdownDocument(outputTarget.content);
                        outputTarget.setState('bad');
                        outputTarget.setHTML(Markdown.parse((error as Error).message));
                    });
            } else {
                outputTarget.setState('bad');
                outputTarget.setText(i18n.page.help.tooManyInputs);
            }
        },
    },
};
export { externalCmdWListTable };
export default { externalCmdWListTable };
