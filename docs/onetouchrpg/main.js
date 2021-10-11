title = "One Touch RPG";

description = 
`[Tap] Attack
[Hold] Guard
`;

characters = [];

const G = {
	WIDTH: 100,
	HEIGHT: 120
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

function update() {
	if (!ticks) {

	}

	switch (playerState) {
		case playerStates.DEFAULT:
			break;
		case playerStates.GUARDING:
			break;
		case playerStates.SLASHING:
			break;
		case playerStates.STABBING:
			break;
	}
	console.log(playerState);
}
