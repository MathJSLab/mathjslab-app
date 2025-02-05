import evalInput from './evalInput';
import evalPrompt from './evalPrompt';
import { Shell } from './Shell';
import './components/components';
import './main.css';

declare global {
    var ShellPointer: Shell;
}

async function bootstrap(): Promise<void> {
    global.ShellPointer = await Shell.initialize({
        containerId: 'mathjslab-prompt',
        examplesId: 'mathjslab-examples',
        evalPrompt,
        evalInput,
        input: '',
    });
}
bootstrap();
