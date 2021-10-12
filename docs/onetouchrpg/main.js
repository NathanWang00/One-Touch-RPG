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
	RESET_LENGTH: 0.2,

	STAB_TAP_AMOUNT: 2,
	STAB_DELAY: 0.1,
	
	STAB_DAMAGE: 10,
	SLASH_DAMAGE: 12,

	DAMAGE_VARIANCE: 0.05,

	HEALTH_BAR_LENGTH: 8,
	HEALTH_BAR_OFFSET: 5,
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
 * living: boolean
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemy;

/**
 * @type { Enemy [] }
 */
let livingEnemies;

 /**
 * @type { number }
 */
let enemyCount;

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

 /**
 * @type { number }
 */
  let stabTarget = 0;

let firstClick = false;

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
		livingEnemies = [];

		for (let index = 0; index < 3; index++) {
			enemy.push({
				health: G.ENEMY_0_HEALTH,
				type: 0,
				order: index,
				hBarIndex: index + 1,
				living: true
			});
			livingEnemies.push(enemy[index]);
			const interval = G.WIDTH / 4;
			const position = (index * interval) + interval;
			healthBar.push({
				maxHealth: G.ENEMY_0_HEALTH,
				health: G.ENEMY_0_HEALTH,
				pos: vec(position, G.HEIGHT/3)
			});
		}
		enemyCount = 3;
	}
	if (firstClick) {
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
					if (playerState != playerStates.STABBING) {
						playerState = playerStates.STABBING;
						stabTarget = rndi(0, livingEnemies.length);
					}
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
	} else if (input.isJustReleased) {
		firstClick = true;
	}
	

	// player actions
	switch (playerState) {
		case playerStates.DEFAULT:
			break;
		case playerStates.GUARDING:
			console.log("guarding");
			break;
		case playerStates.SLASHING:
			DamageAllEnemies(G.SLASH_DAMAGE);
			console.log("slash");
			playerState = playerStates.DEFAULT;
			break;
		case playerStates.STABBING:
			lastStabTime -= 1/60;
			if (lastStabTime <= 0) {
				lastStabTime = G.STAB_DELAY;
				if (enemy[stabTarget] == null) {
					stabTarget = rndi(0, livingEnemies.length);
				}
				console.log(stabTarget);
				DamageEnemy(stabTarget, G.STAB_DAMAGE);
				console.log("stab");
			}
			break;
	}

	// player sprite
	color("black");
	char("a", player.pos);

	var i = 0;
	// enemy sprites
	enemy.forEach(e => {
		if (e.health > 0) {
			const interval = G.WIDTH / (enemy.length + 1);
			const position = (e.order * interval) + interval;
			color("black");
			char("b", vec(position, G.HEIGHT/3));
			//ReorderEnemies();
		} else {
			
		}
		i++;
	});

	// health bars
	healthBar.forEach(hb => {
		color("red");
		box(hb.pos.x, hb.pos.y+G.HEALTH_BAR_OFFSET, G.HEALTH_BAR_LENGTH, 1);
		var hpLength = (hb.health / hb.maxHealth) * G.HEALTH_BAR_LENGTH;
		if (hpLength > 0 && hpLength < 1) {
			hpLength = 1;
		}
		if (hpLength < 0) {
			hpLength = 0;
		}
		const hpX = hb.pos.x - (G.HEALTH_BAR_LENGTH / 2) + (hpLength / 2);
		color("green");
		box(hpX, hb.pos.y+G.HEALTH_BAR_OFFSET, hpLength, 1);
	});
}

function DamageEnemy(order, damage) {
	const e = livingEnemies[order];
	if (e != null) {
		const hb = healthBar[e.hBarIndex];
		const randDamage = rnd(damage - (G.DAMAGE_VARIANCE / 2), damage + (G.DAMAGE_VARIANCE / 2))
		e.health -= randDamage;
		hb.health = e.health; 
		if (e.health <= 0 && e.living == true) {
			livingEnemies.splice(e.order, 1);
			e.living = false;
			enemyCount--;
		}
	}
}

function DamageAllEnemies(damage) {
	enemy.forEach(e => {
		DamageEnemy(e.order, damage);
	});
}

function ReorderEnemies() {
	var index = 0;
	enemy.forEach(e => {
		e.order = index;
		e.hBarIndex = index + 1;
		var hb = healthBar[e.hBarIndex];
		const interval = G.WIDTH / (enemy.length + 1);
		const position = (index * interval) + interval;
		hb.pos = vec(position, G.HEIGHT/3);
		index++;
	});
}