"use strict";
/**
 * @karyi/core - Core Orchestrator Module
 *
 * 核心编排器模块，负责协调整个应用的工作流程
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = exports.VALID_TRANSITIONS = exports.AppState = exports.StateMachine = void 0;
// 导出状态机
var state_machine_1 = require("./state-machine");
Object.defineProperty(exports, "StateMachine", { enumerable: true, get: function () { return state_machine_1.StateMachine; } });
Object.defineProperty(exports, "AppState", { enumerable: true, get: function () { return state_machine_1.AppState; } });
Object.defineProperty(exports, "VALID_TRANSITIONS", { enumerable: true, get: function () { return state_machine_1.VALID_TRANSITIONS; } });
// 导出编排器
var orchestrator_1 = require("./orchestrator");
Object.defineProperty(exports, "Orchestrator", { enumerable: true, get: function () { return orchestrator_1.Orchestrator; } });
//# sourceMappingURL=index.js.map