/**
 * IPC 通信测试脚本
 * 
 * 测试 Node.js 和 Python 之间的 JSON-RPC 通信
 */

const { IPCClient } = require('./packages/ipc/dist/index.js');

async function main() {
  console.log('🚀 Starting IPC Test...\n');

  // 创建 IPC 客户端
  const client = new IPCClient();

  // 监听事件
  client.on('log', (message) => {
    console.log('📝 Python log:', message);
  });

  client.on('ready', () => {
    console.log('✅ Python backend is ready!\n');
  });

  client.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  client.on('exit', (code, signal) => {
    console.log(`\n🛑 Python process exited with code ${code}, signal ${signal}`);
  });

  try {
    // 启动 Python 进程
    console.log('⏳ Starting Python backend...');
    await client.start();

    // 测试 1: Ping
    console.log('\n📤 Test 1: Ping');
    const pingResult = await client.ping();
    console.log('📥 Response:', pingResult);

    // 测试 2: Echo
    console.log('\n📤 Test 2: Echo');
    const echoData = { message: 'Hello from Node.js!', timestamp: Date.now() };
    const echoResult = await client.echo(echoData);
    console.log('📥 Response:', JSON.stringify(echoResult, null, 2));

    // 测试 3: 自定义请求
    console.log('\n📤 Test 3: Custom request');
    try {
      await client.request('nonexistent_method');
    } catch (error) {
      console.log('📥 Expected error:', error.message);
    }

    console.log('\n✅ All tests completed!');

    // 停止 Python 进程
    console.log('\n⏳ Stopping Python backend...');
    await client.stop();
    console.log('✅ Python backend stopped.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await client.stop();
    process.exit(1);
  }
}

// 运行测试
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
