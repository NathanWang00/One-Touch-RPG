title = "One Touch RPG";

description = 
`[Tap] Attack
[Hold] Guard
`;

characters = [];

const G = {
	WIDTH: 100,
	HEIGHT: 120,

	GUARD_HOLD_LENGTH: 0.3,
	RESET_LENGTH: 0.15,

	STAB_TAP_AMOUNT: 2,
	STAB_DELAY: 0.1,
}

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	theme: "simple",
	isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2
};

const playerStates = {
	DEFAULT: "default",
	GUARDING: "guarding",
	SLASHING: "slashing",
	STABBING: "stabbing"
}

/**
 * @type { string }
 */
let playerState = playerStates.DEFAULT;

/**
 * @type { number }
 */
 let pressedTime = 0;

/**
 * @type { number }
 */
 let releasedTime = 0;

 /**
 * @type { number }
 */
  let lastStabTime = 0;

 /**
 * @type { number }
 */
let tapAmount = 0;

function update() {
	if (!ticks) {

	}
	// input and state determination
	if (input.isJustPressed) {
		releasedTime = 0;
	}
	if (input.isJustReleased) {
		if (playerState == playerStates.GUARDING) {
			playerState = playerStates.DEFAULT;
		} else if (pressedTime < G.GUARD_HOLD_LENGTH) {
			tapAmount++;
			if (tapAmount >= G.STAB_TAP_AMOUNT) {
				playerState = playerStates.STABBING;
			}
		}
		pressedTime = 0;
	}
	if (input.isPressed) {
		pressedTime += 1/60; // all inputs are measured in seconds
		if (pressedTime >= G.GUARD_HOLD_LENGTH) {
			playerState = playerStates.GUARDING;
			tapAmount = 0;
		}
	} else {
		releasedTime += 1/60;
		if (releasedTime >= G.RESET_LENGTH) {
			if (tapAmount >= G.STAB_TAP_AMOUNT) {
				playerState = playerStates.DEFAULT;
			} else if (tapAmount > 0) {
				playerState = playerStates.SLASHING;
			}
			tapAmount = 0;
		}
	}

	// player actions
	switch (playerState) {
		case playerStates.DEFAULT:
			break;
		case playerStates.GUARDING:
			console.log("guarding");
			break;
		case playerStates.SLASHING:
			console.log("slash");
			playerState = playerStates.DEFAULT;
			break;
		case playerStates.STABBING:
			lastStabTime -= 1/60;
			if (lastStabTime <= 0) {
				lastStabTime = G.STAB_DELAY;
				console.log("stab");
			}
			break;
	}
}
