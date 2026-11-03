/**
 * Shape the brand-voice agent payload into the fields Brand Voice renders.
 * The agent asks the model for voicePillars / platformAdaptations / vocabulary.
 * The page used to read voiceAttributes and throw, which unmounted the SPA.
 */

export interface VoiceGuidelinesView {
  voiceAttributes: string[];
  toneByPlatform: Record<string, string>;
  doSay: string[];
  dontSay: string[];
  signaturePhrases: string[];
  styleRules: string[];
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return [value];
  }
  return [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' && entry.trim() !== '') {
      record[key] = entry;
    }
  }
  return record;
}

function pillarLines(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const lines: string[] = [];
  for (const pillar of value) {
    if (!pillar || typeof pillar !== 'object') {
      continue;
    }
    const record = pillar as Record<string, unknown>;
    const name = typeof record.pillar === 'string' ? record.pillar.trim() : '';
    const description = typeof record.description === 'string' ? record.description.trim() : '';
    const headline = [name, description].filter(Boolean).join(' — ');
    if (headline) {
      lines.push(headline);
    }
    lines.push(...stringList(record.examples));
  }
  return lines;
}

function styleRuleLines(data: Record<string, unknown>): string[] {
  const lines = [
    ...stringList(data.grammarAndStyle),
    ...stringList(data.captionFormulas),
    ...stringList(data.styleRules),
  ];

  if (!Array.isArray(data.toneSpectrum)) {
    return lines;
  }

  for (const item of data.toneSpectrum) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    const context = typeof record.context === 'string' ? record.context.trim() : '';
    const tone = typeof record.tone === 'string' ? record.tone.trim() : '';
    const example = typeof record.example === 'string' ? record.example.trim() : '';
    const line = [context && tone ? `${context}: ${tone}` : context || tone, example]
      .filter(Boolean)
      .join(' — ');
    if (line) {
      lines.push(line);
    }
  }

  return lines;
}

export function presentVoiceGuidelines(raw: unknown): VoiceGuidelinesView | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const vocabulary =
    data.vocabulary && typeof data.vocabulary === 'object' && !Array.isArray(data.vocabulary)
      ? (data.vocabulary as Record<string, unknown>)
      : {};

  const platformTone = stringRecord(data.platformAdaptations);
  const explicitTone = stringRecord(data.toneByPlatform);
  const preferred = stringList(vocabulary.preferred);
  const avoid = stringList(vocabulary.avoid);
  const signature = stringList(vocabulary.signature);
  const pillars = pillarLines(data.voicePillars);

  return {
    voiceAttributes: pillars.length > 0 ? pillars : stringList(data.voiceAttributes),
    toneByPlatform: Object.keys(platformTone).length > 0 ? platformTone : explicitTone,
    doSay: preferred.length > 0 ? preferred : stringList(data.doSay),
    dontSay: avoid.length > 0 ? avoid : stringList(data.dontSay),
    signaturePhrases: signature.length > 0 ? signature : stringList(data.signaturePhrases),
    styleRules: styleRuleLines(data),
  };
}

export function voiceGuidelinesHaveContent(view: VoiceGuidelinesView): boolean {
  return (
    view.voiceAttributes.length > 0 ||
    Object.keys(view.toneByPlatform).length > 0 ||
    view.doSay.length > 0 ||
    view.dontSay.length > 0 ||
    view.signaturePhrases.length > 0 ||
    view.styleRules.length > 0
  );
}
