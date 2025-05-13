import { generateRandomWord } from '@/shared/utils/functions/generateRandomWords';

describe('generateRandomWord', () => {
  const validChars = /^[A-Za-z0-9]+$/;

  it('should generate a word of default length (32)', () => {
    const word = generateRandomWord();
    expect(word).toHaveLength(32);
    expect(word).toMatch(validChars);
  });

  it('should generate a word of specified length', () => {
    const word = generateRandomWord(10);
    expect(word).toHaveLength(10);
    expect(word).toMatch(validChars);
  });

  it('should generate different words (not always same)', () => {
    const word1 = generateRandomWord();
    const word2 = generateRandomWord();
    expect(word1).not.toBe(word2); // poco probable que coincidan
  });
  it('should generate a word of length 0', () => {
    const word = generateRandomWord(0);
    expect(word).toHaveLength(0);
  });

  it('should generate a word of length 1', () => {
    const word = generateRandomWord(1);
    expect(word).toHaveLength(1);
    expect(word).toMatch(validChars);
  });
});
