title = "One Touch RPG";

description = 
`
[Tap] Attack
[Hold] Guard
`;

characters = [
// Player (placeholder)
`
 l  l

l    l
 llll
`,
// Enemy 1 (placeholder)
`
 l  l

 llll
l    l
`
];

const G = {
	WIDTH: 95,
	HEIGHT: 70,

	PLAYER_HEALTH: 100,

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
 * @typedef {{
 * health: number
 * pos: Vector
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * health: number
 * type: number
 * order: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemy;

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
		player = {
			health: G.PLAYER_HEALTH,
			pos: vec(G.WIDTH/2, G.HEIGHT*2/3)
		};

		enemy = [];

		for (let index = 0; index < 3; index++) {
			enemy.push({
				health: 1,
				type: 0,
				order: index
			});
		}
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

	// player sprite
	color("black");
	char("a", player.pos);

	// enemy sprites
	enemy.forEach(e => {
		color("black");
		const interval = G.WIDTH / (enemy.length + 1);
		const position = (e.order * interval) + interval;
		char("b", vec(position, G.HEIGHT/3));
	});
	
}
