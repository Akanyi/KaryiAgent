import React from 'react';
import { OrchestratorConfig } from '../../core/src/index.js';
interface TUIProps {
    onMessage?: (message: string) => void;
    orchestratorConfig?: OrchestratorConfig;
}
declare const App: React.FC<TUIProps>;
export declare function startTUI(options?: TUIProps): Promise<void>;
export default App;
//# sourceMappingURL=index.d.ts.map