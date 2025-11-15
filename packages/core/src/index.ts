/**
 * @karyi/core - Core Orchestrator Module
 * 
 * 核心编排器模块，负责协调整个应用的工作流程
 */

// 导出状态机
export { StateMachine, AppState, VALID_TRANSITIONS } from './state-machine';
export type { StateTransition } from './state-machine';

// 导出编排器
export { Orchestrator } from './orchestrator';
export type { OrchestratorConfig, AIResponse } from './orchestrator';
