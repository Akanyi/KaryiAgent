### **KaryiAgent ToolsXML 规范 (v1.0)**

#### **简介**

ToolsXML 是 KaryiAgent 中 AI 与系统核心功能之间进行通信的唯一协议。它是一种基于 XML 的、结构化的指令格式。AI 通过在其响应的 `tools` 字段中生成一个 ToolsXML 代码块，来请求系统执行具体的操作，如文件修改、命令执行或与用户交互。

#### **核心原则**

1.  **声明式**: XML 描述的是**“做什么” (What)**，而不是“如何做” (How)。
2.  **结构化**: 所有操作和参数都有严格的层级和类型，便于解析和验证。
3.  **可并行**: `<tools>` 根标签内可以包含多个不同的工具标签，这些工具**可能会被系统并行执行**。
4.  **无状态**: 单个 ToolsXML 块应该是无状态的。所有状态的维持都由 AI 通过分析上一轮工具的执行结果来完成。

#### **根元素: `<tools>`**

所有工具调用都必须被包裹在一个 `<tools>` 根元素内。

```xml
<tools>
  <!-- 在这里放置一个或多个工具调用 -->
</tools>
```

---

### **内置工具集**

以下是 KaryiAgent 内置的核心工具集。

#### **1. `<command>` - 执行 Shell 命令**

执行一个或多个 shell 命令。这是最常用、最强大的工具之一。

*   **标签**: `<command>`
*   **内容**: 要在会话的交互式伪终端 (pty) 中执行的 shell 脚本。
*   **上下文**: 命令在会话级的持久化 pty 中执行，这意味着它可以访问之前命令设置的环境变量和当前工作目录。
*   **示例**:
    ```xml
    <tools>
      <command>
        npm install
        npm run build
      </command>
    </tools>
    ```

#### **2. `<edit>` - 精确地编辑文件**

对一个或多个文件执行基于“查找-替换”的修改操作。这是比用 `sed` 或 `awk` 更安全、更结构化的文件修改方式。

*   **标签**: `<edit>`
*   **子标签**: `<file>`
    *   **属性**: `src` (必需) - 要编辑的文件的相对或绝对路径。
    *   **子标签**:
        *   `<find>` (必需): 要查找的文本内容。
        *   `<replace>` (必需): 替换后的文本内容。
        *   **注意**: 一个 `<file>` 标签内可以包含多组 `<find>`/`<replace>` 对，它们会按顺序在文件上执行。

*   **示例**:
    ```xml
    <tools>
      <edit>
        <!-- 对单个文件进行一次替换 -->
        <file src="src/config.ts">
          <find>const API_URL = "http://localhost:3000";</find>
          <replace>const API_URL = "https://api.production.com";</replace>
        </file>
        
        <!-- 对另一个文件进行多次替换 -->
        <file src="README.md">
          <find>Project Alpha</find>
          <replace>Project Karyi</replace>
          <find>This is a private project.</find>
          <replace>This is an open-source project.</replace>
        </file>
      </edit>
    </tools>
    ```

#### **3. `<read>` - 读取文件或目录内容**

用于读取文件内容或列出目录中的文件，以便 AI 获取信息。

*   **标签**: `<read>`
*   **子标签**:
    *   `<file>`:
        *   **属性**: `src` (必需) - 要读取的文件或目录的路径。
    *   `<search>`: (暂未实现，未来规划)

*   **示例**:
    ```xml
    <tools>
      <read>
        <!-- 读取 package.json 的内容 -->
        <file src="package.json"/>
        
        <!-- 列出 src 目录下的文件和子目录 -->
        <file src="src/"/>
      </read>
    </tools>
    ```

#### **4. `<get_value>` - 请求用户交付安全变量**

一个特殊的“元工具”，用于触发系统向用户安全地请求敏感信息。

*   **标签**: `<get_value>` (自闭合标签)
*   **属性**:
    *   `key` (必需): 变量的名称，例如 `GITHUB_TOKEN`。
    *   `reason` (必需): 向用户解释为什么需要这个变量的清晰理由。
    *   `note` (可选): 为这个变量建议一个备注，如果用户选择保存，该备注将被存储。

*   **工作流**:
    1.  AI 调用此工具。
    2.  系统暂停，并安全地提示用户输入。
    3.  在**下一轮**对话中，AI 就可以通过 `$KARYI{key}` 占位符来使用这个变量了。

*   **示例**:
    ```xml
    <tools>
      <get_value key="NPM_TOKEN" reason="需要认证才能将 package 发布到 npm registry。" note="用于发布 karyi-agent 包的令牌"/>
    </tools>
    ```

#### **5. Shell 交互增强工具**

这些工具用于与 `<command>` 创建的交互式 pty shell 进行更精细的交互。

*   **`<input>`**: 向 pty shell 的标准输入写入数据，通常用于响应交互式提示。
    *   **内容**: 要写入的字符串。**注意**：它**不会**自动附加换行符 (`\n`)。
    *   **示例**: 响应一个 "Are you sure? (y/n)" 的提示。
        ```xml
        <tools>
          <input>y\n</input> <!-- 手动添加换行符 -->
        </tools>
        ```

*   **`<ctrl>`**: 发送一个控制字符到 pty shell。
    *   **内容**: 控制字符的名称，不区分大小写。最常用的是 `c`。
    *   **示例**: 终止一个正在运行的前台进程。
        ```xml
        <tools>
          <ctrl>c</ctrl> <!-- 发送 SIGINT (Ctrl+C) -->
        </tools>
        ```

---

#### **安全与变量使用**

在任何工具的任何文本内容或属性值中，都可以使用 `$KARYI{VAR_NAME}` 占位符来引用通过 `<get_value>` 或 `karyi var` 命令设置的安全变量。系统会在将指令发送到最终执行器之前，安全地替换这些占位符。

**示例**:
```xml
<tools>
  <command>
    curl -X POST \
      -H "Authorization: Bearer $KARYI{GITHUB_TOKEN}" \
      -d '{"event_type": "deploy"}' \
      https://api.github.com/repos/user/repo/dispatches
  </command>
</tools>
```