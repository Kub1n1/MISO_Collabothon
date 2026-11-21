import type { GameResult } from '../types';

const STORAGE_KEY = 'miso.gameResults';

function parseGameResult(value: unknown): GameResult | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('completedAt' in value) ||
    typeof value.completedAt !== 'string' ||
    !('score' in value) ||
    typeof value.score !== 'number' ||
    !Number.isFinite(value.score)
  ) {
    return null;
  }

  if (!('savingsTotal' in value) && !('psyche' in value)) {
    return {
      completedAt: value.completedAt,
      savingsTotal: value.score,
      psyche: 0,
      score: value.score,
    };
  }

  if (
    !('savingsTotal' in value) ||
    typeof value.savingsTotal !== 'number' ||
    !Number.isFinite(value.savingsTotal) ||
    !('psyche' in value) ||
    typeof value.psyche !== 'number' ||
    !Number.isFinite(value.psyche) ||
    value.psyche < 0 ||
    value.psyche > 100
  ) {
    return null;
  }

  return {
    completedAt: value.completedAt,
    savingsTotal: value.savingsTotal,
    psyche: value.psyche,
    score: value.score,
  };
}

export function readGameResults(): GameResult[] {
  const savedResults = window.localStorage.getItem(STORAGE_KEY);
  if (!savedResults) return [];

  const parsed: unknown = JSON.parse(savedResults);
  if (!Array.isArray(parsed)) {
    throw new Error('Saved game history has an invalid format.');
  }

  const results = parsed.map(parseGameResult);
  if (results.some((result) => result === null)) {
    throw new Error('Saved game history has an invalid format.');
  }

  return results.filter((result): result is GameResult => result !== null);
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