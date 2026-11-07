const { spawn, execSync } = require('child_process');

const cleanup = () => {
    console.log('\n🛑 Shutting down backend...');
    try { execSync('pkill -f "next"', { stdio: 'ignore' }); } catch (e) {}
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('🚀 Starting Next.js backend (Webpack Mode)...');
// 🚨 Added the '--webpack' flag here
const nextDev = spawn('npx', ['next', 'dev', '--webpack'], { stdio: 'inherit', detached: true });

setTimeout(() => {
    console.log('🌐 Opening GUI...');
    
    // Opens Firefox normally
    const browser = spawn('firefox', ['http://localhost:3000'], { 
        stdio: 'ignore' 
    });

    // Keep the terminal running so you can press Ctrl+C to stop
}, 6000); 
