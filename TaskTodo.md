# KaryiAgent 开发任务清单

## 阶段一：基础框架搭建 (1-2 天)

### 1.1 项目结构初始化

- [x] 配置根 package.json (npm workspaces)
- [x] 创建 packages/ 目录结构
- [x] 配置根 tsconfig.json
- [x] 配置 .npmrc

### 1.2 @karyi/cli 模块

- [x] 创建 packages/cli/ 基础结构
- [x] 配置 cli/package.json 和 cli/tsconfig.json
- [x] 实现 src/index.ts 主入口
- [x] 使用 commander.js 实现命令框架
- [x] 实现 `karyi` 命令基础逻辑
- [x] 实现 `karyi config get/set` 命令
- [x] 添加 figlet 欢迎横幅
- [x] 配置 bin/ 目录和可执行文件

### 1.3 @karyi/tui 模块

- [x] 创建 packages/tui/ 基础结构
- [x] 配置 tui/package.json 和 tui/tsconfig.json
- [x] 使用 Ink + React 替代 blessed.js（更好的 Windows 兼容性）
- [x] 实现基础 TUI 框架 (src/index.tsx)
- [x] 实现欢迎界面和消息显示
- [x] 实现命令模式（/hub、/quit）
- [x] 实现会话中心（优化样式 + 完整功能）
- [x] 实现按键处理（R/T/Q/ESC）

### 1.4 配置系统

- [x] 设计配置文件结构 (config.json schema)
- [x] 实现配置文件读取逻辑 (支持全局 ~/.karyi/ 和项目 .karyi/)
- [x] 实现配置优先级：项目 > 全局
- [x] 实现配置写入和合并逻辑

### 1.5 Python 环境

- [x] 创建 python/ 目录
- [x] 创建 python/.venv (虚拟环境)
- [x] 更新 requirements.txt (添加基础依赖)
- [x] 创建 python/karyi_engine/ 包结构
- [x] 创建 python/main.py 入口文件（JSON-RPC Bridge）

---

## 阶段二：进程间通信 (2-3 天) ✅ COMPLETED

### 2.1 @karyi/ipc 模块

- [x] 创建 packages/ipc/ 基础结构
- [x] 配置 ipc/package.json 和 ipc/tsconfig.json
- [x] 安装 vscode-jsonrpc 依赖
- [x] 实现 Python 子进程启动逻辑 (src/python-process.ts)
- [x] 实现 JSON-RPC over stdio client (src/jsonrpc-client.ts)
- [x] 实现进程生命周期管理（启动、停止、重启）
- [x] 添加错误处理和重连逻辑
- [x] 实现主入口文件 (src/index.ts)

### 2.2 karyi_engine.bridge (Python)

- [x] 创建 python/main.py（JSON-RPC Bridge）
- [x] 实现 stdin 监听循环
- [x] 实现 JSON-RPC 请求解析
- [x] 实现请求路由和分发逻辑
- [x] 实现 JSON-RPC 响应格式化
- [x] 将响应写入 stdout
- [x] 添加错误处理和日志

### 2.3 karyi-back 独立命令

- [ ] 创建 packages/back/ 独立模块（可选，暂不实现）

### 2.4 通信测试

- [x] 实现 ping-pong 测试（test-ipc.js）
- [x] 测试 Node.js → Python 通信
- [x] 测试 Python → Node.js 响应
- [x] 验证错误处理和边缘情况
- [x] 所有测试通过 ✅

---

## 阶段三：核心对话和 AI 集成 (3-4 天)

### 3.1 @karyi/state 模块 ✅ COMPLETED

- [x] 创建 packages/state/ 基础结构
- [x] 配置 state/package.json 和 state/tsconfig.json
- [x] 安装 zustand 和 nanoid 依赖
- [x] 定义会话状态接口 (src/types.ts)
- [x] 实现 zustand store (src/store.ts)
- [x] 实现对话历史管理
- [x] 实现 Token 计数逻辑
- [x] 实现会话统计（时长、轮数、修改文件列表）
- [x] 实现临时变量管理

### 3.2 @karyi/core 模块 ✅ COMPLETED

- [x] 创建 packages/core/ 基础结构
- [x] 配置 core/package.json 和 core/tsconfig.json
- [x] 定义应用状态机 (src/state-machine.ts)
- [x] 实现编排器主类 (src/orchestrator.ts)
- [x] 实现用户输入处理流程
- [x] 实现 AI 响应处理流程
- [x] 实现工具调用分发逻辑
- [x] 集成 @karyi/state 状态管理

### 3.3 karyi_engine.ai (Python) ✅ COMPLETED

