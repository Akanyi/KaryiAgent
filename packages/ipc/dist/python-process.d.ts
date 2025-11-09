/**
 * Python Process Manager
 *
 * Manages the lifecycle of the Python backend process,
 * including starting, stopping, and monitoring.
 */
import { EventEmitter } from 'events';
export interface PythonProcessOptions {
    pythonPath?: string;
    scriptPath?: string;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}
export declare class PythonProcess extends EventEmitter {
    private process;
    private options;
    private isRunning;
    constructor(options?: PythonProcessOptions);
    /**
     * 启动 Python 进程
     */
    start(): Promise<void>;
    /**
     * 停止 Python 进程
     */
    stop(): Promise<void>;
    /**
     * 重启 Python 进程
     */
    restart(): Promise<void>;
    /**
     * 获取 stdin 流（用于发送 JSON-RPC 请求）
     */
    getStdin(): import('stream').Writable | null;
    /**
     * 获取 stdout 流（用于接收 JSON-RPC 响应）
     */
    getStdout(): import('stream').Readable | null;
    /**
     * 检查进程是否正在运行
     */
    isAlive(): boolean;
}
//# sourceMappingURL=python-process.d.ts.map