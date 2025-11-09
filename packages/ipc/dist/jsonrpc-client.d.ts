/**
 * JSON-RPC Client
 *
 * Provides a high-level interface for communicating with the Python backend
 * using JSON-RPC 2.0 protocol over stdin/stdout.
 */
import { Readable, Writable } from 'stream';
import { EventEmitter } from 'events';
export declare class JSONRPCClient extends EventEmitter {
    private stdin;
    private stdout;
    private requestId;
    private pendingRequests;
    private rl;
    constructor(stdin: Writable, stdout: Readable);
    /**
     * 发送 JSON-RPC 请求
     */
    request(method: string, params?: any, timeout?: number): Promise<any>;
    /**
     * 处理来自 Python 的响应
     */
    private handleResponse;
    /**
     * 关闭客户端
     */
    close(): void;
    /**
     * 获取待处理请求数量
     */
    getPendingCount(): number;
}
//# sourceMappingURL=jsonrpc-client.d.ts.map