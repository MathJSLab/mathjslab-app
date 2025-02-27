import evalInput from './evalInput';
import evalPrompt from './evalPrompt';
import Shell from './Shell';
import './main.scss';

declare global {
    var ShellPointer: Shell;
}

async function bootstrap(): Promise<void> {
    globalThis.ShellPointer = await Shell.initialize({
        shellId: 'mathjslab-shell',
        examplesId: 'mathjslab-examples',
        evalPrompt,
        evalInput,
    });
}
bootstrap();
