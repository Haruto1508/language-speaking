import { LanguageCode } from '../types';
import { EnhancedScenario, SampleDialogueStep, KOREAN_SCENARIOS } from './korean/scenarios';
import { ENGLISH_SCENARIOS } from './english/scenarios';

export type { EnhancedScenario, SampleDialogueStep };
export { KOREAN_SCENARIOS, ENGLISH_SCENARIOS };

// Get isolated conversation scenarios for a given language
export const getScenariosByLanguage = (language: LanguageCode): EnhancedScenario[] => {
  return language === 'KO' ? KOREAN_SCENARIOS : ENGLISH_SCENARIOS;
};

// Merged reference for backward compatibility
export const COMPREHENSIVE_SCENARIOS: EnhancedScenario[] = [
  ...KOREAN_SCENARIOS,
  ...ENGLISH_SCENARIOS,
];
