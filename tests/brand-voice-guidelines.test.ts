import { describe, expect, it } from 'vitest';
import {
  presentVoiceGuidelines,
  voiceGuidelinesHaveContent,
} from '../src/brandVoiceGuidelines.js';

describe('presentVoiceGuidelines', () => {
  it('maps the agent success payload onto the fields Brand Voice renders', () => {
    const view = presentVoiceGuidelines({
      voicePillars: [
        {
          pillar: 'Warm & Welcoming',
          description: 'Sound like a host, not a brochure',
          examples: ['Come in from the cold'],
        },
      ],
      toneSpectrum: [
        {
          context: 'Product launches',
          tone: 'Excited but not hyperbolic',
          example: 'The balm that earns the last chair',
        },
      ],
      vocabulary: {
        preferred: ['recovery'],
        avoid: ['miracle'],
        signature: ['Earn the descent'],
      },
      grammarAndStyle: ['Use contractions'],
      platformAdaptations: {
        instagram: 'Short, sensory, first person',
        tiktok: 'Direct and playful',
      },
    });

    expect(view).not.toBeNull();
    expect(view?.voiceAttributes).toEqual([
      'Warm & Welcoming — Sound like a host, not a brochure',
      'Come in from the cold',
    ]);
    expect(view?.toneByPlatform).toEqual({
      instagram: 'Short, sensory, first person',
      tiktok: 'Direct and playful',
    });
    expect(view?.doSay).toEqual(['recovery']);
    expect(view?.dontSay).toEqual(['miracle']);
    expect(view?.signaturePhrases).toEqual(['Earn the descent']);
    expect(view?.styleRules).toEqual([
      'Use contractions',
      'Product launches: Excited but not hyperbolic — The balm that earns the last chair',
    ]);
    expect(voiceGuidelinesHaveContent(view!)).toBe(true);
  });

  it('keeps an already rendered view model', () => {
    const view = presentVoiceGuidelines({
      voiceAttributes: ['Direct'],
      toneByPlatform: { instagram: 'Short' },
      doSay: ['recovery'],
      dontSay: ['miracle'],
      signaturePhrases: ['Earn the descent'],
      styleRules: ['Use contractions'],
    });

    expect(view).toEqual({
      voiceAttributes: ['Direct'],
      toneByPlatform: { instagram: 'Short' },
      doSay: ['recovery'],
      dontSay: ['miracle'],
      signaturePhrases: ['Earn the descent'],
      styleRules: ['Use contractions'],
    });
  });

  it('returns null when the voice call produced no payload', () => {
    expect(presentVoiceGuidelines(undefined)).toBeNull();
    expect(presentVoiceGuidelines(null)).toBeNull();
    expect(presentVoiceGuidelines('guidelines')).toBeNull();
  });

  it('does not throw when list fields are strings or missing', () => {
    const view = presentVoiceGuidelines({
      voicePillars: 'Warm',
      vocabulary: { preferred: 'recovery', avoid: null },
      platformAdaptations: 'keep it short',
      grammarAndStyle: 'Use contractions',
    });

    expect(view).toEqual({
      voiceAttributes: [],
      toneByPlatform: {},
      doSay: ['recovery'],
      dontSay: [],
      signaturePhrases: [],
      styleRules: ['Use contractions'],
    });
  });
});
