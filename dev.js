const { spawn, execSync } = require('child_process');
const fs = require('fs');

const cleanup = () => {
    console.log('\n🛑 Shutting down backend and cleaning up processes...');
    try { execSync('pkill -9 -f "next"', { stdio: 'ignore' }); } catch (e) {}
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('🚀 Starting Next.js backend...');
const nextDev = spawn('npx', ['next', 'dev'], { stdio: 'inherit', detached: true });

const commandExists = (cmd) => {
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true; }
  catch { return false; }
};

setTimeout(() => {
    console.log('🌐 Opening GUI...');
    
    let browserCmd = '';
    let browserArgs = [];

    // Priority 1: Chromium (Best for standalone app mode)
    if (commandExists('chromium')) {
        browserCmd = 'chromium';
        browserArgs = ['--app=http://localhost:3000'];
    } 
    // Priority 2: Google Chrome
    else if (commandExists('google-chrome')) {
        browserCmd = 'google-chrome';
        browserArgs = ['--app=http://localhost:3000'];
    } 
    // Priority 3: Firefox (Fallback)
    else if (commandExists('firefox')) {
        browserCmd = 'firefox';
        const profileDir = '/tmp/shsdepin-firefox-profile';
        if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
        browserArgs = ['--no-remote', '--profile', profileDir, 'http://localhost:3000'];
    } 
    else {
        console.error('❌ No supported browser found. Please install Chromium: sudo apt install chromium');
        cleanup();
    }

    const browser = spawn(browserCmd, browserArgs, { stdio: 'inherit' }); // changed to inherit so we see errors

    browser.on('close', () => {
        cleanup();
    });
    
    browser.on('error', (err) => {
        console.error('⚠️ Browser error:', err.message);
        cleanup();
    });
}, 5000);
