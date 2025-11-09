# KaryiAgent

A powerful AI-powered terminal assistant with security and auditing features.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Python >= 3.9
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Akanyi/KaryiAgent.git
cd KaryiAgent
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Link globally (optional)**
```bash
npm link packages/cli
```

### Usage

**Option 1: Run directly**
```bash
node packages/cli/bin/karyi.js
```

**Option 2: After global link**
```bash
karyi
```

**Option 3: Use npm script**
```bash
npm start
```

### Available Commands

- `karyi` - Start the interactive TUI
- `karyi config get <key>` - Get configuration value
- `karyi config set <key> <value>` - Set configuration value
- `/hub` - Open session hub (in TUI)
- `/quit` - Exit application (in TUI)

## 📦 Project Structure

```
KaryiAgent/
├── packages/
│   ├── cli/          # Command-line interface
│   ├── tui/          # Terminal UI (Ink + React)
│   ├── core/         # Core orchestration logic
│   ├── ipc/          # Inter-process communication
│   ├── shell/        # Shell integration
│   └── ...
├── python/
│   ├── karyi_engine/ # Python backend
│   └── main.py       # JSON-RPC bridge
└── requirements.txt  # Python dependencies
```

## 🛠️ Development

### Build all packages
```bash
npm run build
```

### Start development
```bash
npm run dev
```

### Run tests
```bash
npm test
```

## 📝 Configuration

KaryiAgent uses a hierarchical configuration system:

- **Global config**: `~/.karyi/config.json`
- **Project config**: `.karyi/config.json` (in your project root)

Project config takes precedence over global config.

## 🔧 Current Status

**Stage 1: Foundation** ✅ COMPLETED
- [x] Project structure
- [x] CLI module
- [x] TUI module (Ink + React)
- [x] Configuration system
- [x] Python environment

**Stage 2: IPC** 🚧 In Progress
- [ ] IPC module
- [ ] JSON-RPC bridge
- [ ] Communication testing

## 📄 License

MIT

## 👥 Contributors

KaryiAgent Team
