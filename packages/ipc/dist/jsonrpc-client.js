"use strict";
/**
 * JSON-RPC Client
 *
 * Provides a high-level interface for communicating with the Python backend
 * using JSON-RPC 2.0 protocol over stdin/stdout.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCClient = void 0;
const events_1 = require("events");
const readline = __importStar(require("readline"));
class JSONRPCClient extends events_1.EventEmitter {
    stdin;
    stdout;
    requestId = 0;
    pendingRequests = new Map();
    rl;
    constructor(stdin, stdout) {
        super();
        this.stdin = stdin;
        this.stdout = stdout;
        // 使用 readline 逐行读取 stdout
        this.rl = readline.createInterface({
            input: stdout,
            crlfDelay: Infinity,
        });
        this.rl.on('line', (line) => {
            this.handleResponse(line);
        });
        this.rl.on('close', () => {
            this.emit('close');
        });
    }
    /**
     * 发送 JSON-RPC 请求
     */
    async request(method, params, timeout = 30000) {
        const id = ++this.requestId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params,
        };
        return new Promise((resolve, reject) => {
            // 设置超时
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request timeout: ${method}`));
            }, timeout);
            // 保存待处理的请求
            this.pendingRequests.set(id, {
                resolve,
                reject,
                timeout: timeoutHandle,
            });
            // 发送请求
            try {
                const requestStr = JSON.stringify(request) + '\n';
                this.stdin.write(requestStr);
                this.emit('request', method, params);
            }
            catch (error) {
                this.pendingRequests.delete(id);
                clearTimeout(timeoutHandle);
                reject(error);
            }
        });
    }
    /**
     * 处理来自 Python 的响应
     */
    handleResponse(line) {
        try {
            const response = JSON.parse(line);
            const pending = this.pendingRequests.get(response.id);
            if (!pending) {
                this.emit('warning', `Received response for unknown request ID: ${response.id}`);
                return;
            }
            // 清理
            this.pendingRequests.delete(response.id);
            clearTimeout(pending.timeout);
            // 处理响应
            if (response.error) {
                const error = new Error(response.error.message);
                error.code = response.error.code;
                error.data = response.error.data;
                pending.reject(error);
                this.emit('error', error);
            }
            else {
                pending.resolve(response.result);
                this.emit('response', response.result);
            }
        }
        catch (error) {
            this.emit('error', new Error(`Failed to parse JSON-RPC response: ${line}`));
        }
    }
    /**
     * 关闭客户端
     */
    close() {
        // 拒绝所有待处理的请求
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Client closed'));
        }
        this.pendingRequests.clear();
        // 关闭 readline
        this.rl.close();
    }
    /**
     * 获取待处理请求数量
     */
    getPendingCount() {
        return this.pendingRequests.size;
    }
}
exports.JSONRPCClient = JSONRPCClient;
//# sourceMappingURL=jsonrpc-client.js.map