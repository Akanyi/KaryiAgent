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

import { StateMachine, AppState } from './state-machine';
import { useSessionStore } from '../../state/src';
import { IPCClient } from '../../ipc/src';

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
export class Orchestrator {
  private stateMachine: StateMachine;
  private config: OrchestratorConfig;
  private ipcClient: IPCClient;
  private isInitialized: boolean = false;
  
  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.stateMachine = new StateMachine(AppState.INITIALIZING);
    this.ipcClient = new IPCClient();
    
    // 订阅状态变化
    useSessionStore.subscribe((state: { isProcessing: boolean }) => {
      if (state.isProcessing) {
        this.stateMachine.transition(AppState.PROCESSING_INPUT);
      } else {
        if (this.stateMachine.getState() === AppState.PROCESSING_INPUT) {
          this.stateMachine.transition(AppState.IDLE);
        }
      }
    });
  }
  
  /**
   * 初始化编排器
   */
  async initialize(): Promise<void> {
    try {
      console.log('[Orchestrator] 初始化中...');
      
      // 启动 IPC 客户端
      await this.ipcClient.start();
      
      // 初始化 AI 提供商
      await this.ipcClient.request('ai_initialize', this.config.aiProvider);
      
      // 初始化会话
      useSessionStore.getState().startSession();
      
      this.isInitialized = true;
      this.stateMachine.transition(AppState.IDLE);
      
      console.log('[Orchestrator] 初始化完成 ✓');
    } catch (error) {
      console.error('[Orchestrator] 初始化失败:', error);
      this.stateMachine.transition(AppState.ERROR);
      throw error;
    }
  }
  
  /**
   * 处理用户输入
   */
  async processUserInput(input: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }
    
    const currentState = this.stateMachine.getState();
    if (currentState !== AppState.IDLE) {
      console.warn(`[Orchestrator] 当前状态 ${currentState} 不是 IDLE，忽略输入`);
      return;
    }
    
    try {
      // 状态转换: IDLE → PROCESSING_INPUT
      useSessionStore.getState().setProcessing(true);
      
      // 将用户消息添加到会话历史
      useSessionStore.getState().addMessage({ role: 'user', content: input });
      
      // 请求 AI 响应
      const aiResponse: AIResponse = await this.ipcClient.request('ai_request', {
        messages: useSessionStore.getState().messages,
        systemPrompt: this.config.systemPrompt,
        stream: this.config.streamResponse,
      });
      
      // 更新 Token 统计
      useSessionStore.getState().updateTokens(aiResponse.tokens.prompt, aiResponse.tokens.completion);
      
      // 将 AI 消息添加到会話历史
      useSessionStore.getState().addMessage({ role: 'assistant', content: aiResponse.content });
      
    } catch (error) {
      console.error('[Orchestrator] 处理输入失败:', error);
      this.stateMachine.transition(AppState.ERROR);
    } finally {
      // 状态转换: PROCESSING_INPUT → IDLE
      useSessionStore.getState().setProcessing(false);
    }
  }
  
  /**
   * 获取当前状态
   */
  getState(): AppState {
    return this.stateMachine.getState();
  }
  
  /**
   * 获取状态历史
   */
  getStateHistory(): AppState[] {
    return this.stateMachine.getHistory();
  }
  
  /**
   * 进入会话中心
   */
  enterSessionHub(): void {
    if (this.stateMachine.getState() === AppState.IDLE) {
      this.stateMachine.transition(AppState.SESSION_HUB);
    }
  }
  
  /**
   * 离开会话中心
   */
  leaveSessionHub(): void {
    if (this.stateMachine.getState() === AppState.SESSION_HUB) {
      this.stateMachine.transition(AppState.IDLE);
    }
  }
  
  /**
   * 关闭编排器
   */
  async shutdown(): Promise<void> {
    console.log('[Orchestrator] 关闭中...');
    
    // 状态转换到 SHUTTING_DOWN
    const currentState = this.stateMachine.getState();
    if (currentState === AppState.IDLE || 
        currentState === AppState.SESSION_HUB || 
        currentState === AppState.ERROR) {
      this.stateMachine.transition(AppState.SHUTTING_DOWN);
    }
    
    // 结束会话
    useSessionStore.getState().endSession();
    
    // 停止 IPC 客户端
    this.ipcClient.stop();
    
    console.log('[Orchestrator] 已关闭 ✓');
  }
}
