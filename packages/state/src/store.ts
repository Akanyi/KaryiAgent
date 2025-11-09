/**
 * State Store - 状态存储
 * 
 * 使用 Zustand 实现的应用状态管理
 */

import { create } from 'zustand';
import { AppState, Message, SessionStats } from './types';
import { nanoid } from 'nanoid';

/**
 * 创建初始状态
 */
function createInitialState(): Omit<AppState, keyof ReturnType<typeof createActions>> {
  return {
    sessionId: nanoid(),
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
function createActions(set: any, get: any) {
  return {
    /**
     * 添加消息
     */
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
      const newMessage: Message = {
        ...message,
        id: nanoid(),
        timestamp: Date.now(),
      };

      set((state: AppState) => ({
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
    setProcessing: (processing: boolean) => {
      set({ isProcessing: processing });
    },

    /**
     * 设置暂停状态
     */
    setPaused: (paused: boolean) => {
      set({ isPaused: paused });
    },

    /**
     * 添加修改的文件
     */
    addModifiedFile: (filepath: string) => {
      set((state: AppState) => {
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
    setTemporaryVariable: (key: string, value: string) => {
      set((state: AppState) => {
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
    getTemporaryVariable: (key: string): string | undefined => {
      return get().temporaryVariables.get(key);
    },

    /**
     * 更新统计信息
     */
    updateStats: (updates: Partial<SessionStats>) => {
      set((state: AppState) => ({
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
export const useAppStore = create<AppState>((set, get) => ({
  ...createInitialState(),
  ...createActions(set, get),
}));

/**
 * 导出选择器
 */
export const selectMessages = (state: AppState) => state.messages;
export const selectStats = (state: AppState) => state.stats;
export const selectIsProcessing = (state: AppState) => state.isProcessing;
export const selectIsPaused = (state: AppState) => state.isPaused;
