/**
 * IPC Module - Inter-Process Communication
 *
 * Provides a unified interface for communicating with the Python backend.
 * Combines process management and JSON-RPC client into a single API.
 */
import { PythonProcessOptions } from './python-process';
import { EventEmitter } from 'events';
export interface IPCClientOptions extends PythonProcessOptions {
    autoStart?: boolean;
}
/**
 * IPC Client - 统一的 IPC 接口
 *
 * 结合了 Python 进程管理和 JSON-RPC 通信
 */
export declare class IPCClient extends EventEmitter {
    private pythonProcess;
    private rpcClient;
    private options;
    constructor(options?: IPCClientOptions);
    /**
     * 启动 IPC 客户端
     */
    start(): Promise<void>;
    /**
     * 停止 IPC 客户端
     */
    stop(): Promise<void>;
    /**
     * 重启 IPC 客户端
     */
    restart(): Promise<void>;
    /**
     * 发送 JSON-RPC 请求
     */
    request(method: string, params?: any, timeout?: number): Promise<any>;
    /**
     * Ping 测试
     */
    ping(): Promise<string>;
    /**
     * Echo 测试
     */
    echo(data: any): Promise<any>;
    /**
     * 检查是否就绪
     */
    isReady(): boolean;
    /**
     * 设置 JSON-RPC 客户端
     */
    private setupRPCClient;
}
export { PythonProcess, PythonProcessOptions } from './python-process';
export { JSONRPCClient } from './jsonrpc-client';
//# sourceMappingURL=index.d.ts.map