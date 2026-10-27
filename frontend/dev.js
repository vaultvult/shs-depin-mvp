const { spawn, execSync } = require('child_process');

const cleanup = () => {
    console.log('\n🛑 Shutting down backend and cleaning up processes...');
    try { execSync('pkill -9 -f "next"', { stdio: 'ignore' }); } catch (e) {}
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('🚀 Starting Next.js backend...');
const nextDev = spawn('npx', ['next', 'dev'], { stdio: 'inherit', detached: true });

setTimeout(() => {
    console.log('🌐 Opening GUI...');
    
    // Launch Firefox using the registered profile name and -no-remote
    const browser = spawn('firefox', ['-P', 'shsdepin-app', '-no-remote', 'http://localhost:3000'], { 
        stdio: 'inherit' 
    });

    browser.on('close', () => {
        cleanup();
    });
    
    browser.on('error', (err) => {
        console.error('⚠️ Browser error:', err.message);
        cleanup();
    });
}, 5000);
