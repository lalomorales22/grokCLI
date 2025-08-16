// Setup wizard for first-time users
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { OpenAI } = require('openai');
const figlet = require('figlet');
const gradient = require('gradient-string');
const boxen = require('boxen');
const Conf = require('conf');

class SetupWizard {
    constructor() {
        this.config = new Conf({ projectName: 'grok-cli' });
        this.configDir = path.join(os.homedir(), '.grok-cli');
    }

    async showWelcome() {
        console.clear();
        
        // ASCII art
        const asciiArt = figlet.textSync('GROK-4 CLI', {
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted'
        });
        
        const bwGradient = gradient(['#ffffff', '#888888', '#333333', '#888888', '#ffffff']);
        console.log(bwGradient(asciiArt));
        
        console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        console.log(chalk.bold.white('  Welcome to Grok-4 CLI Setup Wizard'));
        console.log(chalk.gray('  Version 2.0.0 | Powered by xAI'));
        console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    }

    async checkExistingKey() {
        // Check multiple sources for API key
        const sources = [
            { name: 'Environment Variable', key: process.env.XAI_API_KEY },
            { name: 'Config File', key: this.config.get('apiKey') },
            { name: '.env File', key: await this.checkEnvFile() }
        ];

        for (const source of sources) {
            if (source.key) {
                console.log(chalk.green(`✓ Found API key in ${source.name}`));
                return source.key;
            }
        }

        return null;
    }

