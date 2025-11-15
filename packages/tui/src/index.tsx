import React, { useState, useEffect, useRef } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Orchestrator, OrchestratorConfig } from '../../core/src/index.js';
import { useSessionStore } from '../../state/src/index.js';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TUIProps {
  onMessage?: (message: string) => void;
  orchestratorConfig?: OrchestratorConfig;
}

const App: React.FC<TUIProps> = ({ onMessage, orchestratorConfig }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showHub, setShowHub] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { exit } = useApp();
  const orchestratorRef = useRef<Orchestrator | null>(null);

  // 初始化 Orchestrator
  useEffect(() => {
    async function initOrchestrator() {
      try {
        // 创建 Orchestrator 实例
        const config: OrchestratorConfig = orchestratorConfig || {
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
      } catch (error) {
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
    const unsubscribe = useSessionStore.subscribe((state: any) => {
      // 同步消息到 TUI
      const stateMessages = state.messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
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
  const handleSubmit = async (value: string) => {
    if (!value.trim() || isProcessing || !orchestratorRef.current) return;

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
    } catch (error) {
      const errorMessage: Message = {
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
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="double" borderColor="cyan" padding={1} flexDirection="column" width={60}>
          <Box justifyContent="center">
            <Text bold color="cyan">SESSION HUB</Text>
          </Box>
          
          <Box marginTop={1}>
            <Text dimColor>{'─'.repeat(56)}</Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="yellow">📊 Stats</Text>
            <Box marginLeft={2}>
              <Text dimColor>Duration: </Text>
              <Text color="green">{duration}</Text>
              <Text dimColor> │ Tokens: </Text>
              <Text color="magenta">{tokens}</Text>
              <Text dimColor> │ Msgs: </Text>
              <Text color="cyan">{stats.messageCount}</Text>
            </Box>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="yellow">📝 Files</Text>
            <Box marginLeft={2}>
              {stats.modifiedFiles.length === 0 ? (
                <Text dimColor>No files modified yet</Text>
              ) : (
                stats.modifiedFiles.map((file: string, idx: number) => (
                  <Text key={idx} color="green">• {file}</Text>
                ))
              )}
            </Box>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="yellow">🔐 Variables</Text>
            <Box marginLeft={2}>
              {stats.usedVariables.length === 0 ? (
                <Text dimColor>No variables used yet</Text>
              ) : (
                stats.usedVariables.map((variable: string, idx: number) => (
                  <Text key={idx} color="magenta">• {variable}</Text>
                ))
              )}
            </Box>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>{'─'.repeat(56)}</Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="green" bold>⌨️  Actions:</Text>
            <Box marginLeft={2} flexDirection="column">
              <Text>
                <Text color="cyan">R  </Text>
                <Text dimColor>│</Text>
                {' Resume conversation'}
              </Text>
              <Text>
                <Text color="cyan">T  </Text>
                <Text dimColor>│</Text>
                {' Takeover shell'}
              </Text>
              <Text>
                <Text color="cyan">Q  </Text>
                <Text dimColor>│</Text>
                {' Quit application'}
              </Text>
              <Text>
                <Text color="cyan">ESC</Text>
                <Text dimColor>│</Text>
                {' Back to chat'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // 显示初始化中
  if (isInitializing) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text>
          <Spinner type="dots" />
          {' Initializing KaryiAgent...'}
        </Text>
      </Box>
    );
  }

  // 主界面
  return (
    <Box flexDirection="column" height="100%">
      {/* 消息区域 */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {messages.map((msg, idx) => (
          <Box key={idx} flexDirection="column" marginBottom={1}>
            {msg.role === 'user' && (
              <Text>
                <Text bold color="cyan">
                  You:{' '}
                </Text>
                {msg.content}
              </Text>
            )}
            {msg.role === 'assistant' && (
              <Text>
                <Text bold color="green">
                  KaryiAgent:{' '}
                </Text>
                {msg.content}
              </Text>
            )}
            {msg.role === 'system' && (
              <Text>
                <Text bold color="yellow">
                  System:{' '}
                </Text>
                <Text dimColor>{msg.content}</Text>
              </Text>
            )}
          </Box>
        ))}

        {isProcessing && (
          <Box>
            <Text color="green">
              <Spinner type="dots" />
              {' KaryiAgent is thinking...'}
            </Text>
          </Box>
        )}
      </Box>

      {/* 输入区域 */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text color="cyan">› </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Type your message..."
        />
      </Box>

      {/* 状态栏 */}
      <Box paddingX={1}>
        <Text backgroundColor="blue">
          {' '}Type <Text bold>/hub</Text> for Session Hub | <Text bold>Ctrl+C</Text> to Quit{' '}
        </Text>
      </Box>
    </Box>
  );
};

export function startTUI(options: TUIProps = {}) {
  const { waitUntilExit } = render(<App {...options} />);
  return waitUntilExit();
}

export default App;
