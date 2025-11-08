export interface KaryiConfig {
    mcp?: {
        servers?: Array<{
            name: string;
            type: 'local' | 'remote';
            command?: string;
            args?: string[];
            url?: string;
        }>;
    };
    variables?: {
        mode: 'interactive' | 'warn';
    };
    [key: string]: any;
}
export declare class ConfigManager {
    private globalConfigPath;
    private projectConfigPath;
    constructor();
    /**
     * 获取合并后的配置（项目配置 > 全局配置）
     */
    getConfig(): KaryiConfig;
    /**
     * 获取指定键的配置值
     */
    get(key: string): any;
    /**
     * 设置全局配置
     */
    setGlobal(key: string, value: any): void;
    /**
     * 设置项目配置
     */
    setProject(key: string, value: any): void;
    /**
     * 加载配置文件
     */
    private loadConfig;
    /**
     * 保存配置文件
     */
    private saveConfig;
    /**
     * 深度合并配置对象
     */
    private mergeConfig;
    /**
     * 获取嵌套的配置值（支持点号分隔的键，如 "mcp.servers"）
     */
    private getNestedValue;
    /**
     * 设置嵌套的配置值
     */
    private setNestedValue;
}
//# sourceMappingURL=config-manager.d.ts.map