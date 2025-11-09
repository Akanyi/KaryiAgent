"use strict";
/**
 * Python Process Manager
 *
 * Manages the lifecycle of the Python backend process,
 * including starting, stopping, and monitoring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonProcess = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const events_1 = require("events");
class PythonProcess extends events_1.EventEmitter {
    process = null;
    options;
    isRunning = false;
    constructor(options = {}) {
        super();
        // 默认配置
        this.options = {
            pythonPath: options.pythonPath || 'python',
            scriptPath: options.scriptPath || (0, path_1.join)(process.cwd(), 'python', 'main.py'),
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
        };
    }
    /**
     * 启动 Python 进程
     */
    async start() {
        if (this.isRunning) {
            throw new Error('Python process is already running');
        }
        return new Promise((resolve, reject) => {
            try {
                // 启动 Python 进程
                this.process = (0, child_process_1.spawn)(this.options.pythonPath, [this.options.scriptPath], {
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
                const startupHandler = (data) => {
                    const message = data.toString();
                    if (message.includes('KaryiAgent Python Engine started')) {
                        clearTimeout(startupTimeout);
                        this.process.stderr?.removeListener('data', startupHandler);
                        this.isRunning = true;
                        this.emit('ready');
                        resolve();
                    }
                };
                this.process.stderr?.on('data', startupHandler);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * 停止 Python 进程
     */
    async stop() {
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
    async restart() {
        await this.stop();
        await this.start();
    }
    /**
     * 获取 stdin 流（用于发送 JSON-RPC 请求）
     */
    getStdin() {
        return this.process?.stdin || null;
    }
    /**
     * 获取 stdout 流（用于接收 JSON-RPC 响应）
     */
    getStdout() {
        return this.process?.stdout || null;
    }
    /**
     * 检查进程是否正在运行
     */
    isAlive() {
        return this.isRunning && this.process !== null;
    }
}
exports.PythonProcess = PythonProcess;
//# sourceMappingURL=python-process.js.map