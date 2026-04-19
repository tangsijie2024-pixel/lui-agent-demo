import express from 'express';
import { json } from 'express';
import { passiveResponse } from './agent/passiveResponse';
import { proactiveResponse } from './agent/proactiveResponse';
import { updateFeed } from './skills/memory/updateMemory';
import { ConversationMessage } from './types';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(json());
app.use(express.static('public'));

app.get('/api', (_req, res) => {
  res.json({
    name: 'LUI Agent',
    version: '2.0',
    routes: {
      'POST /chat': '被动响应主链路 — { userId, query }',
    },
    users: ['user_001 (Sijie)', 'user_002 (Lin)', 'user_003 (Yumi)'],
  });
});

// 被动响应主链路
app.post('/chat', async (req, res) => {
  const { userId, query, messages } = req.body as {
    userId?: string;
    query?: string;
    messages?: ConversationMessage[];
  };

  if (!userId || !query) {
    res.status(400).json({ error: 'userId 和 query 都是必填项' });
    return;
  }

  try {
    const result = await passiveResponse(userId, query, messages ?? []);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/chat error]', message);
    res.status(500).json({ error: message });
  }
});

// 主动推送链路
app.get('/proactive/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await proactiveResponse(userId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/proactive error]', message);
    res.status(500).json({ error: message });
  }
});

// 标记推送已读，启动 24h 冷却
app.post('/mark-read/:userId', (req, res) => {
  const { userId } = req.params;
  try {
    updateFeed(userId, { last_push_time: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/mark-read error]', message);
    res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`\nLUI Agent 运行中 → http://localhost:${port}`);
  console.log(`\n测试命令：`);
  console.log(`curl -s -X POST http://localhost:${port}/chat \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"userId":"user_001","query":"附近有什么酒吧"}' | jq\n`);
});
