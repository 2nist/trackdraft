#!/usr/bin/env node

/**
 * TrackDraft Reaper Bridge Server (Alternative)
 * 
 * This is a standalone Node.js HTTP server that bridges TrackDraft and Reaper.
 * It solves the Windows LuaSocket DLL compatibility issue by running outside Reaper.
 * 
 * Communication flow:
 * TrackDraft (HTTP) <-> Node.js Server <-> Reaper (File-based IPC)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 8888;
const IPC_DIR = path.join(os.tmpdir(), 'trackdraft-bridge');
const REQUEST_FILE = path.join(IPC_DIR, 'request.json');
const RESPONSE_FILE = path.join(IPC_DIR, 'response.json');
const HEARTBEAT_FILE = path.join(IPC_DIR, 'heartbeat.txt');

// Ensure IPC directory exists
if (!fs.existsSync(IPC_DIR)) {
    fs.mkdirSync(IPC_DIR, { recursive: true });
}

console.log('TrackDraft Bridge Server (Alternative)');
console.log('======================================');
console.log(`IPC Directory: ${IPC_DIR}`);
console.log('');

/**
 * Send command to Reaper via file-based IPC
 */
function sendToReaper(command, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // Clean up old files
        if (fs.existsSync(RESPONSE_FILE)) {
            fs.unlinkSync(RESPONSE_FILE);
        }

        // Write request
        fs.writeFileSync(REQUEST_FILE, JSON.stringify(command));

        // Poll for response
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (fs.existsSync(RESPONSE_FILE)) {
                clearInterval(checkInterval);
                
                try {
                    const responseData = fs.readFileSync(RESPONSE_FILE, 'utf8');
                    const response = JSON.parse(responseData);
                    
                    // Clean up
                    fs.unlinkSync(RESPONSE_FILE);
                    
                    resolve(response);
                } catch (error) {
                    reject(new Error('Failed to parse Reaper response: ' + error.message));
                }
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Timeout waiting for Reaper response'));
            }
        }, 50); // Check every 50ms
    });
}

/**
 * Check if Reaper bridge script is running
 */
function isReaperConnected() {
    if (!fs.existsSync(HEARTBEAT_FILE)) {
        return false;
    }

    try {
        const stats = fs.statSync(HEARTBEAT_FILE);
        const age = Date.now() - stats.mtimeMs;
        
        // Heartbeat should be updated every 2 seconds
        return age < 5000;
    } catch (error) {
        return false;
    }
}

/**
 * HTTP Server
 */
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Method not allowed. Use POST.'
        }));
        return;
    }

    // Read request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const command = JSON.parse(body);
            
            console.log(`[${new Date().toISOString()}] Command: ${command.command}`);

            // Handle ping locally (fast path)
            if (command.command === 'ping') {
                const response = {
                    success: true,
                    message: 'pong',
                    reaperConnected: isReaperConnected()
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                return;
            }

            // Check Reaper connection
            if (!isReaperConnected()) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Reaper bridge script is not running'
                }));
                return;
            }

            // Forward to Reaper
            const response = await sendToReaper(command);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            
        } catch (error) {
            console.error('Error:', error.message);
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    });
});

// Start server
server.listen(PORT, '127.0.0.1', () => {
    console.log(`✓ HTTP Server listening on http://127.0.0.1:${PORT}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Load the bridge script in Reaper: reaper_bridge_ipc.lua');
    console.log('2. TrackDraft will connect automatically');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close(() => {
        // Clean up IPC files
        try {
            if (fs.existsSync(REQUEST_FILE)) fs.unlinkSync(REQUEST_FILE);
            if (fs.existsSync(RESPONSE_FILE)) fs.unlinkSync(RESPONSE_FILE);
            if (fs.existsSync(HEARTBEAT_FILE)) fs.unlinkSync(HEARTBEAT_FILE);
        } catch (error) {
            // Ignore cleanup errors
        }
        
        console.log('Server stopped');
        process.exit(0);
    });
});

// Monitor Reaper connection
setInterval(() => {
    const connected = isReaperConnected();
    
    if (connected && !server.reaperWasConnected) {
        console.log(`[${new Date().toISOString()}] ✓ Reaper bridge script connected`);
    } else if (!connected && server.reaperWasConnected) {
        console.log(`[${new Date().toISOString()}] ✗ Reaper bridge script disconnected`);
    }
    
    server.reaperWasConnected = connected;
}, 2000);

