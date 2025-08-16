// Animation and UI effects module
const chalk = require('chalk');
const gradient = require('gradient-string');
const figlet = require('figlet');
const ora = require('ora');
const cliProgress = require('cli-progress');

// ASCII art fonts
const FONTS = [
    'ANSI Shadow',
    'Bloody',
    'Delta Corps Priest 1',
    'Electronic',
    'Epic',
    'Fire Font-k',
    'Ghost',
    'Graffiti'
];

// Gradient themes
const THEMES = {
    cyberpunk: gradient(['#ff00ff', '#00ffff']),
    matrix: gradient(['#00ff00', '#008800']),
    sunset: gradient(['#ff6b6b', '#ffd93d']),
    ocean: gradient(['#1e3c72', '#2a5298']),
    fire: gradient(['#ff0000', '#ffaa00']),
    rainbow: gradient.rainbow,
    cristal: gradient.cristal,
    teen: gradient.teen,
    mind: gradient.mind,
    morning: gradient.morning,
    vice: gradient.vice,
    passion: gradient.passion,
    fruit: gradient.fruit,
    instagram: gradient.instagram,
    atlas: gradient.atlas,
    retro: gradient.retro
};

// Loading messages
const LOADING_MESSAGES = [
    'Initializing quantum neural networks...',
    'Calibrating semantic processors...',
    'Loading language matrices...',
    'Connecting to xAI servers...',
    'Synchronizing with the singularity...',
    'Activating reasoning engine...',
    'Bootstrapping consciousness simulation...',
    'Optimizing token generators...',
    'Establishing neural link...',
    'Warming up transformer cores...'
];

// Spinner styles
const SPINNERS = {
    dots: 'dots12',
    line: 'line',
    star: 'star2',
    arrow: 'arrow3',
    bouncingBar: 'bouncingBar',
    pulse: 'pulse',
    aesthetic: 'aesthetic'
};

class Animations {
    constructor(theme = 'cyberpunk') {
        this.theme = THEMES[theme] || THEMES.cyberpunk;
        this.currentSpinner = null;
    }
    
    // Display animated logo
    async showLogo(text = 'GROK-4', font = 'ANSI Shadow') {
        return new Promise((resolve) => {
            figlet(text, { font }, (err, data) => {
                if (!err) {
                    console.log(this.theme(data));
                }
                resolve();
            });
        });
    }
    
    // Animated boot sequence
    async bootSequence() {
        console.clear();
        
        // Show logo
        await this.showLogo('GROK-4');
        
        // Loading sequence
        for (let i = 0; i < 5; i++) {
            const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            const spinner = ora({
                text: message,
                spinner: Object.values(SPINNERS)[i % Object.values(SPINNERS).length],
                color: 'cyan'
            }).start();
            
            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
            spinner.succeed();
        }
        
        // Final message
        console.log('\n' + this.theme('✨ System Online ✨\n'));
    }
    
    // Matrix rain effect
    async matrixRain(duration = 3000) {
        const columns = process.stdout.columns;
        const rows = process.stdout.rows;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()';
        const drops = Array(columns).fill(0);
        
        const interval = setInterval(() => {
            process.stdout.write('\x1b[2J\x1b[H'); // Clear screen
            
            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i;
                const y = drops[i];
                
                if (y < rows) {
                    process.stdout.cursorTo(x, y);
                    process.stdout.write(chalk.green(char));
                }
                
                if (drops[i] > rows || Math.random() > 0.95) {
                    drops[i] = 0;
                } else {
                    drops[i]++;
                }
            }
        }, 50);
        
        setTimeout(() => {
            clearInterval(interval);
            console.clear();
        }, duration);
    }
    
    // Typing effect
    async typeText(text, delay = 50) {
        for (const char of text) {
            process.stdout.write(this.theme(char));
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        console.log();
    }
    
    // Progress bar for operations
    createProgressBar(title = 'Processing', total = 100) {
        return new cliProgress.SingleBar({
            format: this.theme(title) + ' |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total}',
            barCompleteChar: '█',
            barIncompleteChar: '░',
            hideCursor: true
        });
    }
    
    // Animated thinking dots
    async thinkingAnimation(message = 'Thinking', duration = 3000) {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        
        const interval = setInterval(() => {
            process.stdout.write(`\r${this.theme(message)} ${frames[i++ % frames.length]}`);
        }, 80);
        
        setTimeout(() => {
            clearInterval(interval);
            process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
        }, duration);
    }
    
    // Glitch effect
    async glitchText(text, iterations = 10) {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        
        for (let i = 0; i < iterations; i++) {
            let glitched = '';
            for (const char of text) {
                if (Math.random() > 0.7) {
                    glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    glitched += char;
                }
            }
            
            process.stdout.write('\r' + chalk.red(glitched));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        process.stdout.write('\r' + this.theme(text) + '\n');
    }
    
    // Pulse effect
    async pulseText(text, pulses = 3) {
        const colors = [
            chalk.dim,
            chalk.gray,
            chalk.white,
            chalk.bold.white
        ];
        
        for (let p = 0; p < pulses; p++) {
            for (const color of colors) {
                process.stdout.write('\r' + color(text));
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            for (let i = colors.length - 2; i >= 0; i--) {
                process.stdout.write('\r' + colors[i](text));
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log();
    }
    
    // ASCII art divider
    createDivider(char = '═', width = process.stdout.columns) {
        return this.theme(char.repeat(width));
    }
    
    // Animated counter
    async animateCounter(start, end, prefix = '', suffix = '', duration = 2000) {
        const steps = 20;
        const increment = (end - start) / steps;
        const delay = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const value = Math.round(start + increment * i);
            process.stdout.write(`\r${prefix}${this.theme(value.toString())}${suffix}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        console.log();
    }
    
    // Wave animation
    async waveText(text) {
        const frames = [
            '╔', '╗', '╝', '╚', '═', '║'
        ];
        
        for (let i = 0; i < text.length + 10; i++) {
            let output = '';
            for (let j = 0; j < text.length; j++) {
                if (i - j >= 0 && i - j < frames.length) {
                    output += frames[i - j];
                } else if (i - j >= frames.length && i - j < frames.length + 1) {
                    output += text[j];
                } else {
                    output += ' ';
                }
            }
            process.stdout.write('\r' + this.theme(output));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log();
    }
}

module.exports = Animations;