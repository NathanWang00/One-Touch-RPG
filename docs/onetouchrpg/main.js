title = "One Touch RPG";

description = 
`
[Tap] Attack
[Hold] Guard
`;

characters = [
// Player 1 (placeholder)
	`
  ll  
  Yl Y
 YccY L
Ycbbc
c BB c
 l  l
	
	`,
// Enemy 1 (placeholder)
`
  ll 
 lbbl
lbpPbl
 lbbl
  ll
lb  bl
`,

`
 l  l

 llll
l    l
`
];

const G = {
	WIDTH: 115,
	HEIGHT: 80,

	PLAYER_HEALTH: 100,
	ENEMY_0_HEALTH: 150,
	ENEMY_0_SCORE_VALUE: 5,
	ENEMY_0_ATTACK: 30,
	EMEMY_0_INITIAL_DELAY: 60,
	EMEMY_0_ATTACK_DELAY: 240,
	EMEMY_0_HIT_DELAY: 50,
	ENEMY_0_ATTACK_VARIANCE: 80,

	GUARD_HOLD_LENGTH: 0.2,
	RESET_LENGTH: 0.11,

	STAB_TAP_AMOUNT: 2,
	STAB_DELAY: 0.1,
	STAB_DAMAGE: 10,

	SLASH_RESET: 0.3,
	SLASH_DAMAGE: 12,

	DAMAGE_VARIANCE: 0.2,
	DAMAGE_NUMBER_OFFSET: 5,

	HEALTH_BAR_LENGTH: 8,
	HEALTH_BAR_OFFSET: 5,

	TEXT_TIME: 0.7,
}

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isReplayEnabled: true,
	isPlayingBgm: true,
	theme: "dark",
	isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2,
	seed: 5
};

const playerStates = {
	DEFAULT: "default",
	GUARDING: "guarding",
	SLASHING: "slashing",
	STABBING: "stabbing"
}

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/
	
/**
* @type  { Star [] }
*/
let stars;

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
 * scoreValue: number
 * pos: Vector
 * atkDamage: number
 * atkDelay: number
 * hitDelay: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemy;

/**
 * @typedef {{
 * dmg: string
 * pos: Vector
 * activeTime: number
 * color: Color
 * }} HitText
 */

/**
 * @type { HitText [] }
 */
let hitText;

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

 /**
 * @type { boolean }
 */
let slashReady = true;

/**
 * @type { number }
 */
let slashResetTime = 0;

/**
 * @typedef {{
 * pos: Vector
 * tick: number
 * }} AttackWarnings
 */

/**
 * @type { AttackWarnings [] }
 */
let attackWarningTicks;

let firstClick = false;
let slashY = G.HEIGHT / 3;
let slashX = 10;
let hitX = G.WIDTH/2;
let hitX_1 = G.WIDTH/2;
let hitY = G.HEIGHT*2/3;
let slashEffectTick = 0;
let attackBlockedTick = 20;
let hitEffectTick = 0;
let attackWarningTickLength = 0;

