import './EvaluatorConfiguration';
import evalInput from './evalInput';
import evalPrompt from './evalPrompt';
import Shell from './Shell';
import { appEngine } from './appEngine';
import './main.scss';

async function bootstrap(): Promise<void> {
    appEngine.shell = await Shell.initialize({
        shellId: 'mathjslab-shell',
        examplesId: 'mathjslab-examples',
        evalPrompt,
        evalInput,
    });
}
bootstrap();
