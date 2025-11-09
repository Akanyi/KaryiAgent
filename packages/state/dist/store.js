"use strict";
/**
 * State Store - 状态存储
 *
 * 使用 Zustand 实现的应用状态管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectIsPaused = exports.selectIsProcessing = exports.selectStats = exports.selectMessages = exports.useAppStore = void 0;
const zustand_1 = require("zustand");
const nanoid_1 = require("nanoid");
/**
 * 创建初始状态
 */
function createInitialState() {
    return {
        sessionId: (0, nanoid_1.nanoid)(),
        messages: [],
        stats: {
            startTime: Date.now(),
            duration: 0,
            messageCount: 0,
            totalTokens: 0,
            modifiedFiles: [],
            usedVariables: [],
        },
        isProcessing: false,
        isPaused: false,
        temporaryVariables: new Map(),
        modifiedFiles: new Set(),
    };
}
/**
 * 创建操作方法
 */
function createActions(set, get) {
    return {
        /**
         * 添加消息
         */
        addMessage: (message) => {
            const newMessage = {
                ...message,
                id: (0, nanoid_1.nanoid)(),
                timestamp: Date.now(),
            };
            set((state) => ({
                messages: [...state.messages, newMessage],
                stats: {
                    ...state.stats,
                    messageCount: state.stats.messageCount + 1,
                    totalTokens: state.stats.totalTokens + (newMessage.metadata?.tokens || 0),
                },
            }));
        },
        /**
         * 清空消息
         */
        clearMessages: () => {
            set({ messages: [] });
        },
        /**
         * 设置处理状态
         */
        setProcessing: (processing) => {
            set({ isProcessing: processing });
        },
        /**
         * 设置暂停状态
         */
        setPaused: (paused) => {
            set({ isPaused: paused });
        },
        /**
         * 添加修改的文件
         */
        addModifiedFile: (filepath) => {
            set((state) => {
                const newModifiedFiles = new Set(state.modifiedFiles);
                newModifiedFiles.add(filepath);
                return {
                    modifiedFiles: newModifiedFiles,
                    stats: {
                        ...state.stats,
                        modifiedFiles: Array.from(newModifiedFiles),
                    },
                };
            });
        },
        /**
         * 设置临时变量
         */
        setTemporaryVariable: (key, value) => {
            set((state) => {
                const newVariables = new Map(state.temporaryVariables);
                newVariables.set(key, value);
                const usedVariables = Array.from(newVariables.keys());
                return {
                    temporaryVariables: newVariables,
                    stats: {
                        ...state.stats,
                        usedVariables,
                    },
                };
            });
        },
        /**
         * 获取临时变量
         */
        getTemporaryVariable: (key) => {
            return get().temporaryVariables.get(key);
        },
        /**
         * 更新统计信息
         */
        updateStats: (updates) => {
            set((state) => ({
                stats: {
                    ...state.stats,
                    ...updates,
                    duration: Date.now() - state.stats.startTime,
                },
            }));
        },
        /**
         * 重置状态
         */
        reset: () => {
            set(createInitialState());
        },
    };
}
/**
 * 创建 Zustand store
 */
exports.useAppStore = (0, zustand_1.create)((set, get) => ({
    ...createInitialState(),
    ...createActions(set, get),
}));
/**
 * 导出选择器
 */
const selectMessages = (state) => state.messages;
exports.selectMessages = selectMessages;
const selectStats = (state) => state.stats;
exports.selectStats = selectStats;
const selectIsProcessing = (state) => state.isProcessing;
exports.selectIsProcessing = selectIsProcessing;
const selectIsPaused = (state) => state.isPaused;
exports.selectIsPaused = selectIsPaused;
//# sourceMappingURL=store.js.map