/**
 * State Types - 状态类型定义
 *
 * 定义会话状态、消息、统计等类型
 */
/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';
/**
 * 消息接口
 */
export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    metadata?: {
        tokens?: number;
        model?: string;
        toolCalls?: ToolCall[];
        [key: string]: any;
    };
}
/**
 * 工具调用
 */
export interface ToolCall {
    id: string;
    type: 'command' | 'edit' | 'read' | 'get_value' | 'mcp';
    xml: string;
    result?: any;
    error?: string;
}
/**
 * 会话统计
 */
export interface SessionStats {
    startTime: number;
    endTime?: number;
    duration: number;
    messageCount: number;
    totalTokens: number;
    modifiedFiles: string[];
    usedVariables: string[];
}
/**
 * 会话状态
 */
export interface SessionState {
    sessionId: string;
    messages: Message[];
    stats: SessionStats;
    isProcessing: boolean;
    isPaused: boolean;
    temporaryVariables: Map<string, string>;
    modifiedFiles: Set<string>;
}
/**
 * 应用状态
 */
export interface AppState extends SessionState {
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    clearMessages: () => void;
    setProcessing: (processing: boolean) => void;
    setPaused: (paused: boolean) => void;
    addModifiedFile: (filepath: string) => void;
    setTemporaryVariable: (key: string, value: string) => void;
    getTemporaryVariable: (key: string) => string | undefined;
    updateStats: (updates: Partial<SessionStats>) => void;
    reset: () => void;
}
//# sourceMappingURL=types.d.ts.map