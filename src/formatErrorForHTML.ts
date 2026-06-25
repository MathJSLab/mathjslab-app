import { InterpreterError } from 'mathjslab';
function formatErrorForHTML(err: InterpreterError): string {
    const errorString = typeof err.format !== 'undefined' ? err.format() : err.message;
    return errorString.replace(/\r?\n/g, '<br>').replace(/ {4}/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}
export { formatErrorForHTML };
export default { formatErrorForHTML };
