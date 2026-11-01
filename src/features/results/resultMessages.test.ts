import { describe, expect, it } from 'vitest';
import { getResultMessage } from './resultMessages';

describe('result messages', () => {
  it('praises a new best or first place', () => {
    expect(getResultMessage(true, false)).toBe('멋쟁이네~');
    expect(getResultMessage(false, true)).toBe('멋쟁이네~');
    expect(getResultMessage(false, false)).toBe('재미난 친구네 ?');
  });
});
