#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { configCommand } from './commands/config';

const program = new Command();

// 显示欢迎横幅
function showBanner() {
  console.log(
    chalk.cyan(
      figlet.textSync('KaryiAgent', {
        font: 'Standard',
        horizontalLayout: 'default',
      })
    )
  );
  console.log(chalk.gray('  A powerful AI-powered terminal assistant\n'));
}

program
  .name('karyi')
  .version('0.1.0')
  .description('KaryiAgent - AI-powered terminal assistant with security and auditing')
  .action(() => {
    showBanner();
    console.log(chalk.yellow('Starting KaryiAgent TUI...\n'));
    
    // 启动 TUI 界面
    setTimeout(async () => {
      try {
        // 动态导入 ES Module
        // @ts-ignore @karyi/tui 
        const { startTUI } = await import('@karyi/tui');
        await startTUI();
      } catch (error) {
        console.error(chalk.red('Failed to start TUI:'), error);
        console.log(chalk.gray('Make sure @karyi/tui is built: cd packages/tui && npm run build'));
      }
    }, 1000);
  });

// 配置管理命令
program.addCommand(configCommand);

// 扫描命令（占位）
program
  .command('scan')
  .description('Scan project for risks and tech stack')
  .action(() => {
    console.log(chalk.yellow('Project scanning...'));
    console.log(chalk.gray('Scanner not implemented yet. Coming soon!'));
  });

// 历史命令（占位）
program
  .command('history')
  .description('View AI modification history')
  .action(() => {
    console.log(chalk.yellow('Loading history...'));
    console.log(chalk.gray('History viewer not implemented yet. Coming soon!'));
  });

program.parse(process.argv);
