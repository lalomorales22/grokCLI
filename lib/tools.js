// Tool execution module for Grok CLI
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Define available tools
const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'read_file',
            description: 'Read contents of a file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the file' }
                },
                required: ['path']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'write_file',
            description: 'Write content to a file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the file' },
                    content: { type: 'string', description: 'Content to write' }
                },
                required: ['path', 'content']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'edit_file',
            description: 'Edit a file by replacing text',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the file' },
                    search: { type: 'string', description: 'Text to search for' },
                    replace: { type: 'string', description: 'Text to replace with' }
                },
                required: ['path', 'search', 'replace']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'list_directory',
            description: 'List contents of a directory',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to the directory' },
                    recursive: { type: 'boolean', description: 'List recursively' }
                },
                required: ['path']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_directory',
            description: 'Create a new directory',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path for the new directory' }
                },
                required: ['path']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'delete_file',
            description: 'Delete a file or directory',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'Path to delete' }
                },
                required: ['path']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'run_command',
            description: 'Execute a shell command',
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'Command to execute' },
                    cwd: { type: 'string', description: 'Working directory' }
                },
                required: ['command']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'http_request',
            description: 'Make an HTTP request',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to request' },
                    method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], description: 'HTTP method' },
                    headers: { type: 'object', description: 'Request headers' },
                    data: { type: 'object', description: 'Request body data' }
                },
                required: ['url']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_environment_info',
            description: 'Get system and environment information',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    }
];

// Approval workflow
class ApprovalWorkflow {
    constructor(mode = 'suggest') {
        this.mode = mode; // 'suggest', 'auto-edit', 'full-auto'
    }
    
    async requestApproval(action, details) {
        if (this.mode === 'full-auto') {
            console.log(chalk.dim(`Auto-approved: ${action}`));
            return true;
        }
        
        if (this.mode === 'auto-edit' && action.includes('edit')) {
            console.log(chalk.dim(`Auto-approved edit: ${action}`));
            return true;
        }
        
        const { approved } = await inquirer.prompt([{
            type: 'confirm',
            name: 'approved',
            message: `Allow: ${action}?\n${chalk.dim(details)}`,
            default: true
        }]);
        
        return approved;
    }
}

// Tool executor
class ToolExecutor {
    constructor(approvalWorkflow) {
        this.approval = approvalWorkflow;
    }
    
    async execute(name, args) {
        try {
            switch (name) {
                case 'read_file':
                    return await this.readFile(args);
                    
                case 'write_file':
                    return await this.writeFile(args);
                    
                case 'edit_file':
                    return await this.editFile(args);
                    
                case 'list_directory':
                    return await this.listDirectory(args);
                    
                case 'create_directory':
                    return await this.createDirectory(args);
                    
                case 'delete_file':
                    return await this.deleteFile(args);
                    
                case 'run_command':
                    return await this.runCommand(args);
                    
                case 'http_request':
                    return await this.httpRequest(args);
                    
                case 'get_environment_info':
                    return await this.getEnvironmentInfo();
                    
                default:
                    return { error: `Unknown tool: ${name}` };
            }
        } catch (error) {
            return { error: error.message };
        }
    }
    
    async readFile(args) {
        const approved = await this.approval.requestApproval(
            'Read file',
            `Path: ${args.path}`
        );
        
        if (!approved) return { cancelled: true };
        
        const content = await fs.readFile(args.path, 'utf-8');
        return { content, lines: content.split('\n').length };
    }
    
    async writeFile(args) {
        const approved = await this.approval.requestApproval(
            'Write file',
            `Path: ${args.path}\nSize: ${args.content.length} chars`
        );
        
        if (!approved) return { cancelled: true };
        
        await fs.ensureFile(args.path);
        await fs.writeFile(args.path, args.content);
        return { success: true, path: args.path };
    }
    
    async editFile(args) {
        const approved = await this.approval.requestApproval(
            'Edit file',
            `Path: ${args.path}\nReplace: "${args.search.substring(0, 50)}..."`
        );
        
        if (!approved) return { cancelled: true };
        
        let content = await fs.readFile(args.path, 'utf-8');
        const occurrences = (content.match(new RegExp(args.search, 'g')) || []).length;
        content = content.replace(new RegExp(args.search, 'g'), args.replace);
        await fs.writeFile(args.path, content);
        
        return { success: true, replacements: occurrences };
    }
    
    async listDirectory(args) {
        const approved = await this.approval.requestApproval(
            'List directory',
            `Path: ${args.path}`
        );
        
        if (!approved) return { cancelled: true };
        
        const items = await fs.readdir(args.path);
        const details = await Promise.all(items.map(async item => {
            const fullPath = path.join(args.path, item);
            const stats = await fs.stat(fullPath);
            return {
                name: item,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size
            };
        }));
        
        return { items: details };
    }
    
    async createDirectory(args) {
        const approved = await this.approval.requestApproval(
            'Create directory',
            `Path: ${args.path}`
        );
        
        if (!approved) return { cancelled: true };
        
        await fs.ensureDir(args.path);
        return { success: true, path: args.path };
    }
    
    async deleteFile(args) {
        const approved = await this.approval.requestApproval(
            'Delete file/directory',
            `Path: ${args.path}\n⚠️ This action cannot be undone!`
        );
        
        if (!approved) return { cancelled: true };
        
        await fs.remove(args.path);
        return { success: true, deleted: args.path };
    }
    
    async runCommand(args) {
        const approved = await this.approval.requestApproval(
            'Run shell command',
            `Command: ${args.command}\nDirectory: ${args.cwd || process.cwd()}`
        );
        
        if (!approved) return { cancelled: true };
        
        const { stdout, stderr } = await execAsync(args.command, {
            cwd: args.cwd || process.cwd()
        });
        
        return { stdout, stderr };
    }
    
    async httpRequest(args) {
        const approved = await this.approval.requestApproval(
            'Make HTTP request',
            `${args.method || 'GET'} ${args.url}`
        );
        
        if (!approved) return { cancelled: true };
        
        const response = await axios({
            url: args.url,
            method: args.method || 'GET',
            headers: args.headers || {},
            data: args.data
        });
        
        return {
            status: response.status,
            data: response.data
        };
    }
    
    async getEnvironmentInfo() {
        return {
            platform: process.platform,
            nodeVersion: process.version,
            cwd: process.cwd(),
            env: {
                USER: process.env.USER || process.env.USERNAME,
                HOME: process.env.HOME || process.env.USERPROFILE
            }
        };
    }
}

module.exports = {
    TOOL_DEFINITIONS,
    ApprovalWorkflow,
    ToolExecutor
};