function update() {
	if(slashEffectTick != 0) {
		SlashingEffect();
	}
	if(hitEffectTick != 0) {
		PlayerHitEffect();
	}
	if(attackBlockedTick != 20) {
		AttackBlockedEffect();
	}
	if(attackWarningTickLength != 0) {
		AttackWarningEffect(attackWarningTicks);
	}

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
				living: true,
				scoreValue: G.ENEMY_0_SCORE_VALUE,
				pos: vec(),
				atkDamage: G.ENEMY_0_ATTACK,
				atkDelay: G.EMEMY_0_ATTACK_DELAY + (index * G.ENEMY_0_ATTACK_VARIANCE),
				hitDelay: G.EMEMY_0_HIT_DELAY
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
		attackWarningTicks = []
		stars = times(20, () => {
			const posX = rnd(0, G.WIDTH);
			const posY = rnd(0, G.HEIGHT);
			return {
				pos: vec(posX, posY),
				speed: rnd(0.5, 1.0)
			};
		});

		hitText = [];
		enemyCount = 3;
		
	}

	stars.forEach((s) => {
		s.pos.x -= s.speed;
		s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
		color("light_black");
		box(s.pos, 1);
	});
	
	if (firstClick) {
		// input and state determination
		
		if (slashResetTime > 0 && slashReady == false) {
			slashResetTime -= 1/60;
		} else {
			slashResetTime = G.SLASH_RESET;
			slashReady = true;
		}
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
				} else if (slashReady){
					slashReady = false;
					slashResetTime = G.SLASH_RESET;
					playerState = playerStates.SLASHING;
				}
			}
			pressedTime = 0;
		}
		if (input.isPressed) {
			pressedTime += 1/60; // all inputs are measured in seconds
			if (pressedTime >= G.GUARD_HOLD_LENGTH) {
				playerState = playerStates.GUARDING;
				tapAmount = 0;
				slashReady = true;
			}
		} else {
			releasedTime += 1/60;
			if (releasedTime >= G.RESET_LENGTH) {
				if (tapAmount >= G.STAB_TAP_AMOUNT) {
					playerState = playerStates.DEFAULT;
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
			GuardingEffect();
			play("lucky");
			console.log("guarding");
			break;
		case playerStates.SLASHING:
			slashEffectTick = 10;
			SlashingEffect();
			play("explosion");
			DamageAllEnemies(G.SLASH_DAMAGE);
			console.log("slash");
			playerState = playerStates.DEFAULT;
			break;
		case playerStates.STABBING:
			lastStabTime -= 1/60;
			if (lastStabTime <= 0) {
				lastStabTime = G.STAB_DELAY;
				if (livingEnemies[stabTarget] == null) {
					stabTarget = rndi(0, livingEnemies.length);
				} else {
					play("hit");
					StabbingEffect(livingEnemies[stabTarget].pos);
					DamageEnemy(stabTarget, G.STAB_DAMAGE);
					console.log("stab");
					console.log(livingEnemies);
				}
				// stabEffectTick = 2;
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
			e.atkDelay--;
			if (e.atkDelay <= 0) {
				e.hitDelay--;
				// insert enemy getting ready to attack (changed color for debugging)
				play("select");
				if (e.hitDelay == G.EMEMY_0_HIT_DELAY - 1) {
					attackWarningTicks.push({pos: e.pos, tick: e.hitDelay});
					attackWarningTickLength++;
				}
				
				AttackWarningEffect(attackWarningTicks);
				color("light_red");

				if (e.hitDelay <= 0) {
					// insert enemy attacking
					e.atkDelay = G.EMEMY_0_ATTACK_DELAY;
					e.hitDelay = G.EMEMY_0_HIT_DELAY;
					if (playerState != playerStates.GUARDING) {
						// insert player hit effect
						hitEffectTick = 15;
						play("powerUp");
						PlayerHitEffect();
						DamagePlayer(e.atkDamage);
					} else {
						// insert enemy attack blocked effect (if you want)
						play("jump");
						attackBlockedTick = 0;
						AttackBlockedEffect();
						const hb = healthBar[0];
						hitText.push({
							dmg: "BLOCKED",
							pos: vec(hb.pos.x - 18, hb.pos.y - G.DAMAGE_NUMBER_OFFSET - 3),
							activeTime: 0,
							color: "light_yellow"
						});
					}
					
				}
			} else {
				
				color("black");
			}
			const interval = G.WIDTH / (enemy.length + 1);
			const position = (e.order * interval) + interval;
			char("b", vec(position, G.HEIGHT/3));
			e.pos = vec(position, G.HEIGHT/3);
			//ReorderEnemies();
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

	color("red");
	remove(hitText, (ht) => {
		ht.activeTime += 1/60;
		ht.pos.y -= clamp(0.4 - (ht.activeTime / 3), 0, Infinity);
		text(ht.dmg, ht.pos, {color: ht.color});
		if (ht.activeTime >= G.TEXT_TIME) {
			return true;
		}
	});
}

function DamageEnemy(order, damage) {
	const e = livingEnemies[order];
	if (e != null) {
		const hb = healthBar[e.hBarIndex];
		const randDamage = round(rnd(damage - (damage * G.DAMAGE_VARIANCE / 2), damage + (damage * G.DAMAGE_VARIANCE / 2)));
		e.health -= randDamage;
		hb.health = e.health; 
		hitText.push({
			dmg: String(randDamage),
			pos: vec(hb.pos.x - 4, hb.pos.y - G.DAMAGE_NUMBER_OFFSET),
			activeTime: 0,
			color: "red"
		});
		if (e.health <= 0 && e.living == true) {
			play("coin");
			if (livingEnemies.length > 1) {
				livingEnemies.splice(order, 1);
			} else {
				livingEnemies.pop();
			}
			
			e.living = false;
			addScore(e.scoreValue, hb.pos); 
			enemyCount--;
		}
	}
}

function DamageAllEnemies(damage) {
	enemy.forEach(e => {
		DamageEnemy(e.order, damage);
	});
}

function DamagePlayer(damage) {
	const hb = healthBar[0];
	const randDamgae = round(rnd(damage - (damage * G.DAMAGE_VARIANCE / 2), damage + (damage * G.DAMAGE_VARIANCE / 2)));
	player.health -= randDamgae;
	hb.health = player.health;
	hitText.push({
		dmg: String(randDamgae),
		pos: vec(hb.pos.x - 4, hb.pos.y - G.DAMAGE_NUMBER_OFFSET),
		activeTime: 0,
		color: "red"
	});
	if (player.health <= 0) {
		end();
	}
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

function SlashingEffect() {
	slashEffectTick--;
	color("yellow");
	rect(vec(slashX - 10, slashY + 1), slashX, 1);
	color("light_cyan");
	rect(slashX - 25, slashY - 2, slashX, 1);
	slashX += 9;
	if(slashEffectTick == 0) {
		slashX = 10;
	}
}

function StabbingEffect(pos) {
	color("red");
	particle(livingEnemies[stabTarget].pos);

	color("yellow");
	rect(pos.x - 7, pos.y + 1, 13, 2);
	color("red");
	rect(pos.x - 3, pos.y - 1, 13, 2);
}

function GuardingEffect() {
	color("yellow");
	arc(player.pos, 12, 2, 0, -3.1);
	particle(player.pos, 1);
}

function AttackWarningEffect(AttackWarnings) {
	remove(AttackWarnings, (aw) => {
		color("purple");
		arc(aw.pos, 0.5 * aw.tick, 1, 0, ticks * 0.1 + PI * 2);
		aw.tick--;
		if(aw.tick == 0) {
			attackWarningTickLength--;
			return true;
		}
	});
}

function PlayerHitEffect() {
	hitEffectTick--;
	color("red");
	particle(player.pos.x, player.pos.y + 2, 4, 1, -PI/2, PI/4);
	color("red");
	rect(vec(hitX - 10, hitY - 2), 3, 2);
	hitX+=3;
	color("light_red");
	rect(vec(hitX_1 + 10, hitY + 2), 3, 2);
	hitX_1-=3;

	if(hitEffectTick == 0) {
		hitX = player.pos.x;
		hitX_1 = player.pos.x;
	}
}

function AttackBlockedEffect() {    
	attackBlockedTick++;
	color("light_yellow");
	arc(player.pos, 1.9 * attackBlockedTick, 1, 0, attackBlockedTick * 0.5 + PI * 2);
	particle(player.pos, 1, 4);
}