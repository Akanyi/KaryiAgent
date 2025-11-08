"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ConfigManager {
    globalConfigPath;
    projectConfigPath;
    constructor() {
        // 全局配置：~/.karyi/config.json
        this.globalConfigPath = path.join(os.homedir(), '.karyi', 'config.json');
        // 项目配置：./.karyi/config.json
        this.projectConfigPath = path.join(process.cwd(), '.karyi', 'config.json');
    }
    /**
     * 获取合并后的配置（项目配置 > 全局配置）
     */
    getConfig() {
        const globalConfig = this.loadConfig(this.globalConfigPath);
        const projectConfig = this.loadConfig(this.projectConfigPath);
        // 深度合并，项目配置优先
        return this.mergeConfig(globalConfig, projectConfig);
    }
    /**
     * 获取指定键的配置值
     */
    get(key) {
        const config = this.getConfig();
        return this.getNestedValue(config, key);
    }
    /**
     * 设置全局配置
     */
    setGlobal(key, value) {
        const config = this.loadConfig(this.globalConfigPath);
        this.setNestedValue(config, key, value);
        this.saveConfig(this.globalConfigPath, config);
    }
    /**
     * 设置项目配置
     */
    setProject(key, value) {
        const config = this.loadConfig(this.projectConfigPath);
        this.setNestedValue(config, key, value);
        this.saveConfig(this.projectConfigPath, config);
    }
    /**
     * 加载配置文件
     */
    loadConfig(configPath) {
        try {
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf-8');
                return JSON.parse(content);
            }
        }
        catch (error) {
            console.error(`Failed to load config from ${configPath}:`, error);
        }
        return {};
    }
    /**
     * 保存配置文件
     */
    saveConfig(configPath, config) {
        try {
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        }
        catch (error) {
            console.error(`Failed to save config to ${configPath}:`, error);
            throw error;
        }
    }
    /**
     * 深度合并配置对象
     */
    mergeConfig(base, override) {
        const result = { ...base };
        for (const key in override) {
            if (typeof override[key] === 'object' && !Array.isArray(override[key]) && override[key] !== null) {
                result[key] = this.mergeConfig(base[key] || {}, override[key]);
            }
            else {
                result[key] = override[key];
            }
        }
        return result;
    }
    /**
     * 获取嵌套的配置值（支持点号分隔的键，如 "mcp.servers"）
     */
    getNestedValue(obj, key) {
        const keys = key.split('.');
        let value = obj;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    /**
     * 设置嵌套的配置值
     */
    setNestedValue(obj, key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
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
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map