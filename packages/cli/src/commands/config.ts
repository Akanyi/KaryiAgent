import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '../utils/config-manager';

const configManager = new ConfigManager();

export const configCommand = new Command('config')
  .description('Manage KaryiAgent configuration')
  .action(() => {
    console.log(chalk.yellow('Usage: karyi config <get|set> [options]'));
    console.log(chalk.gray('Run "karyi config --help" for more information'));
  });

// karyi config get <key>
configCommand
  .command('get')
  .argument('<key>', 'Configuration key to get (e.g., "mcp.servers")')
  .description('Get a configuration value')
  .action((key: string) => {
    try {
      const value = configManager.get(key);
      
      if (value === undefined) {
        console.log(chalk.yellow(`Configuration key "${key}" not found`));
        return;
      }
      
      if (typeof value === 'object') {
        console.log(chalk.cyan(key + ':'));
        console.log(JSON.stringify(value, null, 2));
      } else {
        console.log(chalk.cyan(`${key}: `) + chalk.white(value));
      }
    } catch (error) {
      console.error(chalk.red('Error getting configuration:'), error);
    }
  });

// karyi config set <key> <value> [--global]
configCommand
  .command('set')
  .argument('<key>', 'Configuration key to set')
  .argument('<value>', 'Configuration value (JSON string for objects)')
  .option('-g, --global', 'Set in global config (~/.karyi/config.json)')
  .description('Set a configuration value')
  .action((key: string, value: string, options: { global?: boolean }) => {
    try {
      // 尝试将值解析为 JSON，如果失败则作为字符串
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
      
      if (options.global) {
        configManager.setGlobal(key, parsedValue);
        console.log(chalk.green(`✓ Set global config: ${key}`));
      } else {
        configManager.setProject(key, parsedValue);
        console.log(chalk.green(`✓ Set project config: ${key}`));
      }
    } catch (error) {
      console.error(chalk.red('Error setting configuration:'), error);
    }
  });

// karyi config list
configCommand
  .command('list')
  .description('List all configuration')
  .action(() => {
    try {
      const config = configManager.getConfig();
      console.log(chalk.cyan('Current configuration:'));
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(chalk.red('Error listing configuration:'), error);
    }
  });