- [x] 创建 python/karyi_engine/ai.py
- [x] 安装 LLM 依赖 (openai, anthropic, google-genai)
- [x] 实现 AI 提供商抽象层
- [x] 实现 OpenAI 提供商 (GPT-4)
- [x] 实现 Anthropic 提供商 (Claude 3.5 Sonnet)
- [x] 实现 Google Gemini 提供商 (Gemini 2.5 Flash - 最新 SDK)
- [x] 实现 OpenRouter 提供商 (多模型聚合)
- [x] 实现 OpenAI 兼容平台支持
- [x] 实现流式响应处理
- [x] 统一的 AIManager 接口

### 3.4 对话流程集成 ✅ COMPLETED

- [x] 实现完整的对话循环
- [x] 集成 TUI 显示 AI 回复
- [x] 实现 Orchestrator 初始化和生命周期管理
- [x] 实现状态同步（SessionStore ↔ TUI）
- [x] 实现会话中心实时统计显示
- [x] 测试基础对话功能
- [ ] 实现 Markdown 渲染到终端（待优化）
- [ ] 实现打字机效果（可选）
- [ ] 优化上下文管理（滑动窗口）

---

## 阶段四：工具执行系统 (3-4 天)

### 4.1 @karyi/shell 模块

- [ ] 创建 packages/shell/ 基础结构
- [ ] 配置 shell/package.json 和 shell/tsconfig.json
- [ ] 安装 node-pty 依赖
- [ ] 实现会话级 PTY 管理 (src/pty-manager.ts)
- [ ] 注入 KARYI_IPC_PATH 环境变量
- [ ] 实现 stdout 监听和捕获
- [ ] 实现 Shell 接管模式 (Takeover)
- [ ] 实现标准输入/输出透传

### 4.2 ToolsXML 解析器

- [ ] 创建 packages/core/src/tools-parser.ts
- [ ] 实现 XML 解析逻辑
- [ ] 实现 <command> 标签解析
- [ ] 实现 <edit> 标签解析
- [ ] 实现 <read> 标签解析
- [ ] 实现 <get_value> 标签解析
- [ ] 实现 <input> 和 <ctrl> 标签解析
- [ ] 实现 <mcp> 标签解析
- [ ] 添加 XML 格式验证

### 4.3 变量替换系统

- [ ] 实现 $KARYI{VAR_NAME} 占位符识别
- [ ] 实现变量查找逻辑（vault + 临时变量）
- [ ] 实现安全替换（避免泄露到日志）
- [ ] 实现未定义变量检测
- [ ] 集成到工具执行前的预处理

### 4.4 <command> 工具实现

- [ ] 在 @karyi/shell 实现命令写入 PTY
- [ ] 实现命令输出捕获
- [ ] 实现多行命令支持
- [ ] 实现命令执行超时
- [ ] 返回结构化的执行结果

### 4.5 <input> 和 <ctrl> 工具

- [ ] 实现 <input> 标签处理
- [ ] 实现 <ctrl> 标签处理（Ctrl+C 等）
- [ ] 测试交互式命令场景

### 4.6 karyi_engine.tools (Python)

- [ ] 创建 python/karyi_engine/tools/ 包
- [ ] 创建工具基类 (tools/base.py)
- [ ] 实现 FileEditor (tools/file_editor.py)
  - [ ] 实现查找替换逻辑
  - [ ] 支持多个文件
  - [ ] 支持多组查找替换
  - [ ] 添加错误处理
- [ ] 实现 FileReader (tools/file_reader.py)
  - [ ] 读取文件内容
  - [ ] 列出目录内容
  - [ ] 添加文件大小限制
- [ ] 实现工具注册和调用机制

### 4.7 工具执行集成

- [ ] 在编排器中集成工具解析
- [ ] 实现工具执行结果收集
- [ ] 将工具结果返回给 AI
- [ ] 测试端到端工具调用
- [ ] 优化工具执行性能

---

## 阶段五：安全与审计模块 (3-4 天)

### 5.1 @karyi/vault 模块

- [ ] 创建 packages/vault/ 基础结构
- [ ] 配置 vault/package.json 和 vault/tsconfig.json
- [ ] 安装 keytar 依赖
- [ ] 实现变量存储接口 (src/index.ts)
- [ ] 实现 setVariable(key, value, notes)
- [ ] 实现 getVariable(key)
- [ ] 实现 listVariables()
- [ ] 实现 removeVariable(key)
- [ ] 添加加密和安全措施

### 5.2 <get_value> 工具实现

