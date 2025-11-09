"use strict";
/**
 * IPC Module - Inter-Process Communication
 *
 * Provides a unified interface for communicating with the Python backend.
 * Combines process management and JSON-RPC client into a single API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCClient = exports.PythonProcess = exports.IPCClient = void 0;
const python_process_1 = require("./python-process");
const jsonrpc_client_1 = require("./jsonrpc-client");
const events_1 = require("events");
/**
 * IPC Client - 统一的 IPC 接口
 *
 * 结合了 Python 进程管理和 JSON-RPC 通信
 */
class IPCClient extends events_1.EventEmitter {
    pythonProcess;
    rpcClient = null;
    options;
    constructor(options = {}) {
        super();
        this.options = options;
        this.pythonProcess = new python_process_1.PythonProcess(options);
        // 转发 Python 进程事件
        this.pythonProcess.on('error', (error) => this.emit('error', error));
        this.pythonProcess.on('exit', (code, signal) => this.emit('exit', code, signal));
        this.pythonProcess.on('log', (message) => this.emit('log', message));
        this.pythonProcess.on('ready', () => {
            this.setupRPCClient();
            this.emit('ready');
        });
    }
    /**
     * 启动 IPC 客户端
     */
    async start() {
        await this.pythonProcess.start();
    }
    /**
     * 停止 IPC 客户端
     */
    async stop() {
        if (this.rpcClient) {
            this.rpcClient.close();
            this.rpcClient = null;
        }
        await this.pythonProcess.stop();
    }
    /**
     * 重启 IPC 客户端
     */
    async restart() {
        await this.stop();
        await this.start();
    }
    /**
     * 发送 JSON-RPC 请求
     */
    async request(method, params, timeout) {
        if (!this.rpcClient) {
            throw new Error('IPC client not ready. Call start() first.');
        }
        return this.rpcClient.request(method, params, timeout);
    }
    /**
     * Ping 测试
     */
    async ping() {
        return this.request('ping');
    }
    /**
     * Echo 测试
     */
    async echo(data) {
        return this.request('echo', data);
    }
    /**
     * 检查是否就绪
     */
    isReady() {
        return this.pythonProcess.isAlive() && this.rpcClient !== null;
    }
    /**
     * 设置 JSON-RPC 客户端
     */
    setupRPCClient() {
        const stdin = this.pythonProcess.getStdin();
        const stdout = this.pythonProcess.getStdout();
        if (!stdin || !stdout) {
            throw new Error('Failed to get stdin/stdout from Python process');
        }
        this.rpcClient = new jsonrpc_client_1.JSONRPCClient(stdin, stdout);
        // 转发 RPC 事件
        this.rpcClient.on('request', (method, params) => {
            this.emit('rpc:request', method, params);
        });
        this.rpcClient.on('response', (result) => {
            this.emit('rpc:response', result);
        });
        this.rpcClient.on('error', (error) => {
            this.emit('rpc:error', error);
        });
    }
}
exports.IPCClient = IPCClient;
// 导出所有类型和类
var python_process_2 = require("./python-process");
Object.defineProperty(exports, "PythonProcess", { enumerable: true, get: function () { return python_process_2.PythonProcess; } });
var jsonrpc_client_2 = require("./jsonrpc-client");
Object.defineProperty(exports, "JSONRPCClient", { enumerable: true, get: function () { return jsonrpc_client_2.JSONRPCClient; } });
//# sourceMappingURL=index.js.map