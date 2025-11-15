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
import { AppState } from './state-machine';
export interface OrchestratorConfig {
    /** AI 提供商配置 */
    aiProvider: {
        provider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'openai-compatible';
        apiKey: string;
        model?: string;
        baseUrl?: string;
        temperature?: number;
        maxTokens?: number;
    };
    /** System Prompt */
    systemPrompt?: string;
    /** 是否启用流式响应 */
    streamResponse?: boolean;
}
export interface AIResponse {
    content: string;
    model: string;
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    finishReason: string;
}
/**
 * 核心编排器类
 */
export declare class Orchestrator {
    private stateMachine;
    private config;
    private ipcClient;
    private isInitialized;
    constructor(config: OrchestratorConfig);
    /**
     * 初始化编排器
     */
    initialize(): Promise<void>;
    /**
     * 处理用户输入
     */
    processUserInput(input: string): Promise<void>;
    /**
     * 获取当前状态
     */
    getState(): AppState;
    /**
     * 获取状态历史
     */
    getStateHistory(): AppState[];
    /**
     * 进入会话中心
     */
    enterSessionHub(): void;
    /**
     * 离开会话中心
     */
    leaveSessionHub(): void;
    /**
     * 关闭编排器
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=orchestrator.d.ts.map