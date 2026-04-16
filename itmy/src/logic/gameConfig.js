export const CANVAS_WIDTH = 980;
export const CANVAS_HEIGHT = 620;
export const TOTAL_BOXES = 20;
export const GAME_SECONDS = 35;
export const GONE_STAGE = 3;
export const LATE_GAME_SECONDS = 10;
export const LATE_GAME_MAX_MULTIPLIER = 1.3;

export const DIFFICULTY_MODES = {
	easy: {
		id: 'easy',
		title: 'Easy',
		description: 'The original pace.',
		meltSpeedMultiplier: 1,
		relocateOnSave: false,
	},
	hard: {
		id: 'hard',
		title: 'Hard',
		description: 'A little faster and a little meaner.',
		meltSpeedMultiplier: 1.15,
		relocateOnSave: false,
	},
	truePenguin: {
		id: 'truePenguin',
		title: 'True Penguin',
		description: 'Hard mode, plus every save sends the cap somewhere new.',
		meltSpeedMultiplier: 1.15,
		relocateOnSave: true,
	},
};

export const DEFAULT_DIFFICULTY = DIFFICULTY_MODES.easy;
