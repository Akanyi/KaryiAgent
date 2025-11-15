/**
 * State Machine - 应用状态机
 *
 * 定义 KaryiAgent 的所有可能状态和状态转换
 */
export declare enum AppState {
    /** 初始化中 */
    INITIALIZING = "INITIALIZING",
    /** 空闲 - 等待用户输入 */
    IDLE = "IDLE",
    /** 处理用户输入 */
    PROCESSING_INPUT = "PROCESSING_INPUT",
    /** 等待 AI 响应 */
    WAITING_AI_RESPONSE = "WAITING_AI_RESPONSE",
    /** 接收 AI 响应中（流式） */
    RECEIVING_AI_RESPONSE = "RECEIVING_AI_RESPONSE",
    /** 解析工具调用 */
    PARSING_TOOLS = "PARSING_TOOLS",
    /** 执行工具 */
    EXECUTING_TOOLS = "EXECUTING_TOOLS",
    /** 等待变量输入 */
    WAITING_VARIABLE_INPUT = "WAITING_VARIABLE_INPUT",
    /** 会话中心 */
    SESSION_HUB = "SESSION_HUB",
    /** Shell 接管模式 */
    SHELL_TAKEOVER = "SHELL_TAKEOVER",
    /** 错误状态 */
    ERROR = "ERROR",
    /** 关闭中 */
    SHUTTING_DOWN = "SHUTTING_DOWN"
}
export type StateTransition = {
    from: AppState;
    to: AppState;
    trigger?: string;
};
/**
 * 有效的状态转换规则
 */
export declare const VALID_TRANSITIONS: StateTransition[];
/**
 * 状态机类
 */
export declare class StateMachine {
    private currentState;
    private stateHistory;
    constructor(initialState?: AppState);
    /**
     * 获取当前状态
     */
    getState(): AppState;
    /**
     * 检查状态转换是否有效
     */
    canTransition(to: AppState): boolean;
    /**
     * 执行状态转换
     */
    transition(to: AppState): boolean;
    /**
     * 强制设置状态（谨慎使用）
     */
    forceState(state: AppState): void;
    /**
     * 获取状态历史
     */
    getHistory(): AppState[];
    /**
     * 获取上一个状态
     */
    getPreviousState(): AppState | null;
}
//# sourceMappingURL=state-machine.d.ts.map