    async checkEnvFile() {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = await fs.readFile(envPath, 'utf-8');
            const match = content.match(/XAI_API_KEY=(.+)/);
            return match ? match[1].trim() : null;
        }
        return null;
    }

    async showInstructions() {
        const instructionBox = boxen(
            chalk.white.bold('How to get your xAI API Key:\n\n') +
            chalk.cyan('1. ') + chalk.white('Visit ') + chalk.yellow('https://console.x.ai\n') +
            chalk.cyan('2. ') + chalk.white('Sign in with your X (Twitter), Google, or xAI account\n') +
            chalk.cyan('3. ') + chalk.white('Navigate to ') + chalk.yellow('API Keys') + chalk.white(' section\n') +
            chalk.cyan('4. ') + chalk.white('Click ') + chalk.yellow('"Create API Key"') + chalk.white(' button\n') +
            chalk.cyan('5. ') + chalk.white('Name your key (e.g., "grok-cli")\n') +
            chalk.cyan('6. ') + chalk.white('Copy the generated key (you won\'t see it again!)\n\n') +
            chalk.dim('Note: The API key will look like: ') + chalk.gray('xai-XXXXXXXXXXXXXXXXXXXXXXXX'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                title: '🔑 Getting Started',
                titleAlignment: 'center'
            }
        );

        console.log(instructionBox);
    }

    async promptForKey() {
        const { choice } = await inquirer.prompt([{
            type: 'list',
            name: 'choice',
            message: 'How would you like to proceed?',
            choices: [
                { name: 'I have an API key - let me enter it', value: 'enter' },
                { name: 'Open xAI Console in browser to get a key', value: 'browser' },
                { name: 'I\'ll set it up later', value: 'later' }
            ]
        }]);

        if (choice === 'browser') {
            console.log(chalk.yellow('\n📱 Opening xAI Console in your browser...'));
            try {
                const open = require('open');
                await open('https://console.x.ai');
            } catch (err) {
                console.log(chalk.dim('Could not open browser. Please visit: https://console.x.ai'));
            }
            
            console.log(chalk.dim('After getting your key, run this setup again.\n'));
            process.exit(0);
        }

        if (choice === 'later') {
            console.log(chalk.yellow('\nYou can set up your API key later using one of these methods:'));
            console.log(chalk.gray('1. Run: ') + chalk.cyan('grok config'));
            console.log(chalk.gray('2. Set environment variable: ') + chalk.cyan('export XAI_API_KEY="your-key"'));
            console.log(chalk.gray('3. Create .env file: ') + chalk.cyan('echo "XAI_API_KEY=your-key" > .env\n'));
            return null;
        }

        return choice;
    }

    async enterApiKey() {
        const { apiKey } = await inquirer.prompt([{
            type: 'password',
            name: 'apiKey',
            message: 'Enter your xAI API key:',
            mask: '*',
            validate: (input) => {
                if (!input) return 'API key is required';
                if (!input.startsWith('xai-')) return 'API key should start with "xai-"';
                if (input.length < 20) return 'API key seems too short';
                return true;
            }
        }]);

        return apiKey;
    }

    async validateApiKey(apiKey) {
        const spinner = ora('Validating API key...').start();

        try {
            const client = new OpenAI({
                apiKey: apiKey,
                baseURL: 'https://api.x.ai/v1',
                timeout: 10000
            });

            // Test the API key with a minimal request
            const response = await client.models.list();
            
            spinner.succeed(chalk.green('API key validated successfully!'));
            return true;
        } catch (error) {
            spinner.fail(chalk.red('API key validation failed'));
            
            if (error.status === 401) {
                console.log(chalk.red('❌ Invalid API key. Please check and try again.'));
            } else if (error.status === 429) {
                console.log(chalk.yellow('⚠️ Rate limit reached. Key is valid but try again later.'));
                return true; // Key is valid, just rate limited
            } else {
                console.log(chalk.red(`❌ Error: ${error.message}`));
            }
            
            return false;
        }
    }

    async saveApiKey(apiKey) {
        const { saveMethod } = await inquirer.prompt([{
            type: 'list',
            name: 'saveMethod',
            message: 'Where would you like to save your API key?',
            choices: [
                { name: 'Secure config file (Recommended)', value: 'config' },
                { name: 'Local .env file (Project only)', value: 'env' },
                { name: 'Both config and .env', value: 'both' },
                { name: 'Don\'t save (I\'ll set it manually)', value: 'none' }
            ]
        }]);

        const saved = [];

        if (saveMethod === 'config' || saveMethod === 'both') {
            this.config.set('apiKey', apiKey);
            saved.push('Config file (~/.config/grok-cli/)');
        }

        if (saveMethod === 'env' || saveMethod === 'both') {
            const envPath = path.join(process.cwd(), '.env');
            const envContent = `# xAI API Key for Grok CLI\nXAI_API_KEY=${apiKey}\n`;
            await fs.writeFile(envPath, envContent);
            saved.push('.env file');
            
            // Add .env to .gitignore if it exists
            const gitignorePath = path.join(process.cwd(), '.gitignore');
            if (fs.existsSync(gitignorePath)) {
                const gitignore = await fs.readFile(gitignorePath, 'utf-8');
                if (!gitignore.includes('.env')) {
                    await fs.appendFile(gitignorePath, '\n# API Keys\n.env\n');
                    console.log(chalk.dim('Added .env to .gitignore'));
                }
            }
        }

        if (saved.length > 0) {
            console.log(chalk.green(`\n✓ API key saved to: ${saved.join(' and ')}`));
        }

        return saveMethod !== 'none';
    }

    async showQuickStart() {
        const quickStartBox = boxen(
            chalk.bold('🚀 Quick Start Guide\n\n') +
            chalk.white('Interactive chat:\n') +
            chalk.cyan('  grok\n\n') +
            chalk.white('Direct message:\n') +
            chalk.cyan('  grok chat "Hello, Grok!"\n\n') +
            chalk.white('Generate image:\n') +
            chalk.cyan('  grok image "A futuristic city"\n\n') +
            chalk.white('Search the web:\n') +
            chalk.cyan('  grok search "Latest AI news"\n\n') +
            chalk.white('View all commands:\n') +
            chalk.cyan('  grok --help\n\n') +
            chalk.dim('In chat, type /help for more commands'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'green',
                title: '✨ You\'re all set!',
                titleAlignment: 'center'
            }
        );

        console.log(quickStartBox);
    }

    async run() {
        await this.showWelcome();

        // Check for existing API key
        const existingKey = await this.checkExistingKey();
        
        if (existingKey) {
            const { useExisting } = await inquirer.prompt([{
                type: 'confirm',
                name: 'useExisting',
                message: 'An API key is already configured. Would you like to use it?',
                default: true
            }]);

            if (useExisting) {
                console.log(chalk.green('\n✓ Using existing API key configuration'));
                await this.showQuickStart();
                return existingKey;
            }
        }

        // Show instructions
        await this.showInstructions();

        // Prompt for action
        const choice = await this.promptForKey();
        if (!choice) return null;

        // Enter and validate API key
        let apiKey = null;
        let isValid = false;

        while (!isValid) {
            apiKey = await this.enterApiKey();
            isValid = await this.validateApiKey(apiKey);

            if (!isValid) {
                const { retry } = await inquirer.prompt([{
                    type: 'confirm',
                    name: 'retry',
                    message: 'Would you like to try again?',
                    default: true
                }]);

                if (!retry) {
                    console.log(chalk.yellow('\nSetup cancelled. You can run setup again with: grok config'));
                    return null;
                }
            }
        }

        // Save the API key
        await this.saveApiKey(apiKey);

        // Show quick start guide
        await this.showQuickStart();

        return apiKey;
    }

    async checkAndSetup() {
        // Quick check if API key exists
        const existingKey = await this.checkExistingKey();
        
        if (!existingKey) {
            console.log(chalk.yellow('\n⚠️  No API key found. Starting setup wizard...\n'));
            return await this.run();
        }

        return existingKey;
    }
}

module.exports = SetupWizard;