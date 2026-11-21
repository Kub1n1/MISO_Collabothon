import type { GameResult } from '../types';

const STORAGE_KEY = 'miso.gameResults';

function isGameResult(value: unknown): value is GameResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'completedAt' in value &&
    typeof value.completedAt === 'string' &&
    'score' in value &&
    typeof value.score === 'number' &&
    Number.isFinite(value.score)
  );
}

export function readGameResults(): GameResult[] {
  const savedResults = window.localStorage.getItem(STORAGE_KEY);
  if (!savedResults) return [];

  const parsed: unknown = JSON.parse(savedResults);
  if (!Array.isArray(parsed) || !parsed.every(isGameResult)) {
    throw new Error('Saved game history has an invalid format.');
  }

  return parsed;
}

export function saveGameResult(result: GameResult): GameResult[] {
  const results = readGameResults();

  if (!results.some((saved) => saved.completedAt === result.completedAt)) {
    results.push(result);
    results.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }

  return results;
}