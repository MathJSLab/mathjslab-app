import { InterpreterError } from 'mathjslab';

/**
 * Convert an interpreter error message into HTML suitable for prompt output.
 *
 * @param err Interpreter error to render.
 * @returns Error text with line breaks and indentation preserved for HTML.
 */
function formatErrorForHTML(err: InterpreterError): string {
    const errorString = typeof err.format !== 'undefined' ? err.format() : err.message;
    return errorString.replace(/\r?\n/g, '<br>').replace(/ {4}/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}
export { formatErrorForHTML };
export default { formatErrorForHTML };
