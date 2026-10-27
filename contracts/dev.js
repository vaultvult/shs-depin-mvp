const { spawn, execSync } = require('child_process');

const cleanup = () => {
    console.log('\n🛑 Shutting down backend...');
    try { execSync('pkill -9 -f "next"', { stdio: 'ignore' }); } catch (e) {}
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('🚀 Starting Next.js backend...');
const nextDev = spawn('npx', ['next', 'dev'], { stdio: 'inherit', detached: true });

setTimeout(() => {
    console.log('🌐 Opening GUI...');
    
    // Open Firefox and let it run.
    const browser = spawn('firefox', ['http://localhost:3000'], { 
        stdio: 'inherit' 
    });

    // For Firefox, we DO NOT kill the server when the browser command exits.
    // You will need to press Ctrl+C in the terminal to stop the server.
    browser.on('error', (err) => {
        console.error('⚠️ Browser error:', err.message);
    });
}, 5000);
