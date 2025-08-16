#!/usr/bin/env node

// Test script to verify chat persistence
const { spawn } = require('child_process');
const path = require('path');

console.log('Testing Grok CLI chat persistence...\n');

const grokPath = path.join(__dirname, 'grok');
const child = spawn('node', [grokPath], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let outputBuffer = '';
let testPhase = 0;
let testTimeout;

// Capture output
child.stdout.on('data', (data) => {
    const output = data.toString();
    outputBuffer += output;
    process.stdout.write(output);
    
    // Clear timeout on any output
    if (testTimeout) {
        clearTimeout(testTimeout);
        testTimeout = null;
    }
    
    // Test phases
    if (testPhase === 0 && output.includes('Interactive chat started')) {
        console.log('\n✓ Chat started successfully');
        testPhase = 1;
        
        // Send first message after a delay
        setTimeout(() => {
            console.log('\n→ Sending test message: "Hello"\n');
            child.stdin.write('Hello\n');
            
            // Set timeout for response
            testTimeout = setTimeout(() => {
                console.log('\n✗ No response received after first message');
                child.kill();
                process.exit(1);
            }, 10000);
        }, 1000);
    } else if (testPhase === 1 && (output.includes('Grok:') || output.includes('Assistant:'))) {
        console.log('\n✓ Received AI response');
        testPhase = 2;
        
        // Check if prompt returns
        setTimeout(() => {
            if (outputBuffer.includes('You:')) {
                console.log('✓ Prompt returned after AI response');
                
                // Send second message to verify persistence
                console.log('\n→ Sending second test message: "What is 2+2?"\n');
                child.stdin.write('What is 2+2?\n');
                
                testTimeout = setTimeout(() => {
                    console.log('\n✗ No response to second message');
                    child.kill();
                    process.exit(1);
                }, 10000);
            } else {
                console.log('\n✗ Prompt did not return - chat did not persist!');
                child.kill();
                process.exit(1);
            }
        }, 2000);
    } else if (testPhase === 2 && output.includes('4')) {
        console.log('\n✓ Received second AI response');
        console.log('✓ Chat persistence verified!\n');
        
        // Exit gracefully
        setTimeout(() => {
            child.stdin.write('exit\n');
        }, 1000);
    }
});

child.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
});

child.on('close', (code) => {
    if (testPhase >= 2) {
        console.log('✅ Test completed successfully!');
        process.exit(0);
    } else {
        console.log(`❌ Test failed at phase ${testPhase}`);
        process.exit(1);
    }
});

// Overall timeout
setTimeout(() => {
    console.log('\n❌ Test timed out');
    child.kill();
    process.exit(1);
}, 30000);