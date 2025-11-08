import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
const App = ({ onMessage }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showHub, setShowHub] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { exit } = useApp();
    // 添加欢迎消息
    useEffect(() => {
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
    const handleSubmit = (value) => {
        if (!value.trim() || isProcessing)
            return;
        // 检查是否是命令
        if (value === '/hub') {
            setShowHub(true);
            setInput('');
            return;
        }
        if (value === '/quit' || value === '/exit') {
            exit();
            return;
        }
        const userMessage = { role: 'user', content: value };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);
        // TODO: 发送到 AI 引擎
        // 暂时模拟响应
        setTimeout(() => {
            const assistantMessage = {
                role: 'assistant',
                content: `AI 引擎尚未实现。\n\n你的消息：${value}\n\nComing soon!`,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsProcessing(false);
        }, 500);
        if (onMessage) {
            onMessage(value);
        }
    };
    // 渲染会话中心
    if (showHub) {
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
                        React.createElement(Text, { color: "green" }, "5 min"),
                        React.createElement(Text, { dimColor: true }, " \u2502 Tokens: "),
                        React.createElement(Text, { color: "magenta" }, "1.2K"),
                        React.createElement(Text, { dimColor: true }, " \u2502 Msgs: "),
                        React.createElement(Text, { color: "cyan" }, messages.length))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "yellow" }, "\uD83D\uDCDD Files"),
                    React.createElement(Box, { marginLeft: 2 },
                        React.createElement(Text, { dimColor: true }, "No files modified yet"))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "yellow" }, "\uD83D\uDD10 Variables"),
                    React.createElement(Box, { marginLeft: 2 },
                        React.createElement(Text, { dimColor: true }, "No variables used yet"))),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { dimColor: true }, '─'.repeat(56))),
                React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                    React.createElement(Text, { color: "green", bold: true }, "\u2328\uFE0F  Actions:"),
                    React.createElement(Box, { marginLeft: 2, flexDirection: "column" },
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "R  "),
                            " ",
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            " Resume conversation"),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "T  "),
                            " ",
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            " Takeover shell"),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "Q  "),
                            " ",
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            " Quit application"),
                        React.createElement(Text, null,
                            React.createElement(Text, { color: "cyan" }, "ESC"),
                            " ",
                            React.createElement(Text, { dimColor: true }, "\u2502"),
                            " Back to chat"))))));
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