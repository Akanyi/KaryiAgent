import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TUIProps {
  onMessage?: (message: string) => void;
}

const App: React.FC<TUIProps> = ({ onMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
  const handleSubmit = (value: string) => {
    if (!value.trim() || isProcessing) return;

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

    const userMessage: Message = { role: 'user', content: value };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // TODO: 发送到 AI 引擎
    // 暂时模拟响应
    setTimeout(() => {
      const assistantMessage: Message = {
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
              <Text color="green">5 min</Text>
              <Text dimColor> │ Tokens: </Text>
              <Text color="magenta">1.2K</Text>
              <Text dimColor> │ Msgs: </Text>
              <Text color="cyan">{messages.length}</Text>
            </Box>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="yellow">📝 Files</Text>
            <Box marginLeft={2}>
              <Text dimColor>No files modified yet</Text>
            </Box>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="yellow">🔐 Variables</Text>
            <Box marginLeft={2}>
              <Text dimColor>No variables used yet</Text>
            </Box>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>{'─'.repeat(56)}</Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text color="green" bold>⌨️  Actions:</Text>
            <Box marginLeft={2} flexDirection="column">
              <Text><Text color="cyan">R  </Text> <Text dimColor>│</Text> Resume conversation</Text>
              <Text><Text color="cyan">T  </Text> <Text dimColor>│</Text> Takeover shell</Text>
              <Text><Text color="cyan">Q  </Text> <Text dimColor>│</Text> Quit application</Text>
              <Text><Text color="cyan">ESC</Text> <Text dimColor>│</Text> Back to chat</Text>
            </Box>
          </Box>
        </Box>
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
