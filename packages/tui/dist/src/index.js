import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Orchestrator } from '../../core/src/index.js';
import { useSessionStore } from '../../state/src/index.js';
const App = ({ onMessage, orchestratorConfig }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showHub, setShowHub] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const { exit } = useApp();
    const orchestratorRef = useRef(null);
    // 初始化 Orchestrator
    useEffect(() => {
        async function initOrchestrator() {
            try {
                // 创建 Orchestrator 实例
                const config = orchestratorConfig || {
                    aiProvider: {
                        provider: 'gemini',
                        apiKey: process.env.GEMINI_API_KEY || '',
                        model: 'gemini-2.0-flash-exp',
                    },
                    systemPrompt: 'You are KaryiAgent, a helpful AI assistant.',
                    streamResponse: false,
                };
                const orchestrator = new Orchestrator(config);
                await orchestrator.initialize();
                orchestratorRef.current = orchestrator;
                // 添加欢迎消息
                setMessages([
                    {
                        role: 'system',
                        content: `Welcome to KaryiAgent!

I'm your AI-powered terminal assistant with:

• Zero-knowledge variable system for security
• Shadow repository for auditing all changes
• Safety vault for high-risk file protection
• Project scanner to understand your codebase
• MCP protocol support for extensibility

Type your message and press Enter to start.
Commands: /hub (Session Hub) | /quit (Exit)`,
                    },
                ]);
                setIsInitializing(false);
            }
            catch (error) {
                setMessages([
                    {
                        role: 'system',
                        content: `Failed to initialize: ${error}

Please check your configuration and try again.`,
                    },
                ]);
                setIsInitializing(false);
            }
        }
        initOrchestrator();
        // 清理函数
        return () => {
            if (orchestratorRef.current) {
                orchestratorRef.current.shutdown();
            }
        };
    }, []);
    // 订阅状态变化
    useEffect(() => {
        const unsubscribe = useSessionStore.subscribe((state) => {
            // 同步消息到 TUI
            const stateMessages = state.messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            setMessages((prev) => {
                // 只有当消息数量变化时才更新
                if (prev.length !== stateMessages.length + 1) { // +1 因为有欢迎消息
                    return [prev[0], ...stateMessages]; // 保留欢迎消息
                }
                return prev;
            });
            setIsProcessing(state.isProcessing);
        });
        return unsubscribe;
    }, []);
    // 处理快捷键
    useInput((input, key) => {
        // Ctrl+C - 退出
        if (key.ctrl && input === 'c') {
            exit();
        }
        // 在会话中心时的按键处理
        if (showHub) {
            // ESC - 返回
            if (key.escape) {
                setShowHub(false);
            }
            // R - Resume (返回对话)
            if (input.toLowerCase() === 'r') {
                setShowHub(false);
            }
            // T - Takeover shell (暂未实现)
            if (input.toLowerCase() === 't') {
                // TODO: 实现 shell takeover
                setShowHub(false);
            }
            // Q - Quit
            if (input.toLowerCase() === 'q') {
                exit();
            }
        }
    });
    // 处理消息发送
    const handleSubmit = async (value) => {
        if (!value.trim() || isProcessing || !orchestratorRef.current)
            return;
        // 检查是否是命令
        if (value === '/hub') {
            orchestratorRef.current.enterSessionHub();
            setShowHub(true);
            setInput('');
            return;
        }
        if (value === '/quit' || value === '/exit') {
            if (orchestratorRef.current) {
                await orchestratorRef.current.shutdown();
            }
            exit();
            return;
        }
        setInput('');
        // 发送到 Orchestrator
        try {
            await orchestratorRef.current.processUserInput(value);
        }
        catch (error) {
            const errorMessage = {
                role: 'system',
                content: `Error: ${error}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
        if (onMessage) {
            onMessage(value);
        }
    };
    // 渲染会话中心
    if (showHub) {
        const sessionState = useSessionStore.getState();
        const stats = sessionState.stats;
        const duration = stats.duration ? `${Math.floor(stats.duration / 60000)} min` : '0 min';
        const tokens = stats.totalTokens ? `${(stats.totalTokens / 1000).toFixed(1)}K` : '0';
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Box, { borderStyle: "double", borderColor: "cyan", padding: 1, flexDirection: "column", width: 60 },
                React.createElement(Box, { justifyContent: "center" },
                    React.createElement(Text, { bold: true, color: "cyan" }, "SESSION HUB")),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { dimColor: true }, '─'.repeat(56))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "yellow" }, "\uD83D\uDCCA Stats"),
                    React.createElement(Box, { marginLeft: 2 },
                        React.createElement(Text, { dimColor: true }, "Duration: "),
                        React.createElement(Text, { color: "green" }, duration),
                        React.createElement(Text, { dimColor: true }, " \u2502 Tokens: "),
                        React.createElement(Text, { color: "magenta" }, tokens),
                        React.createElement(Text, { dimColor: true }, " \u2502 Msgs: "),
                        React.createElement(Text, { color: "cyan" }, stats.messageCount))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "yellow" }, "\uD83D\uDCDD Files"),
                    React.createElement(Box, { marginLeft: 2 }, stats.modifiedFiles.length === 0 ? (React.createElement(Text, { dimColor: true }, "No files modified yet")) : (stats.modifiedFiles.map((file, idx) => (React.createElement(Text, { key: idx, color: "green" },
                        "\u2022 ",
                        file)))))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "yellow" }, "\uD83D\uDD10 Variables"),
                    React.createElement(Box, { marginLeft: 2 }, stats.usedVariables.length === 0 ? (React.createElement(Text, { dimColor: true }, "No variables used yet")) : (stats.usedVariables.map((variable, idx) => (React.createElement(Text, { key: idx, color: "magenta" },
                        "\u2022 ",
                        variable)))))),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { dimColor: true }, '─'.repeat(56))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "green", bold: true }, "\u2328\uFE0F  Actions:"),
                    React.createElement(Box, { marginLeft: 2, flexDirection: "column" },
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "R  "),
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            ' Resume conversation'),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "T  "),
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            ' Takeover shell'),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "Q  "),
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            ' Quit application'),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "ESC"),
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            ' Back to chat'))))));
    }
    // 显示初始化中
    if (isInitializing) {
        return (React.createElement(Box, { flexDirection: "column", padding: 2 },
            React.createElement(Text, null,
                React.createElement(Spinner, { type: "dots" }),
                ' Initializing KaryiAgent...')));
    }
    // 主界面
    return (React.createElement(Box, { flexDirection: "column", height: "100%" },
        React.createElement(Box, { flexDirection: "column", flexGrow: 1, paddingX: 1 },
            messages.map((msg, idx) => (React.createElement(Box, { key: idx, flexDirection: "column", marginBottom: 1 },
                msg.role === 'user' && (React.createElement(Text, null,
                    React.createElement(Text, { bold: true, color: "cyan" },
                        "You:",
                        ' '),
                    msg.content)),
                msg.role === 'assistant' && (React.createElement(Text, null,
                    React.createElement(Text, { bold: true, color: "green" },
                        "KaryiAgent:",
                        ' '),
                    msg.content)),
                msg.role === 'system' && (React.createElement(Text, null,
                    React.createElement(Text, { bold: true, color: "yellow" },
                        "System:",
                        ' '),
                    React.createElement(Text, { dimColor: true }, msg.content)))))),
            isProcessing && (React.createElement(Box, null,
                React.createElement(Text, { color: "green" },
                    React.createElement(Spinner, { type: "dots" }),
                    ' KaryiAgent is thinking...')))),
        React.createElement(Box, { borderStyle: "single", borderColor: "cyan", paddingX: 1 },
            React.createElement(Text, { color: "cyan" }, "\u203A "),
            React.createElement(TextInput, { value: input, onChange: setInput, onSubmit: handleSubmit, placeholder: "Type your message..." })),
        React.createElement(Box, { paddingX: 1 },
            React.createElement(Text, { backgroundColor: "blue" },
                ' ',
                "Type ",
                React.createElement(Text, { bold: true }, "/hub"),
                " for Session Hub | ",
                React.createElement(Text, { bold: true }, "Ctrl+C"),
                " to Quit",
                ' '))));
};
export function startTUI(options = {}) {
    const { waitUntilExit } = render(React.createElement(App, { ...options }));
    return waitUntilExit();
}
export default App;
//# sourceMappingURL=index.js.map