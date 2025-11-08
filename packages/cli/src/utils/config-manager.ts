import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

export class ConfigManager {
  private globalConfigPath: string;
  private projectConfigPath: string;

  constructor() {
    // 全局配置：~/.karyi/config.json
    this.globalConfigPath = path.join(os.homedir(), '.karyi', 'config.json');
    
    // 项目配置：./.karyi/config.json
    this.projectConfigPath = path.join(process.cwd(), '.karyi', 'config.json');
  }

  /**
   * 获取合并后的配置（项目配置 > 全局配置）
   */
  getConfig(): KaryiConfig {
    const globalConfig = this.loadConfig(this.globalConfigPath);
    const projectConfig = this.loadConfig(this.projectConfigPath);
    
    // 深度合并，项目配置优先
    return this.mergeConfig(globalConfig, projectConfig);
  }

  /**
   * 获取指定键的配置值
   */
  get(key: string): any {
    const config = this.getConfig();
    return this.getNestedValue(config, key);
  }

  /**
   * 设置全局配置
   */
  setGlobal(key: string, value: any): void {
    const config = this.loadConfig(this.globalConfigPath);
    this.setNestedValue(config, key, value);
    this.saveConfig(this.globalConfigPath, config);
  }

  /**
   * 设置项目配置
   */
  setProject(key: string, value: any): void {
    const config = this.loadConfig(this.projectConfigPath);
    this.setNestedValue(config, key, value);
    this.saveConfig(this.projectConfigPath, config);
  }

  /**
   * 加载配置文件
   */
  private loadConfig(configPath: string): KaryiConfig {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Failed to load config from ${configPath}:`, error);
    }
    return {};
  }

  /**
   * 保存配置文件
   */
  private saveConfig(configPath: string, config: KaryiConfig): void {
    try {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save config to ${configPath}:`, error);
      throw error;
    }
  }

  /**
   * 深度合并配置对象
   */
  private mergeConfig(base: KaryiConfig, override: KaryiConfig): KaryiConfig {
    const result = { ...base };
    
    for (const key in override) {
      if (typeof override[key] === 'object' && !Array.isArray(override[key]) && override[key] !== null) {
        result[key] = this.mergeConfig(
          (base[key] as KaryiConfig) || {},
          override[key] as KaryiConfig
        );
      } else {
        result[key] = override[key];
      }
    }
    
    return result;
  }

  /**
   * 获取嵌套的配置值（支持点号分隔的键，如 "mcp.servers"）
   */
  private getNestedValue(obj: any, key: string): any {
    const keys = key.split('.');
    let value = obj;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * 设置嵌套的配置值
   */
  private setNestedValue(obj: any, key: string, value: any): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[lastKey] = value;
  }
}
