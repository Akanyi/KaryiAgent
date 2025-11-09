/**
 * JSON-RPC Client
 * 
 * Provides a high-level interface for communicating with the Python backend
 * using JSON-RPC 2.0 protocol over stdin/stdout.
 */

import { Readable, Writable } from 'stream';
import { EventEmitter } from 'events';
import * as readline from 'readline';

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class JSONRPCClient extends EventEmitter {
  private stdin: Writable;
  private stdout: Readable;
  private requestId: number = 0;
  private pendingRequests: Map<number | string, {
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private rl: readline.Interface;

  constructor(stdin: Writable, stdout: Readable) {
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
  async request(method: string, params?: any, timeout: number = 30000): Promise<any> {
    const id = ++this.requestId;
    
    const request: JSONRPCRequest = {
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
      } catch (error) {
        this.pendingRequests.delete(id);
        clearTimeout(timeoutHandle);
        reject(error);
      }
    });
  }

  /**
   * 处理来自 Python 的响应
   */
  private handleResponse(line: string): void {
    try {
      const response: JSONRPCResponse = JSON.parse(line);
      
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
        (error as any).code = response.error.code;
        (error as any).data = response.error.data;
        pending.reject(error);
        this.emit('error', error);
      } else {
        pending.resolve(response.result);
        this.emit('response', response.result);
      }
    } catch (error) {
      this.emit('error', new Error(`Failed to parse JSON-RPC response: ${line}`));
    }
  }

  /**
   * 关闭客户端
   */
  close(): void {
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
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}
