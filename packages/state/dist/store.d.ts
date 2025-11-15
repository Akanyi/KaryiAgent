/**
 * State Store - 状态存储
 *
 * 使用 Zustand 实现的应用状态管理
 */
import { AppState, Message, SessionStats } from './types';
/**
 * 创建 Zustand store
 */
export declare const useAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
/**
 * 会话 Store 别名（为了兼容）
 */
export declare const useSessionStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
/**
 * 导出选择器
 */
export declare const selectMessages: (state: AppState) => Message[];
export declare const selectStats: (state: AppState) => SessionStats;
export declare const selectIsProcessing: (state: AppState) => boolean;
export declare const selectIsPaused: (state: AppState) => boolean;
//# sourceMappingURL=store.d.ts.map