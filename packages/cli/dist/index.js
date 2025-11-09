#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const config_1 = require("./commands/config");
const program = new commander_1.Command();
// 显示欢迎横幅
function showBanner() {
    console.log(chalk_1.default.cyan(figlet_1.default.textSync('KaryiAgent', {
        font: 'Standard',
        horizontalLayout: 'default',
    })));
    console.log(chalk_1.default.gray('  A powerful AI-powered terminal assistant\n'));
}
program
    .name('karyi')
    .version('0.1.0')
    .description('KaryiAgent - AI-powered terminal assistant with security and auditing')
    .action(() => {
    showBanner();
    console.log(chalk_1.default.yellow('Starting KaryiAgent TUI...\n'));
    // 启动 TUI 界面
    setTimeout(async () => {
        try {
            // 动态导入 ES Module
            // @ts-ignore @karyi/tui 
            const { startTUI } = await import('@karyi/tui');
            await startTUI();
        }
        catch (error) {
            console.error(chalk_1.default.red('Failed to start TUI:'), error);
            console.log(chalk_1.default.gray('Make sure @karyi/tui is built: cd packages/tui && npm run build'));
        }
    }, 1000);
});
// 配置管理命令
program.addCommand(config_1.configCommand);
// 扫描命令（占位）
program
    .command('scan')
    .description('Scan project for risks and tech stack')
    .action(() => {
    console.log(chalk_1.default.yellow('Project scanning...'));
    console.log(chalk_1.default.gray('Scanner not implemented yet. Coming soon!'));
});
// 历史命令（占位）
program
    .command('history')
    .description('View AI modification history')
    .action(() => {
    console.log(chalk_1.default.yellow('Loading history...'));
    console.log(chalk_1.default.gray('History viewer not implemented yet. Coming soon!'));
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map