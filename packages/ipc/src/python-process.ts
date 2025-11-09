/**
 * Python Process Manager
 * 
 * Manages the lifecycle of the Python backend process,
 * including starting, stopping, and monitoring.
 */

import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { EventEmitter } from 'events';

export interface PythonProcessOptions {
  pythonPath?: string;
  scriptPath?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export class PythonProcess extends EventEmitter {
  private process: ChildProcess | null = null;
  private options: Required<PythonProcessOptions>;
  private isRunning: boolean = false;

  constructor(options: PythonProcessOptions = {}) {
    super();
    
    // 默认配置
    this.options = {
      pythonPath: options.pythonPath || 'python',
      scriptPath: options.scriptPath || join(process.cwd(), 'python', 'main.py'),
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
    };
  }

  /**
   * 启动 Python 进程
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Python process is already running');
    }

    return new Promise((resolve, reject) => {
      try {
        // 启动 Python 进程
        this.process = spawn(this.options.pythonPath, [this.options.scriptPath], {
          cwd: this.options.cwd,
          env: this.options.env,
          stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
        });

        // 监听进程事件
        this.process.on('error', (error) => {
          this.emit('error', error);
          reject(error);
        });

        this.process.on('exit', (code, signal) => {
          this.isRunning = false;
          this.emit('exit', code, signal);
        });

        // stderr 用于日志输出
        this.process.stderr?.on('data', (data) => {
          const message = data.toString().trim();
          this.emit('log', message);
        });

        // 等待进程启动成功的信号
        const startupTimeout = setTimeout(() => {
          reject(new Error('Python process startup timeout'));
        }, 5000);

        // 监听 stderr 的启动消息
        const startupHandler = (data: Buffer) => {
          const message = data.toString();
          if (message.includes('KaryiAgent Python Engine started')) {
            clearTimeout(startupTimeout);
            this.process!.stderr?.removeListener('data', startupHandler);
            this.isRunning = true;
            this.emit('ready');
            resolve();
          }
        };

        this.process.stderr?.on('data', startupHandler);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 停止 Python 进程
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.process) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      // 监听退出事件
      this.process.once('exit', () => {
        this.process = null;
        this.isRunning = false;
        resolve();
      });

      // 发送 SIGTERM 信号
      this.process.kill('SIGTERM');

      // 超时后强制终止
      setTimeout(() => {
        if (this.process && this.isRunning) {
          this.process.kill('SIGKILL');
        }
      }, 3000);
    });
  }

  /**
   * 重启 Python 进程
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * 获取 stdin 流（用于发送 JSON-RPC 请求）
   */
  getStdin(): import('stream').Writable | null {
    return this.process?.stdin || null;
  }

  /**
   * 获取 stdout 流（用于接收 JSON-RPC 响应）
   */
  getStdout(): import('stream').Readable | null {
    return this.process?.stdout || null;
  }

  /**
   * 检查进程是否正在运行
   */
  isAlive(): boolean {
    return this.isRunning && this.process !== null;
  }
}