- [ ] 在编排器中实现 <get_value> 处理
- [ ] 暂停任务执行
- [ ] 显示交互式变量请求界面
- [ ] 实现安全输入（隐藏输入）
- [ ] 实现"仅本会话"选项
- [ ] 实现"永久保存"选项
- [ ] 集成 @karyi/vault
- [ ] 更新会话状态中的变量列表

### 5.3 配置式变量行为

- [ ] 实现 `interactive` 模式（默认）
- [ ] 实现 `warn` 模式
- [ ] 在配置系统中添加 variables.mode 支持
- [ ] 测试不同模式的行为

### 5.4 karyi_engine.audit (Python)

- [ ] 创建 python/karyi_engine/audit.py
- [ ] 安装 GitPython 依赖
- [ ] 实现影子仓库初始化 (.karyi/history/)
- [ ] 实现符号链接镜像逻辑
- [ ] 实现文件修改后的自动提交
- [ ] 实现结构化提交信息（会话 ID、提示、工具 XML）
- [ ] 优化大型项目性能
- [ ] 测试 Git 操作

### 5.5 保险箱机制

- [ ] 在编排器中实现高风险文件检测
- [ ] 定义高风险文件模式 (*.db, .env, etc.)
- [ ] 实现自动备份逻辑（带时间戳）
- [ ] 实现红色横幅警告
- [ ] 在下次启动时显示警告
- [ ] 测试保险箱功能

### 5.6 karyi history 命令

- [ ] 在 @karyi/cli 添加 history 子命令
- [ ] 实现历史记录查看界面
- [ ] 显示提交列表（时间、会话 ID、提示摘要）
- [ ] 实现文件修改查看
- [ ] 实现回滚功能（可选）
- [ ] 美化输出格式

---

## 阶段六：MCP 协议集成 (2-3 天)

### 6.1 @karyi/mcp 模块

- [ ] 创建 packages/mcp/ 基础结构
- [ ] 配置 mcp/package.json 和 mcp/tsconfig.json
- [ ] 研究 MCP 协议规范
- [ ] 实现 MCP Client 基类 (src/client.ts)
- [ ] 实现 stdio 传输层 (src/transports/stdio.ts)
- [ ] 实现 HTTP 传输层 (src/transports/http.ts)
- [ ] 实现 SSE 传输层 (src/transports/sse.ts)

### 6.2 MCP Server 管理

- [ ] 实现 Server 连接管理 (src/server-manager.ts)
- [ ] 实现本地 MCP Server 启动逻辑
- [ ] 实现远程 MCP Server 连接
- [ ] 实现服务器健康检查和重连
- [ ] 从配置文件加载 Server 列表

### 6.3 MCP 工具集成

- [ ] 实现 tools/list 请求
- [ ] 实现 tools/call 请求
- [ ] 实现工具结果解析
- [ ] 实现 <mcp> 标签处理（JSON 内容）
- [ ] 将 MCP 工具列表注入 AI System Prompt
- [ ] 测试 MCP 工具调用

### 6.4 MCP 资源支持（可选）

- [ ] 实现 resources/list 请求
- [ ] 实现 resources/read 请求
- [ ] 实现资源订阅（可选）
- [ ] 集成资源到上下文系统

### 6.5 karyi config mcp 命令

- [ ] 实现 `karyi config mcp list` - 列出已配置的服务器
- [ ] 实现 `karyi config mcp add` - 添加新服务器
- [ ] 实现 `karyi config mcp remove` - 移除服务器
- [ ] 实现 `karyi config mcp test` - 测试服务器连接
- [ ] 配置验证和错误处理

---

## 阶段七：项目扫描器和高级功能 (2-3 天)

### 7.1 karyi_engine.scanner (Python)

- [ ] 创建 python/karyi_engine/scanner.py
- [ ] 实现扫描器基础框架
- [ ] 实现风险文件检测
  - [ ] 检测配置文件 (.env, .config, etc.)
  - [ ] 检测数据库文件 (*.db,*.sqlite, etc.)
  - [ ] 检测密钥文件 (*.key,*.pem, etc.)
  - [ ] 检测二进制文件
- [ ] 实现技术栈分析器
  - [ ] 解析 package.json (Node.js)
  - [ ] 解析 requirements.txt / pyproject.toml (Python)
  - [ ] 解析 Makefile
  - [ ] 解析 Cargo.toml (Rust)
  - [ ] 解析其他常见配置文件
- [ ] 实现项目命令提取
  - [ ] 提取 npm scripts
  - [ ] 提取 make targets
  - [ ] 提取其他构建命令
- [ ] 生成 precautions.md 文件
- [ ] 生成 manifest.json 文件
- [ ] 优化扫描性能（异步、缓存）

