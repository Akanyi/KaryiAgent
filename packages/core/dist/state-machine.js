"use strict";
/**
 * State Machine - 应用状态机
 *
 * 定义 KaryiAgent 的所有可能状态和状态转换
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = exports.VALID_TRANSITIONS = exports.AppState = void 0;
var AppState;
(function (AppState) {
    /** 初始化中 */
    AppState["INITIALIZING"] = "INITIALIZING";
    /** 空闲 - 等待用户输入 */
    AppState["IDLE"] = "IDLE";
    /** 处理用户输入 */
    AppState["PROCESSING_INPUT"] = "PROCESSING_INPUT";
    /** 等待 AI 响应 */
    AppState["WAITING_AI_RESPONSE"] = "WAITING_AI_RESPONSE";
    /** 接收 AI 响应中（流式） */
    AppState["RECEIVING_AI_RESPONSE"] = "RECEIVING_AI_RESPONSE";
    /** 解析工具调用 */
    AppState["PARSING_TOOLS"] = "PARSING_TOOLS";
    /** 执行工具 */
    AppState["EXECUTING_TOOLS"] = "EXECUTING_TOOLS";
    /** 等待变量输入 */
    AppState["WAITING_VARIABLE_INPUT"] = "WAITING_VARIABLE_INPUT";
    /** 会话中心 */
    AppState["SESSION_HUB"] = "SESSION_HUB";
    /** Shell 接管模式 */
    AppState["SHELL_TAKEOVER"] = "SHELL_TAKEOVER";
    /** 错误状态 */
    AppState["ERROR"] = "ERROR";
    /** 关闭中 */
    AppState["SHUTTING_DOWN"] = "SHUTTING_DOWN";
})(AppState || (exports.AppState = AppState = {}));
/**
 * 有效的状态转换规则
 */
exports.VALID_TRANSITIONS = [
    // 初始化完成 → 空闲
    { from: AppState.INITIALIZING, to: AppState.IDLE },
    // 空闲 → 处理输入
    { from: AppState.IDLE, to: AppState.PROCESSING_INPUT },
    // 空闲 → 会话中心
    { from: AppState.IDLE, to: AppState.SESSION_HUB },
    // 处理输入 → 等待 AI
    { from: AppState.PROCESSING_INPUT, to: AppState.WAITING_AI_RESPONSE },
    // 等待 AI → 接收响应
    { from: AppState.WAITING_AI_RESPONSE, to: AppState.RECEIVING_AI_RESPONSE },
    // 接收响应 → 解析工具
    { from: AppState.RECEIVING_AI_RESPONSE, to: AppState.PARSING_TOOLS },
    // 接收响应 → 空闲（无工具调用）
    { from: AppState.RECEIVING_AI_RESPONSE, to: AppState.IDLE },
    // 解析工具 → 执行工具
    { from: AppState.PARSING_TOOLS, to: AppState.EXECUTING_TOOLS },
    // 解析工具 → 等待变量输入
    { from: AppState.PARSING_TOOLS, to: AppState.WAITING_VARIABLE_INPUT },
    // 执行工具 → 等待 AI（将结果返回给 AI）
    { from: AppState.EXECUTING_TOOLS, to: AppState.WAITING_AI_RESPONSE },
    // 执行工具 → 空闲（工具执行完成）
    { from: AppState.EXECUTING_TOOLS, to: AppState.IDLE },
    // 等待变量 → 解析工具（变量输入完成，继续解析）
    { from: AppState.WAITING_VARIABLE_INPUT, to: AppState.PARSING_TOOLS },
    // 会话中心 → 空闲（返回对话）
    { from: AppState.SESSION_HUB, to: AppState.IDLE },
    // 会话中心 → Shell 接管
    { from: AppState.SESSION_HUB, to: AppState.SHELL_TAKEOVER },
    // Shell 接管 → 会话中心
    { from: AppState.SHELL_TAKEOVER, to: AppState.SESSION_HUB },
    // 任何状态 → 错误
    { from: AppState.IDLE, to: AppState.ERROR },
    { from: AppState.PROCESSING_INPUT, to: AppState.ERROR },
    { from: AppState.WAITING_AI_RESPONSE, to: AppState.ERROR },
    { from: AppState.RECEIVING_AI_RESPONSE, to: AppState.ERROR },
    { from: AppState.PARSING_TOOLS, to: AppState.ERROR },
    { from: AppState.EXECUTING_TOOLS, to: AppState.ERROR },
    // 错误 → 空闲（错误恢复）
    { from: AppState.ERROR, to: AppState.IDLE },
    // 任何状态 → 关闭
    { from: AppState.IDLE, to: AppState.SHUTTING_DOWN },
    { from: AppState.SESSION_HUB, to: AppState.SHUTTING_DOWN },
    { from: AppState.ERROR, to: AppState.SHUTTING_DOWN },
];
/**
 * 状态机类
 */
class StateMachine {
    currentState;
    stateHistory = [];
    constructor(initialState = AppState.INITIALIZING) {
        this.currentState = initialState;
        this.stateHistory.push(initialState);
    }
    /**
     * 获取当前状态
     */
    getState() {
        return this.currentState;
    }
    /**
     * 检查状态转换是否有效
     */
    canTransition(to) {
        return exports.VALID_TRANSITIONS.some((t) => t.from === this.currentState && t.to === to);
    }
    /**
     * 执行状态转换
     */
    transition(to) {
        if (!this.canTransition(to)) {
            console.warn(`[StateMachine] Invalid transition: ${this.currentState} → ${to}`);
            return false;
        }
        console.log(`[StateMachine] ${this.currentState} → ${to}`);
        this.currentState = to;
        this.stateHistory.push(to);
        return true;
    }
    /**
     * 强制设置状态（谨慎使用）
     */
    forceState(state) {
        console.warn(`[StateMachine] Force state: ${this.currentState} → ${state}`);
        this.currentState = state;
        this.stateHistory.push(state);
    }
    /**
     * 获取状态历史
     */
    getHistory() {
        return [...this.stateHistory];
    }
    /**
     * 获取上一个状态
     */
    getPreviousState() {
        return this.stateHistory.length > 1
            ? this.stateHistory[this.stateHistory.length - 2]
            : null;
    }
}
exports.StateMachine = StateMachine;
//# sourceMappingURL=state-machine.js.map