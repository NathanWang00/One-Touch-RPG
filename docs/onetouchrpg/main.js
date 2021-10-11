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
	ENEMY_0_HEALTH: 200,

	GUARD_HOLD_LENGTH: 0.3,
	RESET_LENGTH: 0.15,

	STAB_TAP_AMOUNT: 2,
	STAB_DELAY: 0.1,

	HEALTH_BAR_LENGTH: 6,
	HEALTH_BAR_OFFSET: 5
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
 * hBarIndex: number
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
 * hBarIndex: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemy;

/**
 * @typedef {{
 * maxHealth: number
 * health: number
 * pos: Vector
 * }} HealthBar
 */
 let healthBar;

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
			pos: vec(G.WIDTH/2, G.HEIGHT*2/3),
			hBarIndex: 0
		};
		healthBar = [];
		healthBar.push({
			maxHealth: G.PLAYER_HEALTH,
			health: G.PLAYER_HEALTH,
			pos: player.pos
		});

		enemy = [];

		for (let index = 0; index < 3; index++) {
			enemy.push({
				health: G.ENEMY_0_HEALTH,
				type: 0,
				order: index,
				hBarIndex: index + 1
			});
			const interval = G.WIDTH / 4;
			const position = (index * interval) + interval;
			healthBar.push({
				maxHealth: G.ENEMY_0_HEALTH,
				health: G.PLAYER_HEALTH,
				pos: vec(position, G.HEIGHT/3)
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

	// health bars
	healthBar.forEach(hb => {
		color("green");
		box(hb.pos.x, hb.pos.y+G.HEALTH_BAR_OFFSET, 6, 1);
	});
}
