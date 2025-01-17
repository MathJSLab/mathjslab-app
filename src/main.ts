// declare module "*.scss"

import evalInput from './evalInput';
import evalPrompt from './evalPrompt';
import { Shell } from './Shell';
import './main.css';

// import './components/simple-nav/simple-nav.component';
import './components/collapsible-content-panel/collapsible-content-panel.component';

export const input: string = '';

function bootstrap() {
    Shell.initialize({
        containerId: 'mathjslab-prompt',
        examplesId: 'mathjslab-examples',
        evalPrompt,
        evalInput,
        input,
    });
}
bootstrap();
