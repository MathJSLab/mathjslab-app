import type { Interpreter } from 'mathjslab';

let activeInterpreter: Interpreter | undefined;

/** Run synchronous interpreter callbacks against the owning execution session. */
export const withActiveInterpreter = <T>(interpreter: Interpreter, operation: () => T): T => {
    const previous = activeInterpreter;
    activeInterpreter = interpreter;
    try {
        return operation();
    } finally {
        activeInterpreter = previous;
    }
};

/** Return the interpreter belonging to the command currently being evaluated. */
export const getActiveInterpreter = (): Interpreter => {
    if (!activeInterpreter) throw new Error('interpreter operation requested outside an active evaluation');
    return activeInterpreter;
};
