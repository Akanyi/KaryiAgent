/**
 * IPC Module - Inter-Process Communication
 * 
 * Provides a unified interface for communicating with the Python backend.
 * Combines process management and JSON-RPC client into a single API.
 */

import { PythonProcess, PythonProcessOptions } from './python-process';
import { JSONRPCClient } from './jsonrpc-client';
import { EventEmitter } from 'events';

export interface IPCClientOptions extends PythonProcessOptions {
  autoStart?: boolean;
}

/**
 * IPC Client - 统一的 IPC 接口
 * 
 * 结合了 Python 进程管理和 JSON-RPC 通信
 */
export class IPCClient extends EventEmitter {
  private pythonProcess: PythonProcess;
  private rpcClient: JSONRPCClient | null = null;
  private options: IPCClientOptions;

  constructor(options: IPCClientOptions = {}) {
    super();
    this.options = options;
    this.pythonProcess = new PythonProcess(options);

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
  async start(): Promise<void> {
    await this.pythonProcess.start();
  }

  /**
   * 停止 IPC 客户端
   */
  async stop(): Promise<void> {
    if (this.rpcClient) {
      this.rpcClient.close();
      this.rpcClient = null;
    }
    await this.pythonProcess.stop();
  }

  /**
   * 重启 IPC 客户端
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * 发送 JSON-RPC 请求
   */
  async request(method: string, params?: any, timeout?: number): Promise<any> {
    if (!this.rpcClient) {
      throw new Error('IPC client not ready. Call start() first.');
    }
    return this.rpcClient.request(method, params, timeout);
  }

  /**
   * Ping 测试
   */
  async ping(): Promise<string> {
    return this.request('ping');
  }

  /**
   * Echo 测试
   */
  async echo(data: any): Promise<any> {
    return this.request('echo', data);
  }

  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    return this.pythonProcess.isAlive() && this.rpcClient !== null;
  }

  /**
   * 设置 JSON-RPC 客户端
   */
  private setupRPCClient(): void {
    const stdin = this.pythonProcess.getStdin();
    const stdout = this.pythonProcess.getStdout();

    if (!stdin || !stdout) {
      throw new Error('Failed to get stdin/stdout from Python process');
    }

    this.rpcClient = new JSONRPCClient(stdin, stdout);

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

// 导出所有类型和类
export { PythonProcess, PythonProcessOptions } from './python-process';
export { JSONRPCClient } from './jsonrpc-client';