### 7.2 karyi scan 命令

- [ ] 在 @karyi/cli 添加 scan 子命令
- [ ] 调用 Python scanner 模块
- [ ] 显示扫描进度
- [ ] 展示扫描结果摘要
- [ ] 提示用户查看生成的文件

### 7.3 会话中心完善

- [ ] 实现 SessionHubView (src/views/SessionHubView.ts)
- [ ] 显示会话统计信息
  - [ ] 会话时长
  - [ ] Token 消耗
  - [ ] 对话轮数
- [ ] 显示修改文件列表
- [ ] 显示使用的变量列表
- [ ] 实现操作选项
  - [ ] (R)esume - 返回对话
  - [ ] (T)akeover - 接管 Shell
  - [ ] (Q)uit - 退出应用
  - [ ] (!) - 执行临时命令
- [ ] 实现 Ctrl+C 拦截逻辑
- [ ] 实现第二次 Ctrl+C 确认退出

### 7.4 上下文注入

- [ ] 在 AI System Prompt 中注入 precautions.md 摘要
- [ ] 在 AI System Prompt 中注入 manifest.json 信息
- [ ] 实现摘要生成逻辑（避免过长）
- [ ] 测试 AI 对项目的理解能力

---

## 阶段八：测试、打磨和文档 (2-3 天)

### 8.1 单元测试

- [ ] 为 @karyi/cli 编写测试
- [ ] 为 @karyi/tui 编写测试
- [ ] 为 @karyi/core 编写测试
- [ ] 为 @karyi/ipc 编写测试
- [ ] 为 @karyi/shell 编写测试
- [ ] 为 @karyi/vault 编写测试
- [ ] 为 @karyi/mcp 编写测试
- [ ] 为 Python 模块编写测试

### 8.2 集成测试

- [ ] 测试完整的对话流程
- [ ] 测试所有工具的执行
- [ ] 测试变量系统
- [ ] 测试影子仓库
- [ ] 测试保险箱机制
- [ ] 测试 MCP 集成
- [ ] 测试会话中心和 Shell 接管
- [ ] 测试错误处理和边缘情况

### 8.3 性能优化

- [ ] 优化 TUI 渲染性能
- [ ] 优化 Python 进程启动时间
- [ ] 优化 JSON-RPC 通信延迟
- [ ] 优化大文件读取和编辑
- [ ] 优化扫描器性能
- [ ] 内存泄漏检测和修复

### 8.4 用户体验打磨

- [ ] 优化错误提示信息
- [ ] 添加进度指示器
- [ ] 优化 Markdown 渲染效果
- [ ] 添加颜色和格式化输出
- [ ] 实现更友好的命令行帮助
- [ ] 添加交互式引导（首次使用）

### 8.5 文档编写

- [ ] 编写 README.md
  - [ ] 项目介绍
  - [ ] 快速开始
  - [ ] 安装说明
  - [ ] 基本使用
- [ ] 编写用户文档
  - [ ] 命令参考
  - [ ] 配置指南
  - [ ] ToolsXML 使用指南
  - [ ] MCP 集成指南
  - [ ] 变量系统使用
  - [ ] 故障排除
- [ ] 编写开发者文档
  - [ ] 架构概述
  - [ ] 模块说明
  - [ ] 贡献指南
  - [ ] API 参考
- [ ] 添加示例和教程
- [ ] 录制演示视频（可选）

### 8.6 发布准备

- [ ] 设置 CI/CD 流程
- [ ] 配置发布脚本
- [ ] 版本号管理
- [ ] 生成 CHANGELOG
- [ ] 准备发布说明
- [ ] npm 包发布配置

---

## 进度追踪

**当前阶段**: 阶段三 - 核心对话和 AI 集成 ✅ COMPLETED
**完成进度**: 3.0 / 8 阶段 (37.5%)
**阶段一进度**: 1.1 ✓ | 1.2 ✓ | 1.3 ✓ | 1.4 ✓ | 1.5 ✓ - ✅ COMPLETED
**阶段二进度**: 2.1 ✓ | 2.2 ✓ | 2.4 ✓ - ✅ COMPLETED
**阶段三进度**: 3.1 ✓ | 3.2 ✓ | 3.3 ✓ | 3.4 ✓ - ✅ COMPLETED

**下一步**: 阶段四 - 工具执行系统

**重要里程碑**:

- ✅ 基础框架完成
- ✅ IPC 通信测试通过
- ✅ 状态管理系统就绪
- ✅ AI 多提供商支持（OpenAI, Claude, Gemini 2.5, OpenRouter）
- ✅ 核心编排器完成
- ✅ 端到端对话流程集成完成
