// Export module for conversation history
const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const chalk = require('chalk');

class ExportManager {
    constructor() {
        this.exportDir = path.join(process.cwd(), 'grok-exports');
    }
    
    async ensureExportDir() {
        await fs.ensureDir(this.exportDir);
    }
    
    generateFilename(format) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `grok-conversation-${timestamp}.${format}`;
    }
    
    async exportToMarkdown(messages, metadata = {}) {
        await this.ensureExportDir();
        
        let content = '# Grok Conversation\n\n';
        content += `**Date:** ${new Date().toLocaleDateString()}\n`;
        content += `**Time:** ${new Date().toLocaleTimeString()}\n`;
        content += `**Model:** ${metadata.model || 'grok-4'}\n`;
        content += `**Messages:** ${messages.length}\n\n`;
        content += '---\n\n';
        
        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 User' : '🤖 Grok';
            content += `## ${role}\n\n`;
            content += `${msg.content}\n\n`;
            if (index < messages.length - 1) {
                content += '---\n\n';
            }
        });
        
        const filename = this.generateFilename('md');
        const filepath = path.join(this.exportDir, filename);
        await fs.writeFile(filepath, content);
        
        return filepath;
    }
    
    async exportToJSON(messages, metadata = {}) {
        await this.ensureExportDir();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            model: metadata.model || 'grok-4',
            messageCount: messages.length,
            conversation: messages,
            metadata: metadata
        };
        
        const filename = this.generateFilename('json');
        const filepath = path.join(this.exportDir, filename);
        await fs.writeJson(filepath, exportData, { spaces: 2 });
        
        return filepath;
    }
    
    async exportToHTML(messages, metadata = {}) {
        await this.ensureExportDir();
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok Conversation - ${new Date().toLocaleDateString()}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .metadata {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .metadata-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .metadata-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .metadata-value {
            font-size: 1.1em;
            font-weight: bold;
        }
        
        .messages {
            padding: 30px;
        }
        
        .message {
            margin-bottom: 25px;
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 10px;
        }
        
        .message-role {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .message-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;
        }
        
        .user .message-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .assistant .message-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        .message-content {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 15px;
            margin-left: 40px;
            line-height: 1.6;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .user .message-content {
            background: linear-gradient(135deg, #e3e9ff 0%, #f3e7ff 100%);
        }
        
        .assistant .message-content {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe9f5 100%);
        }
        
        .message-content pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .message-content code {
            background: #e2e8f0;
            color: #2d3748;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        
        .message-content pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .metadata {
                flex-direction: column;
                gap: 10px;
            }
            
            .messages {
                padding: 20px;
            }
            
            .message-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Grok Conversation</h1>
            <div class="metadata">
                <div class="metadata-item">
                    <div class="metadata-label">Date</div>
                    <div class="metadata-value">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Time</div>
                    <div class="metadata-value">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Model</div>
                    <div class="metadata-value">${metadata.model || 'grok-4'}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Messages</div>
                    <div class="metadata-value">${messages.length}</div>
                </div>
            </div>
        </div>
        
        <div class="messages">
            ${messages.map(msg => {
                const roleClass = msg.role === 'user' ? 'user' : 'assistant';
                const roleIcon = msg.role === 'user' ? '👤' : '🤖';
                const roleName = msg.role === 'user' ? 'You' : 'Grok';
                
                // Convert markdown to HTML
                const htmlContent = marked(msg.content);
                
                return `
                    <div class="message ${roleClass}">
                        <div class="message-header">
                            <div class="message-icon">${roleIcon}</div>
                            <div class="message-role">${roleName}</div>
                        </div>
                        <div class="message-content">
                            ${htmlContent}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="footer">
            <p>Exported from <a href="https://x.ai">Grok-4 CLI</a> • Powered by xAI</p>
        </div>
    </div>
</body>
</html>`;
        
        const filename = this.generateFilename('html');
        const filepath = path.join(this.exportDir, filename);
        await fs.writeFile(filepath, html);
        
        return filepath;
    }
    
    async exportToTXT(messages, metadata = {}) {
        await this.ensureExportDir();
        
        let content = 'GROK CONVERSATION\n';
        content += '=================\n\n';
        content += `Date: ${new Date().toLocaleDateString()}\n`;
        content += `Time: ${new Date().toLocaleTimeString()}\n`;
        content += `Model: ${metadata.model || 'grok-4'}\n`;
        content += `Messages: ${messages.length}\n\n`;
        content += '─'.repeat(50) + '\n\n';
        
        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'USER' : 'GROK';
            content += `[${role}]\n`;
            content += `${msg.content}\n\n`;
            if (index < messages.length - 1) {
                content += '─'.repeat(50) + '\n\n';
            }
        });
        
        const filename = this.generateFilename('txt');
        const filepath = path.join(this.exportDir, filename);
        await fs.writeFile(filepath, content);
        
        return filepath;
    }
}

module.exports = ExportManager;