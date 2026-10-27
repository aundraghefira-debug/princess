export interface ChemiVerseState {
  completed_modules: string[];
  quiz_high_scores: { [quizId: string]: number };
  titration_checkpoint: { v_buret_left: number };
}

export const STORAGE_KEY = '_chemiverse_user_state';

export const DEFAULT_USER_STATE: ChemiVerseState = {
  completed_modules: [],
  quiz_high_scores: { quiz_1: 0, quiz_2: 0 },
  titration_checkpoint: { v_buret_left: 50.0 },
};

export function loadUserState(): ChemiVerseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(raw);
    return {
      completed_modules: Array.isArray(parsed.completed_modules) ? parsed.completed_modules : [],
      quiz_high_scores: typeof parsed.quiz_high_scores === 'object' && parsed.quiz_high_scores !== null ? parsed.quiz_high_scores : { quiz_1: 0, quiz_2: 0 },
      titration_checkpoint: typeof parsed.titration_checkpoint === 'object' && parsed.titration_checkpoint !== null ? parsed.titration_checkpoint : { v_buret_left: 50.0 },
    };
  } catch {
    return DEFAULT_USER_STATE;
  }
}

export function saveUserState(state: ChemiVerseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Gagal menyimpan progres belajar ke localStorage:', error);
  }
}
