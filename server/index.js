import express from 'express';
import { WebSocketServer } from 'ws';
import { marked } from 'marked';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });


wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const markdown = data.toString();
      const html = marked(markdown);
      ws.send(JSON.stringify({ html }));
    } catch (error) {
      console.error('Error processing markdown:', error);
      ws.send(JSON.stringify({ error: 'Failed to process markdown' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001; // Assuming port is in .env file
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});