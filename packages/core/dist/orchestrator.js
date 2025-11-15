"use strict";
/**
 * Orchestrator - 核心编排器
 *
 * 协调整个应用的工作流程：
 * - 管理应用状态
 * - 处理用户输入
 * - 调用 AI
 * - 执行工具
 * - 管理会话状态
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const state_machine_1 = require("./state-machine");
const src_1 = require("../../state/src");
const src_2 = require("../../ipc/src");
/**
 * 核心编排器类
 */
class Orchestrator {
    stateMachine;
    config;
    ipcClient;
    isInitialized = false;
    constructor(config) {
        this.config = config;
        this.stateMachine = new state_machine_1.StateMachine(state_machine_1.AppState.INITIALIZING);
        this.ipcClient = new src_2.IPCClient();
        // 订阅状态变化
        src_1.useSessionStore.subscribe((state) => {
            if (state.isProcessing) {
                this.stateMachine.transition(state_machine_1.AppState.PROCESSING_INPUT);
            }
            else {
                if (this.stateMachine.getState() === state_machine_1.AppState.PROCESSING_INPUT) {
                    this.stateMachine.transition(state_machine_1.AppState.IDLE);
                }
            }
        });
    }
    /**
     * 初始化编排器
     */
    async initialize() {
        try {
            console.log('[Orchestrator] 初始化中...');
            // 启动 IPC 客户端
            await this.ipcClient.start();
            // 初始化 AI 提供商
            await this.ipcClient.request('ai_initialize', this.config.aiProvider);
            // 初始化会话
            src_1.useSessionStore.getState().startSession();
            this.isInitialized = true;
            this.stateMachine.transition(state_machine_1.AppState.IDLE);
            console.log('[Orchestrator] 初始化完成 ✓');
        }
        catch (error) {
            console.error('[Orchestrator] 初始化失败:', error);
            this.stateMachine.transition(state_machine_1.AppState.ERROR);
            throw error;
        }
    }
    /**
     * 处理用户输入
     */
    async processUserInput(input) {
        if (!this.isInitialized) {
            throw new Error('Orchestrator not initialized');
        }
        const currentState = this.stateMachine.getState();
        if (currentState !== state_machine_1.AppState.IDLE) {
            console.warn(`[Orchestrator] 当前状态 ${currentState} 不是 IDLE，忽略输入`);
            return;
        }
        try {
            // 状态转换: IDLE → PROCESSING_INPUT
            src_1.useSessionStore.getState().setProcessing(true);
            // 将用户消息添加到会话历史
            src_1.useSessionStore.getState().addMessage({ role: 'user', content: input });
            // 请求 AI 响应
            const aiResponse = await this.ipcClient.request('ai_request', {
                messages: src_1.useSessionStore.getState().messages,
                systemPrompt: this.config.systemPrompt,
                stream: this.config.streamResponse,
            });
            // 更新 Token 统计
            src_1.useSessionStore.getState().updateTokens(aiResponse.tokens.prompt, aiResponse.tokens.completion);
            // 将 AI 消息添加到会話历史
            src_1.useSessionStore.getState().addMessage({ role: 'assistant', content: aiResponse.content });
        }
        catch (error) {
            console.error('[Orchestrator] 处理输入失败:', error);
            this.stateMachine.transition(state_machine_1.AppState.ERROR);
        }
        finally {
            // 状态转换: PROCESSING_INPUT → IDLE
            src_1.useSessionStore.getState().setProcessing(false);
        }
    }
    /**
     * 获取当前状态
     */
    getState() {
        return this.stateMachine.getState();
    }
    /**
     * 获取状态历史
     */
    getStateHistory() {
        return this.stateMachine.getHistory();
    }
    /**
     * 进入会话中心
     */
    enterSessionHub() {
        if (this.stateMachine.getState() === state_machine_1.AppState.IDLE) {
            this.stateMachine.transition(state_machine_1.AppState.SESSION_HUB);
        }
    }
    /**
     * 离开会话中心
     */
    leaveSessionHub() {
        if (this.stateMachine.getState() === state_machine_1.AppState.SESSION_HUB) {
            this.stateMachine.transition(state_machine_1.AppState.IDLE);
        }
    }
    /**
     * 关闭编排器
     */
    async shutdown() {
        console.log('[Orchestrator] 关闭中...');
        // 状态转换到 SHUTTING_DOWN
        const currentState = this.stateMachine.getState();
        if (currentState === state_machine_1.AppState.IDLE ||
            currentState === state_machine_1.AppState.SESSION_HUB ||
            currentState === state_machine_1.AppState.ERROR) {
            this.stateMachine.transition(state_machine_1.AppState.SHUTTING_DOWN);
        }
        // 结束会话
        src_1.useSessionStore.getState().endSession();
        // 停止 IPC 客户端
        this.ipcClient.stop();
        console.log('[Orchestrator] 已关闭 ✓');
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=orchestrator.js.map