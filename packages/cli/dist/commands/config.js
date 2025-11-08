"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_manager_1 = require("../utils/config-manager");
const configManager = new config_manager_1.ConfigManager();
exports.configCommand = new commander_1.Command('config')
    .description('Manage KaryiAgent configuration')
    .action(() => {
    console.log(chalk_1.default.yellow('Usage: karyi config <get|set> [options]'));
    console.log(chalk_1.default.gray('Run "karyi config --help" for more information'));
});
// karyi config get <key>
exports.configCommand
    .command('get')
    .argument('<key>', 'Configuration key to get (e.g., "mcp.servers")')
    .description('Get a configuration value')
    .action((key) => {
    try {
        const value = configManager.get(key);
        if (value === undefined) {
            console.log(chalk_1.default.yellow(`Configuration key "${key}" not found`));
            return;
        }
        if (typeof value === 'object') {
            console.log(chalk_1.default.cyan(key + ':'));
            console.log(JSON.stringify(value, null, 2));
        }
        else {
            console.log(chalk_1.default.cyan(`${key}: `) + chalk_1.default.white(value));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error getting configuration:'), error);
    }
});
// karyi config set <key> <value> [--global]
exports.configCommand
    .command('set')
    .argument('<key>', 'Configuration key to set')
    .argument('<value>', 'Configuration value (JSON string for objects)')
    .option('-g, --global', 'Set in global config (~/.karyi/config.json)')
    .description('Set a configuration value')
    .action((key, value, options) => {
    try {
        // 尝试将值解析为 JSON，如果失败则作为字符串
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        }
        catch {
            parsedValue = value;
        }
        if (options.global) {
            configManager.setGlobal(key, parsedValue);
            console.log(chalk_1.default.green(`✓ Set global config: ${key}`));
        }
        else {
            configManager.setProject(key, parsedValue);
            console.log(chalk_1.default.green(`✓ Set project config: ${key}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error setting configuration:'), error);
    }
});
// karyi config list
exports.configCommand
    .command('list')
    .description('List all configuration')
    .action(() => {
    try {
        const config = configManager.getConfig();
        console.log(chalk_1.default.cyan('Current configuration:'));
        console.log(JSON.stringify(config, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error listing configuration:'), error);
    }
});
//# sourceMappingURL=config.js.map