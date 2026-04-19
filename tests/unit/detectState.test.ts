import { detectState } from '../../src/skills/state/detectState';
import { ConversationMessage } from '../../src/types';

function msgs(...pairs: [string, string][]): ConversationMessage[] {
  return pairs.map(([role, content]) => ({
    role: role as 'user' | 'assistant',
    content,
  }));
}

describe('detectState', () => {
  test('单条消息 → exploring（不调用 API）', async () => {
    const result = await detectState(msgs(['user', '想找个酒吧']));
    expect(result.state).toBe('exploring');
  });

  test('正常推荐对话 → exploring', async () => {
    const result = await detectState(msgs(
      ['user', '今晚想找个安静的地方喝一杯'],
      ['assistant', '推荐了：Constellation Bar（静安，人均280）、Volar（徐汇，人均320）'],
    ));
    expect(result.state).toBe('exploring');
  });

  test('用户明确选定 → decided，且返回地点名', async () => {
    const result = await detectState(msgs(
      ['user', '今晚想找个爵士吧'],
      ['assistant', '推荐了：Constellation Bar（静安，人均280）、Volar（徐汇，人均320）'],
      ['user', '就去 Constellation Bar 吧'],
    ));
    expect(result.state).toBe('decided');
    expect(result.decided_place).toBeTruthy();
    expect(result.decided_place?.toLowerCase()).toMatch(/constellation/i);
  });

  test('用户说"就这个"→ decided', async () => {
    const result = await detectState(msgs(
      ['user', '有没有精酿推荐'],
      ['assistant', '推荐了：拾壹里精酿（徐汇，人均180）'],
      ['user', '好，就这个了'],
    ));
    expect(result.state).toBe('decided');
  });

  test('追问已决定地点细节 → following_up', async () => {
    const result = await detectState(msgs(
      ['user', '想去爵士吧'],
      ['assistant', '推荐了：Constellation Bar（静安，人均280）'],
      ['user', '去 Constellation 吧'],
      ['assistant', '好的，Constellation Bar，记得提前到'],
      ['user', '它几点关门？'],
    ));
    expect(result.state).toBe('following_up');
    expect(result.decided_place).toBeTruthy();
  });

  test('追问停车信息 → following_up', async () => {
    const result = await detectState(msgs(
      ['user', '有没有酒吧推荐'],
      ['assistant', '推荐了：Volar（徐汇，人均320）'],
      ['user', '就去 Volar'],
      ['assistant', '好的！周六有 quartet 演出'],
      ['user', '附近有停车场吗'],
    ));
    expect(result.state).toBe('following_up');
  });

  test('完全不同话题 → new_query', async () => {
    const result = await detectState(msgs(
      ['user', '今晚想去喝酒'],
      ['assistant', '推荐了：Constellation Bar（静安，人均280）'],
      ['user', '算了不去了，明天有没有好的早午餐推荐'],
    ));
    expect(result.state).toBe('new_query');
  });

  test('返回的 state 必须是合法值', async () => {
    const validStates = ['exploring', 'decided', 'following_up', 'new_query'];
    const result = await detectState(msgs(
      ['user', '想出去走走'],
      ['assistant', '推荐了一些地方'],
      ['user', '好的谢谢'],
    ));
    expect(validStates).toContain(result.state);
  });
});
