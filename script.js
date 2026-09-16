"use strict";

/* ============================================================
   CORE UTILITIES
   ============================================================ */

let canvas = document.querySelector("#game");
canvas.addEventListener("touchstart", (e) => e.preventDefault(), {
  passive: false,
});
let ctx = canvas.getContext("2d");
let W = 1280;
let H = 720;
let TAU = Math.PI * 2;

let clamp = (n, min, max) => Math.max(min, Math.min(max, n));
let lerp = (a, b, t) => a + (b - a) * t;
let random = (min, max) => min + Math.random() * (max - min);
let pick = (list) => list[Math.floor(Math.random() * list.length)];

const gameBackground = new Image();
gameBackground.src = "images/GameBackground.png";

const stage1Background = new Image();
stage1Background.src = "images/Stage1Background.png";


const stage2Background = new Image();
stage2Background.src = "images/Stage2Background.png";

const stage3Background = new Image();
stage3Background.src = "images/Stage3Background.png";

const stage2Boss1 = new Image();
stage2Boss1.src = "images/Stage2BossFightBackground1.png";

const stage2Boss2 = new Image();
stage2Boss2.src = "images/Stage2BossFightBackground2.png";

const stage2Boss3 = new Image();
stage2Boss3.src = "images/Stage2BossFightBackground3.png";

const stage2Boss4 = new Image();
stage2Boss4.src = "images/Stage2BossFightBackground4.png";

const stage4Background = new Image();
stage4Background.src = "images/Stage4Background.png";

const stage4Boss1 = new Image();
stage4Boss1.src = "images/Stage4BossFightBackground1.png";

const stage4Boss2 = new Image();
stage4Boss2.src = "images/Stage4BossFightBackground2.png";

const stage4Boss3 = new Image();
stage4Boss3.src = "images/Stage4BossFightBackground3.png";

const stage4Boss4 = new Image();
stage4Boss4.src = "images/Stage4BossFightBackground4.png";



let save = {
  get(key, fallback) {
    try {
      let value = localStorage.getItem("rangers_" + key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("rangers_" + key, JSON.stringify(value));
    } catch {
      // Storage is optional; gameplay continues without it.
    }
  },
};

function oval(c, x, y, rx, ry, color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU);
  c.fill();
}

function line(c, x1, y1, x2, y2, color, width = 3) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

function poly(c, points, fill, stroke = null, width = 2) {
  c.beginPath();
  points.forEach(([x, y], i) => {
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  });
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}

function text(c, value, x, y, size = 24, color = "#fff", align = "center") {
  c.font = `800 ${size}px "Segoe UI","Microsoft YaHei",sans-serif`;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillStyle = "#051020bb";
  c.fillText(value, x + 2, y + 3);
  c.fillStyle = color;
  c.fillText(value, x, y);
}

function bolt(c, x1, y1, x2, y2, color = "#b2f2ff", width = 4) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(x1, y1);
  for (let i = 1; i < 10; i++) {
    let t = i / 10;
    c.lineTo(lerp(x1, x2, t) + random(-19, 19), lerp(y1, y2, t));
  }
  c.lineTo(x2, y2);
  c.stroke();
}

/* ============================================================
   LANGUAGE AND GAME DATA
   ============================================================ */

let WORDS = {
  start: ["START GAME", "开始游戏"],
  how: ["HOW TO PLAY", "游戏说明"],
  music: ["MUSIC", "音乐"],
  sound: ["SOUND", "音效"],
  language: ["LANGUAGE / 语言", "语言 / LANGUAGE"],
  on: ["ON", "开"],
  off: ["OFF", "关"],
  back: ["BACK", "返回"],
  select: ["SELECT YOUR RANGER", "选择你的战士"],
  deploy: ["IT'S MORPHIN TIME!", "变身！出击！"],
  attack: ["Attack", "攻击"],
  speed: ["Speed", "速度"],
  defence: ["Defence", "防御"],
  special: ["SPECIAL", "必杀技"],
  health: ["HEALTH", "生命值"],
  power: ["POWER", "能量"],
  lives: ["LIVES", "生命"],
  score: ["SCORE", "分数"],
  stage: ["STAGE", "关卡"],
  boss: ["BOSS", "首领"],
  phase: ["PHASE", "阶段"],
  paused: ["PAUSED", "游戏暂停"],
  resume: ["RESUME", "继续"],
  restartStage: ["RESTART STAGE", "重新开始本关"],
  menu: ["MAIN MENU", "主菜单"],
  over: ["GAME OVER", "游戏结束"],
  continue: ["CONTINUE", "继续"],
  restart: ["RESTART", "重新开始"],
  clear: ["STAGE CLEAR", "关卡完成"],
  bonus: ["BONUS", "奖励"],
  total: ["TOTAL", "总分"],
  next: ["NEXT STAGE", "下一关"],
  victory: ["VICTORY!", "胜利！"],
  safe: ["ANGEL GROVE IS SAFE AGAIN.", "天使丛林市再次恢复和平。"],
  thanks: ["THANK YOU FOR PLAYING", "感谢游玩"],
  again: ["PLAY AGAIN", "再玩一次"],
  another: ["SELECT ANOTHER RANGER", "选择其他战士"],
  enemies: ["Enemies defeated", "击败敌人"],
  bosses: ["Bosses defeated", "击败首领"],
  highest: ["Highest combo", "最高连击"],
  ranger: ["Selected Ranger", "所选战士"],
  time: ["Completion time", "完成时间"],
  high: ["HIGH SCORE", "最高分"],
  fight: ["DEFEAT ALL ENEMIES!", "消灭所有敌人！"],
  go: ["GO!", "前进！"],
  wave: ["WAVE", "敌人波次"],
  warning: ["WARNING!", "警告！"],
  growing: ["MONSTER GROWING!", "怪兽巨大化！"],
  summon: ["ZORD POWER!", "召唤机甲！"],
  zord: ["ZORD BATTLE", "机甲战斗"],
  finish: ["FINISHER READY — D", "终结技就绪 — D"],
  mission: ["MISSION COMPLETE", "任务完成"],
  hit: ["HIT", "连击"],
  block: ["BLOCK", "格挡"],
  weak: ["WEAK POINT!", "弱点命中！"],
  need: ["60 power required", "需要60点能量"],
  heal: ["ENERGY ORB +30 HP", "能量球：生命值 +30"],
  crystal: ["POWER CRYSTAL +35", "能量水晶：能量 +35"],
  life: ["EXTRA LIFE!", "额外生命！"],
  rage: ["RAGE!", "狂暴！"],
  guard: ["GUARD", "防御"],
  mega: ["DINO MEGAZORD", "大兽神"],
  dragon: ["DRAGONZORD", "龙虎机甲"],
  tiger: ["WHITE TIGERZORD", "白虎机甲"],
  megaFinish: ["MEGAZORD POWER SWORD", "大兽神神力剑"],
  dragonFinish: ["DRAGONZORD FINISHER", "龙皇凯撒终结技"],
  tigerFinish: ["WHITE TIGER FINISHER", "白虎机甲终结技"],
  final: ["FINAL BATTLE", "最终决战"],
  arcade: ["A CANVAS ARCADE ADVENTURE", "街机格斗冒险"],
  grid: ["MORPHIN GRID", "变身能量网络"],
  menuHint: [
    "↑ / ↓: navigate · Enter / A: select",
    "↑ / ↓：切换 · 回车 / A：确认",
  ],
  selectHint: [
    "Arrows: choose · Enter: deploy · Or tap a Ranger",
    "方向键：选择 · 回车：出击 · 也可点击战士",
  ],
  musicMissing: [
    "Check your music file: audio/GameMusic05.mp3",
    "请检查音乐文件：audio/GameMusic05.mp3",
  ],
};

let RANGERS = [
  {
    name: ["RED RANGER", "红衣战士"],
    color: "#ef4356",
    dark: "#8c2038",
    weapon: ["POWER SWORD", "神力剑"],
    special: ["ENERGY SWORD SLASH", "能量剑斩"],
    type: "sword",
    //Modified for Testing
    atk: 1000,
    //Original
    //atk: 4,
    speed: 4,
    def: 4,
    range: 120,
    rate: 0.28,
  },
  {
    name: ["BLUE RANGER", "蓝衣战士"],
    color: "#398fff",
    dark: "#204d9a",
    weapon: ["POWER LANCE", "神力长枪"],
    special: ["LANCE CYCLONE", "长枪旋风"],
    type: "lance",
    atk: 3,
    speed: 4,
    def: 3,
    range: 165,
    rate: 0.27,
  },
  {
    name: ["BLACK RANGER", "黑衣战士"],
    color: "#404b61",
    dark: "#182034",
    weapon: ["POWER AXE", "神力战斧"],
    special: ["POWER AXE BLAST", "战斧冲击"],
    type: "axe",
    atk: 5,
    speed: 3,
    def: 4,
    range: 125,
    rate: 0.36,
  },
  {
    name: ["YELLOW RANGER", "黄衣战士"],
    color: "#ffd742",
    dark: "#aa741b",
    weapon: ["POWER DAGGERS", "神力双匕首"],
    special: ["DAGGER STORM", "双刃风暴"],
    type: "daggers",
    atk: 3,
    speed: 5,
    def: 3,
    range: 100,
    rate: 0.21,
  },
  {
    name: ["GREEN RANGER", "绿衣战士"],
    color: "#26c696",
    dark: "#0d6851",
    weapon: ["DRAGON DAGGER", "龙匕首"],
    special: ["DRAGON ENERGY WAVE", "龙之能量波"],
    type: "dragon",
    atk: 4,
    speed: 5,
    def: 3,
    range: 110,
    rate: 0.24,
  },
  {
    name: ["WHITE RANGER", "白衣战士"],
    color: "#edf3ff",
    dark: "#8c9ab5",
    weapon: ["SABA", "萨巴神剑"],
    special: ["WHITE TIGER STRIKE", "白虎斩"],
    type: "saba",
    atk: 5,
    speed: 4,
    def: 4,
    range: 138,
    rate: 0.3,
  },
];

let ENEMIES = {
  putty: {
    name: ["PUTTY PATROLLER", "泥人战士"],
    hp: 65,
    speed: 110,
    damage: 9,
    range: 78,
    scale: 1,
    color: "#929fae",
    score: 100,
  },
  elite: {
    name: ["ELITE PUTTY", "精英泥人"],
    hp: 105,
    speed: 133,
    damage: 12,
    range: 85,
    scale: 1.08,
    color: "#6d809d",
    score: 250,
  },
  zputty: {
    name: ["Z-PUTTY", "Z型泥人"],
    hp: 130,
    speed: 143,
    damage: 13,
    range: 87,
    scale: 1.06,
    color: "#a4a8b8",
    score: 250,
  },
  tenga: {
    name: ["TENGA WARRIOR", "天狗战士"],
    hp: 90,
    speed: 170,
    damage: 12,
    range: 100,
    scale: 1.08,
    color: "#71538e",
    score: 250,
  },
  shield: {
    name: ["SHIELD GUARD", "盾牌守卫"],
    hp: 125,
    speed: 90,
    damage: 15,
    range: 93,
    scale: 1.14,
    color: "#558298",
    score: 250,
  },
  gunner: {
    name: ["ENERGY GUNNER", "能量射手"],
    hp: 75,
    speed: 103,
    damage: 11,
    range: 440,
    scale: 1,
    color: "#aa6798",
    score: 250,
  },
  brute: {
    name: ["HEAVY BRUTE", "重装怪人"],
    hp: 180,
    speed: 74,
    damage: 21,
    range: 120,
    scale: 1.43,
    color: "#91816d",
    score: 400,
  },
  ninja: {
    name: ["SHADOW NINJA", "暗影忍者"],
    hp: 85,
    speed: 185,
    damage: 12,
    range: 93,
    scale: 0.98,
    color: "#39354f",
    score: 250,
  },
  guard: {
    name: ["ELITE GUARD", "精英守卫"],
    hp: 150,
    speed: 123,
    damage: 16,
    range: 115,
    scale: 1.17,
    color: "#9d89c8",
    score: 400,
  },
};

let BOSSES = {
  commander: {
    name: ["HEAVY PUTTY COMMANDER", "泥人队长"],
    hp: 330,
    speed: 91,
    damage: 18,
    range: 145,
    scale: 1.62,
    color: "#768d9b",
    patterns: ["combo", "slam", "charge"],
  },
  shieldCommander: {
    name: ["SHIELD COMMANDER", "盾甲队长"],
    hp: 390,
    speed: 97,
    damage: 20,
    range: 155,
    scale: 1.67,
    color: "#548b9b",
    patterns: ["combo", "charge", "wave"],
  },
  minotaur: {
    name: ["MINOTAUR", "牛头怪"],
    hp: 620,
    speed: 109,
    damage: 23,
    range: 172,
    scale: 1.86,
    color: "#b18a65",
    patterns: ["combo", "charge", "slam"],
  },
  sphinx: {
    name: ["KING SPHINX", "狮身怪王"],
    hp: 730,
    speed: 114,
    damage: 21,
    range: 170,
    scale: 1.82,
    color: "#dbb969",
    patterns: ["combo", "energy", "wind", "dive"],
  },
  scorpina: {
    name: ["SCORPINA", "蝎子女战士"],
    hp: 720,
    speed: 160,
    damage: 20,
    range: 156,
    scale: 1.4,
    color: "#d4a84c",
    patterns: ["combo", "spin", "energy", "dive"],
  },
  rito: {
    name: ["RITO REVOLTO", "里托"],
    hp: 480,
    speed: 107,
    damage: 22,
    range: 165,
    scale: 1.74,
    color: "#c7c8ac",
    patterns: ["combo", "slam", "energy"],
  },
  goldar: {
    name: ["GOLDAR", "戈达"],
    hp: 900,
    speed: 126,
    damage: 24,
    range: 180,
    scale: 1.87,
    color: "#dca73a",
    patterns: ["combo", "charge", "energy", "dive"],
  },
  zedd: {
    name: ["LORD ZEDD", "泽德大帝"],
    hp: 1210,
    speed: 137,
    damage: 25,
    range: 170,
    scale: 1.67,
    color: "#ca4968",
    patterns: ["combo", "beam", "teleport", "lightning", "wave"],
  },
  titan: {
    name: ["ZEDD'S DOOM TITAN", "泽德毁灭巨兽"],
    hp: 1700,
    speed: 125,
    damage: 26,
    range: 315,
    scale: 3.55,
    color: "#a93155",
    patterns: ["beam", "wave", "missiles", "lightning", "charge", "slam"],
  },
};

let STAGES = [
  {
    name: ["ANGEL GROVE ATTACK", "天使丛林市遭袭"],
    theme: "city",
    mini: "commander",
    bosses: ["minotaur"],
    waves: [["putty"], ["putty", "elite"], ["putty", "elite"]],
    giant: false,
  },
  {
    name: ["INDUSTRIAL DISTRICT", "工业区危机"],
    theme: "factory",
    mini: "shieldCommander",
    bosses: ["sphinx"],
    waves: [
      ["putty", "gunner"],
      ["zputty", "putty"],
      ["shield", "gunner", "zputty"],
    ],
    giant: true,
  },
  {
    name: ["ANGEL GROVE PARK", "天使丛林公园"],
    theme: "park",
    mini: null,
    bosses: ["scorpina"],
    waves: [
      ["putty", "elite"],
      ["ninja", "elite"],
      ["ninja", "putty", "elite"],
    ],
    giant: false,
  },
  {
    name: ["ZEDD'S INVASION", "泽德的入侵"],
    theme: "ruins",
    mini: "rito",
    bosses: ["goldar"],
    waves: [
      ["zputty", "brute"],
      ["gunner", "tenga"],
      ["brute", "zputty", "tenga"],
    ],
    giant: true,
  },
  {
    name: ["MOON PALACE", "月球宫殿"],
    theme: "moon",
    mini: "rito",
    bosses: ["goldar", "scorpina"],
    waves: [
      ["tenga", "ninja"],
      ["guard", "zputty"],
      ["guard", "tenga", "ninja"],
    ],
    giant: false,
  },
  {
    name: ["FINAL BATTLE", "最终决战"],
    theme: "fortress",
    mini: "goldar",
    bosses: ["zedd"],
    waves: [
      ["guard", "brute"],
      ["gunner", "ninja", "tenga"],
      ["guard", "zputty", "brute"],
    ],
    giant: true,
  },
];

/* ============================================================
   AUDIO
   ============================================================ */

class AudioManager {
  constructor() {
    this.musicOn = save.get("music", true);
    this.soundOn = save.get("sound", true);
    this.music = new Audio("audio/GameMusic05.mp3");
    this.music.loop = true;
    this.music.volume = 0.42;
    this.music.preload = "none";
    this.context = null;
    this.missing = false;
    this.music.addEventListener("error", () => (this.missing = true));
  }

  unlock() {
    if (!this.context) {
      try {
        let AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.context = new AudioClass();
      } catch {
        this.context = null;
      }
    }

    if (this.context?.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    if (this.musicOn && this.music.paused && !this.missing) {
      this.music.play().catch(() => {});
    }
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    save.set("music", this.musicOn);
    if (this.musicOn) this.unlock();
    else this.music.pause();
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    save.set("sound", this.soundOn);
  }

  play(kind) {
    if (!this.soundOn || !this.context || this.context.state !== "running")
      return;

    let presets = {
      menu: [620, 920, 0.07, "sine", 0.05],
      punch: [170, 65, 0.08, "triangle", 0.1],
      kick: [120, 35, 0.13, "triangle", 0.12],
      hit: [220, 55, 0.1, "sawtooth", 0.065],
      heavy: [125, 25, 0.2, "sawtooth", 0.1],
      special: [210, 1050, 0.48, "sawtooth", 0.065],
      explosion: [90, 16, 0.48, "sawtooth", 0.12],
      transform: [90, 1350, 1.1, "sawtooth", 0.06],
      pickup: [510, 1220, 0.19, "sine", 0.075],
      guard: [440, 140, 0.1, "square", 0.045],
    };

    let [from, to, duration, type, volume] = presets[kind] || presets.hit;
    let now = this.context.currentTime;
    let oscillator = this.context.createOscillator();
    let gain = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

/* ============================================================
   INPUT
   ============================================================ */

class InputManager {
  constructor(game) {
    this.game = game;
    this.sources = new Map();
    this.pressed = new Set();
    this.taps = {};
    this.pointers = new Map();

    this.keys = {
      ArrowUp: "up",

      ArrowDown: "down",

      ArrowLeft: "left",

      ArrowRight: "right",
      KeyA: "attack",
      KeyS: "heavy",
      Space: "jump",
      KeyD: "special",
      KeyW: "dash",
    };

    window.addEventListener(
      "keydown",
      (event) => {
        let action = this.keys[event.code];
        let relevant =
          action || ["Enter", "Escape", "KeyP"].includes(event.code);
        if (!relevant) return;

        event.preventDefault();
        game.audio.unlock();
        if (event.repeat) return;

        if (event.code === "Escape" || event.code === "KeyP") {
          game.pauseOrBack();
        } else if (game.isMenu()) {
          game.menuKey(event.code);
        } else if (action && game.state === "play") {
          this.set(action, event.code, true);
        }
      },
      { passive: false },
    );

    window.addEventListener("keyup", (event) => {
      let action = this.keys[event.code];
      if (action) this.set(action, event.code, false);
    });

    let suspend = () => {
      this.clear();
      if (game.active()) game.pause();
    };

    window.addEventListener("blur", suspend);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) suspend();
    });

    document.addEventListener("pointerdown", () => game.audio.unlock());

    document.querySelectorAll("[data-key]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (game.state !== "play") return;

        let action = button.dataset.key;
        let source = "touch_" + event.pointerId;
        this.pointers.set(event.pointerId, { action, source, button });
        button.setPointerCapture(event.pointerId);
        button.classList.add("pressed");
        this.set(action, source, true);
      });

      let release = (event) => {
        let record = this.pointers.get(event.pointerId);
        if (!record) return;
        this.set(record.action, record.source, false);
        this.pointers.delete(event.pointerId);

        if (
          ![...this.pointers.values()].some((p) => p.button === record.button)
        ) {
          record.button.classList.remove("pressed");
        }
      };

      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
      button.addEventListener("contextmenu", (event) => event.preventDefault());
      button.addEventListener("touchstart", (event) => event.preventDefault(), {
        passive: false,
      });
    });
  }

  set(action, source, down) {
    if (!down) {
      this.sources.delete(source);
      return;
    }

    let alreadyHeld = this.held(action);
    this.sources.set(source, action);

    if (!alreadyHeld) {
      this.pressed.add(action);

      if (["up", "down", "left", "right"].includes(action)) {
        let now = performance.now();
        if (now - (this.taps[action] || -1000) < 245) this.pressed.add("dash");
        this.taps[action] = now;
      }
    }
  }

  held(action) {
    for (let value of this.sources.values()) {
      if (value === action) return true;
    }
    return false;
  }

  take(action) {
    let found = this.pressed.has(action);
    this.pressed.delete(action);
    return found;
  }

  axes() {
    let x = Number(this.held("right")) - Number(this.held("left"));
    let y = Number(this.held("down")) - Number(this.held("up"));
    let length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { x, y };
  }

  clear() {
    this.sources.clear();
    this.pressed.clear();
    this.pointers.clear();
    this.taps = {};
    document
      .querySelectorAll(".pressed")
      .forEach((el) => el.classList.remove("pressed"));
  }
}

/* ============================================================
   PROCEDURAL CHARACTERS
   ============================================================ */

function drawWeapon(c, type, angle, giant = false) {
  c.save();
  c.translate(26, -80);
  c.rotate(angle);
  line(c, 0, 0, 24, 0, "#f0f6ff", 11);
  line(c, 23, 0, 38, 0, "#d4ac57", 7);

  if (type === "lance") {
    line(c, -35, 0, 113, 0, "#bed2e8", 5);
    poly(
      c,
      [
        [113, -9],
        [143, 0],
        [113, 9],
      ],
      "#e6fbff",
      "#68a0c4",
    );
    poly(
      c,
      [
        [-35, -7],
        [-56, 0],
        [-35, 7],
      ],
      "#e6fbff",
    );
  } else if (type === "axe") {
    line(c, 35, 0, 86, 0, "#8c9fb9", 7);
    poly(
      c,
      [
        [65, -6],
        [62, -32],
        [95, -35],
        [109, -18],
        [93, -10],
        [93, 10],
        [109, 18],
        [95, 35],
        [62, 32],
        [65, 6],
      ],
      "#d0efff",
      "#658ba7",
    );
    c.fillStyle = "#26374b";
    c.fillRect(58, -5, 38, 10);
  } else if (type === "daggers" || type === "dragon") {
    line(c, 38, -11, 38, 11, "#ffdb78", 5);
    poly(
      c,
      [
        [41, -5],
        [81, 0],
        [41, 5],
      ],
      "#e3faff",
      "#7ca6be",
    );
    if (type === "dragon") oval(c, 31, 0, 5, 5, "#7effb5");
  } else {
    line(c, 38, -14, 38, 14, "#ffe193", 5);
    let end = giant ? 151 : 110;
    poly(
      c,
      [
        [43, -6],
        [end - 15, -4],
        [end, 0],
        [end - 15, 4],
        [43, 6],
      ],
      "#e5faff",
      "#729fc0",
    );
    if (type === "saba") {
      oval(c, 37, -3, 9, 8, "#fff6db");
      oval(c, 40, -5, 2, 2, "#52eaff");
    }
  }

  c.restore();
}

function drawFighter(c, actor, time) {
  let ranger = Number.isInteger(actor.ranger);
  let config = ranger ? RANGERS[actor.ranger] : actor.config;
  let kind = actor.kind || "";
  let size = actor.scale || 1;
  let walk = actor.moving ? Math.sin(time * 13) * 13 : Math.sin(time * 3) * 1.2;
  let attack = actor.attack;
  let fraction = attack ? clamp(attack.elapsed / attack.duration, 0, 1) : 0;
  let angle = attack ? -1.45 + fraction * 2.65 : -0.52;
  let color = actor.flash > 0 ? "#ffffff" : config.color;
  let dark = config.dark || "#34354b";

  oval(c, actor.x, actor.y + 3, 33 * size, 10 * size, "#02071455");
  c.save();
  c.translate(actor.x, actor.y - (actor.z || 0));
  c.scale(size * (actor.dir || 1), size);

  if (actor.dead) {
    let progress = clamp(1 - actor.deathTimer / actor.deathDuration, 0, 1);
    c.rotate(-progress * 1.55);
    c.globalAlpha = 1 - progress;
  } else if (actor.stun > 0) {
    c.rotate(actor.state === "knockedDown" ? -0.52 : -0.13);
  } else if (attack?.heavy) {
    c.rotate(Math.sin(fraction * Math.PI) * 0.13);
  }

  if (actor.inv > 0 && Math.floor(time * 17) % 2 === 0) c.globalAlpha *= 0.48;

  if (actor.state === "special") {
    oval(c, 0, -74, 53 + Math.sin(time * 30) * 7, 85, config.color + "35");
  }

  if (["goldar", "sphinx", "tenga"].includes(kind)) {
    let flap = Math.sin(time * 5) * 10;
    poly(
      c,
      [
        [-15, -92],
        [-65, -147 - flap],
        [-91, -60],
        [-58, -78],
        [-44, -35],
        [-17, -64],
      ],
      dark,
      color,
    );
    poly(
      c,
      [
        [15, -92],
        [65, -142 + flap],
        [91, -60],
        [58, -78],
        [44, -35],
        [17, -64],
      ],
      dark,
      color,
    );
  }

  if (kind === "scorpina") {
    c.strokeStyle = "#e1b155";
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(-18, -55);
    c.bezierCurveTo(-91, -30, -85, -159, -39, -145);
    c.stroke();
    poly(
      c,
      [
        [-44, -154],
        [-24, -147],
        [-44, -135],
      ],
      "#ffe098",
    );
  }

  if (kind === "titan") {
    for (let i = 0; i < 3; i++) {
      poly(
        c,
        [
          [-23, -98 + i * 15],
          [-52, -115 + i * 17],
          [-35, -84 + i * 15],
        ],
        "#bcc6da",
        "#61485c",
      );
      poly(
        c,
        [
          [23, -98 + i * 15],
          [52, -115 + i * 17],
          [35, -84 + i * 15],
        ],
        "#bcc6da",
        "#61485c",
      );
    }
  }

  line(c, -11, -49, -15 - walk * 0.5, -25, dark, 17);
  line(
    c,
    -15 - walk * 0.5,
    -25,
    -18 - walk,
    -7,
    ranger ? "#eff5ff" : color,
    15,
  );
  line(c, 12, -49, 17 + walk * 0.5, -25, color, 18);
  line(c, 17 + walk * 0.5, -25, 21 + walk, -7, ranger ? "#fff" : color, 15);
  line(c, -24 - walk, -3, -8 - walk, -3, ranger ? "#f4f7ff" : dark, 10);
  line(c, 15 + walk, -3, 31 + walk, -3, ranger ? "#fff" : dark, 10);

  poly(
    c,
    [
      [-24, -101],
      [23, -101],
      [28, -76],
      [16, -47],
      [-16, -47],
      [-27, -77],
    ],
    color,
    "#172338",
  );
  poly(
    c,
    [
      [-23, -96],
      [-10, -87],
      [-11, -52],
      [-18, -51],
    ],
    dark,
  );

  if (ranger) {
    poly(
      c,
      [
        [-21, -85],
        [-10, -97],
        [0, -85],
        [11, -97],
        [23, -85],
        [11, -72],
        [0, -84],
        [-10, -72],
      ],
      "#f8faff",
    );

    if (actor.ranger >= 4) {
      poly(
        c,
        [
          [-29, -98],
          [-16, -109],
          [0, -101],
          [16, -109],
          [30, -96],
          [18, -83],
          [0, -90],
          [-18, -83],
        ],
        "#dfb655",
        "#fff0a3",
      );
    }
  } else {
    poly(
      c,
      [
        [-20, -97],
        [0, -108],
        [21, -96],
        [15, -72],
        [-15, -72],
      ],
      dark,
    );

    if (kind === "zputty") {
      oval(c, 0, -82, 14, 14, "#e1e5ed");
      text(c, "Z", 0, -82, 19, actor.open > 0 ? "#ff416c" : "#27354b");
    }

    if (kind === "rito" || kind === "zedd") {
      for (let i = 0; i < 4; i++) {
        line(
          c,
          -17,
          -94 + i * 9,
          17,
          -88 + i * 9,
          kind === "zedd" ? "#e0d7e9" : "#424638",
          3,
        );
      }
    }

    if (kind === "titan") {
      oval(c, 0, -82, 13, 17, "#ff477c");
      oval(c, 0, -82, 6, 10, "#ffd3f2");
    }
  }

  line(c, -19, -49, 19, -49, ranger ? "#f3f6ff" : "#2c3044", 8);
  oval(c, 0, -49, 6, 6, "#f5d276");

  line(c, -24, -92, -35, -68 - walk * 0.25, color, 14);
  line(
    c,
    -35,
    -68 - walk * 0.25,
    -28,
    -52 - walk * 0.25,
    ranger ? "#eef6ff" : color,
    12,
  );

  if (ranger && config.type === "daggers") {
    line(c, -28, -53, -59, -49, "#e0faff", 5);
    line(c, -34, -60, -32, -45, "#ffe28d", 4);
  }

  let handX = 30 + Math.cos(angle) * 24;
  let handY = -80 + Math.sin(angle) * 24;
  line(c, 23, -93, 31, -80, color, 15);
  line(c, 31, -80, handX, handY, ranger ? "#fff" : color, 13);

  if (ranger) {
    drawWeapon(c, config.type, angle);
  } else if (["goldar", "scorpina", "rito", "guard", "ninja"].includes(kind)) {
    drawWeapon(c, "sword", angle);
  } else if (["zedd", "sphinx"].includes(kind)) {
    c.save();
    c.translate(handX, handY);
    c.rotate(attack ? angle * 0.5 : 0.08);
    line(c, 0, 37, 0, -86, "#d8e1f1", 5);

    if (kind === "zedd") {
      line(c, -12, -91, 13, -91, "#ff779e", 5);
      line(c, 13, -91, -12, -68, "#ff779e", 5);
      line(c, -12, -68, 13, -68, "#ff779e", 5);
    } else {
      oval(c, 0, -87, 11, 14, "#6feeff");
    }
    c.restore();
  } else if (kind === "gunner") {
    c.fillStyle = "#29364b";
    c.fillRect(handX - 8, handY - 10, 44, 18);
    c.fillStyle = "#f480e7";
    c.fillRect(handX + 27, handY - 5, 12, 8);
  }

  if (kind === "shield" || kind === "shieldCommander") {
    poly(
      c,
      [
        [28, -104],
        [58, -94],
        [57, -51],
        [43, -33],
        [27, -50],
      ],
      "#597f99",
      "#c4efff",
      3,
    );
    line(c, 43, -91, 43, -48, "#d0f5ff", 3);
  }

  let bob = Math.sin(time * 3) * 1.3;
  oval(c, 0, -118 + bob, 23, 25, color);

  if (ranger) {
    poly(
      c,
      [
        [-19, -125 + bob],
        [-8, -129 + bob],
        [0, -125 + bob],
        [9, -130 + bob],
        [21, -124 + bob],
        [16, -114 + bob],
        [-15, -114 + bob],
      ],
      "#081326",
      "#b4cedf",
    );
    line(c, -10, -106 + bob, 11, -106 + bob, "#f0f4ff", 4);
    line(c, -13, -133 + bob, 0, -138 + bob, "#ffffffaa", 3);
  } else {
    oval(c, -8, -121, 4, 3, "#ff7976");
    oval(c, 9, -121, 4, 3, "#ff7976");
    line(c, -8, -106, 10, -106, "#252033", 3);

    if (["minotaur", "goldar", "titan"].includes(kind)) {
      poly(
        c,
        [
          [-17, -134],
          [-35, -158],
          [-27, -124],
        ],
        "#efddb2",
      );
      poly(
        c,
        [
          [17, -134],
          [34, -157],
          [28, -124],
        ],
        "#efddb2",
      );
    }

    if (kind === "sphinx") {
      poly(
        c,
        [
          [-24, -140],
          [23, -140],
          [31, -101],
          [19, -106],
          [13, -130],
          [-14, -130],
          [-21, -101],
          [-32, -103],
        ],
        "#dcb84d",
        "#786039",
      );
      for (let i = 0; i < 4; i++) {
        line(c, -28, -128 + i * 7, -22, -127 + i * 7, "#4d9dad", 3);
        line(c, 23, -128 + i * 7, 28, -127 + i * 7, "#4d9dad", 3);
      }
    }

    if (kind === "tenga") {
      poly(
        c,
        [
          [14, -121],
          [37, -114],
          [15, -108],
        ],
        "#dbb55f",
      );
      line(c, -10, -141, -15, -155, "#35234d", 7);
    }

    if (kind === "ninja") {
      line(c, -19, -123, 20, -123, "#b94368", 6);
      line(c, -20, -120, -45, -112 + Math.sin(time * 9) * 8, "#b94368", 5);
    }

    if (kind === "zedd") {
      line(c, -20, -125, 21, -125, "#ded8e8", 5);
      line(c, -20, -111, 20, -111, "#ded8e8", 4);
      line(c, 0, -138, 0, -104, "#ded8e8", 4);
    }
  }

  c.restore();
}

function drawZord(c, actor, time) {
  let green = actor.ranger === 4;
  let white = actor.ranger === 5;
  let color = actor.flash > 0 ? "#fff" : RANGERS[actor.ranger].color;
  let size = actor.scale || 3;
  let walk = actor.moving ? Math.sin(time * 7) * 7 : 0;
  let a = actor.attack;
  let angle = a ? -1.35 + (a.elapsed / a.duration) * 2.4 : -0.7;

  oval(c, actor.x, actor.y + 8, 115, 20, "#01061588");
  c.save();
  c.translate(actor.x, actor.y - (actor.z || 0));
  c.scale(size * actor.dir, size);

  if (actor.dead) {
    let f = clamp(1 - actor.deathTimer / actor.deathDuration, 0, 1);
    c.rotate(-f * 1.4);
    c.globalAlpha = 1 - f;
  }

  if (actor.inv > 0 && Math.floor(time * 16) % 2 === 0) c.globalAlpha *= 0.5;

  if (green) {
    poly(
      c,
      [
        [-24, -62],
        [-63, -34],
        [-87, -37],
        [-65, -20],
        [-17, -38],
      ],
      "#2f846d",
      "#a2d6c6",
    );
    for (let i = 0; i < 5; i++) {
      poly(
        c,
        [
          [-25 - i * 10, -53 + i * 5],
          [-33 - i * 10, -69 + i * 5],
          [-36 - i * 10, -44 + i * 5],
        ],
        "#cfd8e9",
      );
    }
  }

  poly(
    c,
    [
      [-25, -55],
      [-5, -55],
      [-7, -8 - walk],
      [-34, -8 - walk],
    ],
    green ? "#559e8f" : "#507aad",
    "#d3e6f5",
  );
  poly(
    c,
    [
      [5, -55],
      [26, -55],
      [34, -8 + walk],
      [8, -8 + walk],
    ],
    white ? "#e4eaf4" : "#c6bd53",
    "#e5e8b9",
  );

  c.fillStyle = "#cfdceb";
  c.fillRect(-38, -12 - walk, 33, 13);
  c.fillRect(8, -12 + walk, 35, 13);

  poly(
    c,
    [
      [-33, -111],
      [32, -111],
      [38, -75],
      [20, -49],
      [-21, -49],
      [-38, -76],
    ],
    color,
    "#bfd9ec",
    3,
  );
  poly(
    c,
    [
      [-29, -101],
      [0, -76],
      [30, -101],
      [23, -72],
      [0, -59],
      [-23, -72],
    ],
    green || white ? "#dfc16c" : "#e9f0fa",
    "#5c7291",
  );

  oval(c, 0, -83, 11, 11, green ? "#ff789a" : "#67efff");
  oval(c, 0, -83, 5, 5, "#fff");

  poly(
    c,
    [
      [-44, -111],
      [-25, -113],
      [-23, -92],
      [-47, -86],
    ],
    "#cbd7e5",
    "#5b7d9b",
  );
  poly(
    c,
    [
      [25, -113],
      [45, -109],
      [48, -87],
      [24, -92],
    ],
    "#cbd7e5",
    "#5b7d9b",
  );

  line(c, -38, -94, -45, -65, color, 18);
  line(
    c,
    -45,
    -65,
    actor.guarding ? -6 : -38,
    actor.guarding ? -96 : -47,
    "#bfcede",
    17,
  );
  line(c, 36, -94, 45, -75, color, 18);
  line(c, 45, -75, 53, -59, "#bfcede", 17);

  poly(
    c,
    [
      [-21, -137],
      [21, -137],
      [23, -114],
      [12, -104],
      [-13, -104],
      [-24, -117],
    ],
    white ? "#f3f7ff" : "#749697",
    "#e4edf7",
  );
  poly(
    c,
    [
      [-18, -130],
      [18, -130],
      [13, -120],
      [-13, -120],
    ],
    "#09172b",
  );
  line(c, -13, -125, -3, -124, "#80ffff", 3);
  line(c, 3, -124, 13, -125, "#80ffff", 3);

  poly(
    c,
    [
      [-24, -132],
      [-32, -151],
      [-15, -139],
    ],
    "#eed98b",
  );
  poly(
    c,
    [
      [24, -132],
      [32, -151],
      [15, -139],
    ],
    "#eed98b",
  );
  poly(
    c,
    [
      [-6, -137],
      [0, -153],
      [6, -137],
    ],
    color,
  );

  if (white) {
    for (let i = 0; i < 3; i++) {
      line(c, -21, -102 + i * 8, -10, -96 + i * 8, "#28374b", 3);
      line(c, 21, -102 + i * 8, 10, -96 + i * 8, "#28374b", 3);
    }
  }

  if (green) {
    c.save();
    c.translate(32, -80);
    c.rotate(angle);
    poly(
      c,
      [
        [0, -10],
        [27, -14],
        [73, 0],
        [27, 14],
        [0, 10],
      ],
      "#d6e2ee",
      "#7198ac",
    );
    for (let i = 0; i < 5; i++) {
      line(c, 19 + i * 8, -9 + i, 26 + i * 8, 9 - i, "#6d8da2", 2);
    }
    c.restore();
  } else {
    drawWeapon(c, white ? "saba" : "sword", angle, true);
  }

  if (actor.guarding) {
    c.strokeStyle = "#8cefff";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(8, -80, 67, -1.2, 1.2);
    c.stroke();
  }

  c.restore();
}

/* ============================================================
   PARTICLES, PROJECTILES, HAZARDS, ITEMS
   ============================================================ */

class Particle {
  constructor(x, y, color, strength = 1, dust = false) {
    Object.assign(this, {
      x,
      y,
      color,
      dust,
      vx: random(-210, 210) * strength,
      vy: random(-230, 60) * strength,
      life: random(0.24, 0.72),
      size: random(2, 6) * strength,
    });
    this.maxLife = this.life;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 350 * dt;
  }

  draw(c) {
    c.globalAlpha = clamp(this.life / this.maxLife, 0, 1);
    if (this.dust)
      oval(c, this.x, this.y, this.size * 2, this.size, this.color);
    else
      line(
        c,
        this.x,
        this.y,
        this.x - this.vx * 0.025,
        this.y - this.vy * 0.025,
        this.color,
        this.size,
      );
    c.globalAlpha = 1;
  }
}

class Projectile {
  constructor(game, options) {
    Object.assign(
      this,
      {
        game,
        x: 0,
        y: 530,
        vx: 400,
        vy: 0,
        team: "enemy",
        damage: 10,
        radius: 12,
        life: 3,
        color: "#ff7aa9",
        kind: "orb",
        height: 70,
        piercing: false,
        dead: false,
      },
      options,
    );
    this.hits = new Set();
  }

  update(dt) {
    this.life -= dt;
    let previousX = this.x;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    let targets =
      this.team === "player" ? this.game.enemies : [this.game.player];

    for (let target of targets) {
      if (target.dead || this.hits.has(target)) continue;

      let radius = this.radius + (target.giant ? 65 : target.scale * 19);
      let left = Math.min(previousX, this.x) - radius;
      let right = Math.max(previousX, this.x) + radius;
      let depth = target.giant ? 110 : 38;

      if (
        target.x >= left &&
        target.x <= right &&
        Math.abs(this.y - target.y) < depth &&
        (target.z < 70 || this.kind === "beam")
      ) {
        target.hurt(
          this.damage,
          Math.sign(this.vx) || 1,
          this.team === "player" ? { heavy: true, special: true } : true,
        );
        this.hits.add(target);
        this.game.burst(this.x, this.y - this.height, this.color, 8);
        if (!this.piercing) {
          this.dead = true;
          break;
        }
      }
    }

    if (this.team === "player" && !this.game.giant) {
      for (let object of this.game.objects) {
        if (
          !object.dead &&
          !this.hits.has(object) &&
          Math.abs(this.x - object.x) < this.radius + 40 &&
          Math.abs(this.y - object.y) < 45
        ) {
          object.hurt(this.damage);
          this.hits.add(object);
        }
      }
    }
  }

  draw(c) {
    let y = this.y - this.height;
    c.save();
    c.shadowColor = this.color;
    c.shadowBlur = 18;

    if (this.kind === "beam") {
      line(
        c,
        this.x - Math.sign(this.vx) * 140,
        y,
        this.x,
        y,
        this.color,
        this.radius * 1.7,
      );
      line(
        c,
        this.x - Math.sign(this.vx) * 140,
        y,
        this.x,
        y,
        "#fff",
        this.radius * 0.5,
      );
    } else if (this.kind === "slash") {
      c.strokeStyle = this.color;
      c.lineWidth = 12;
      c.beginPath();
      c.ellipse(this.x, y, 23, this.radius * 2.4, -0.3, -1.3, 1.3);
      c.stroke();
    } else {
      oval(c, this.x, y, this.radius * 1.5, this.radius, this.color);
      oval(
        c,
        this.x + Math.sign(this.vx) * 3,
        y,
        this.radius * 0.55,
        this.radius * 0.55,
        "#fff",
      );
    }

    c.restore();
  }
}

class Hazard {
  constructor(game, x, y, radius, damage, delay, kind = "slam") {
    Object.assign(this, {
      game,
      x,
      y,
      radius,
      damage,
      delay,
      kind,
      elapsed: 0,
      life: delay + 0.5,
      triggered: false,
    });
  }

  update(dt) {
    this.elapsed += dt;
    this.life -= dt;

    if (!this.triggered && this.elapsed >= this.delay) {
      this.triggered = true;
      let g = this.game;
      let p = g.player;
      g.shake = Math.max(g.shake, this.kind === "lightning" ? 12 : 8);
      g.audio.play("heavy");
      g.burst(
        this.x,
        this.y - 12,
        this.kind === "lightning" ? "#b5efff" : "#ffbd7b",
        18,
        1.5,
      );

      if (
        !p.dead &&
        Math.abs(p.x - this.x) < this.radius &&
        Math.abs(p.y - this.y) < (g.giant ? 120 : this.radius * 0.47) &&
        (p.z < 45 || this.kind === "lightning")
      ) {
        p.hurt(this.damage, Math.sign(p.x - this.x) || 1, true);
      }

      if (g.giant) g.damageBuilding(this.x);
    }
  }

  draw(c) {
    if (!this.triggered) {
      let f = clamp(this.elapsed / this.delay, 0, 1);
      oval(c, this.x, this.y, this.radius, this.radius * 0.32, "#ff41682c");
      c.strokeStyle = "#ff7d92";
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(
        this.x,
        this.y,
        this.radius * f,
        this.radius * 0.32 * f,
        0,
        0,
        TAU,
      );
      c.stroke();
      text(c, "!", this.x, this.y - 10, 29, "#ffbbc5");
    } else {
      c.save();
      c.globalAlpha = clamp(this.life / 0.5, 0, 1);

      if (this.kind === "lightning") {
        bolt(c, this.x - 25, -40, this.x, this.y, "#a7eaff", 9);
        bolt(c, this.x - 25, -40, this.x, this.y, "#fff", 3);
      } else {
        let expansion = 1 + (1 - this.life / 0.5) * 0.6;
        c.strokeStyle = "#ffce88";
        c.lineWidth = Math.max(1, (12 * this.life) / 0.5);
        c.beginPath();
        c.ellipse(
          this.x,
          this.y,
          this.radius * expansion,
          this.radius * 0.34 * expansion,
          0,
          0,
          TAU,
        );
        c.stroke();
      }
      c.restore();
    }
  }
}

class Item {
  constructor(game, x, y, kind) {
    Object.assign(this, { game, x, y, kind, life: 20, dead: false });
  }

  update(dt) {
    this.life -= dt;
    let p = this.game.player;

    if (!p.dead && Math.hypot(p.x - this.x, p.y - this.y) < 47) {
      if (this.kind === "health") p.hp = Math.min(p.maxHp, p.hp + 30);
      if (this.kind === "power") p.power = Math.min(100, p.power + 35);
      if (this.kind === "life") this.game.lives++;

      this.game.audio.play("pickup");
      this.game.toast(
        this.game.t(
          this.kind === "health"
            ? "heal"
            : this.kind === "power"
              ? "crystal"
              : "life",
        ),
      );
      this.dead = true;
    }

    if (this.life <= 0) this.dead = true;
  }

  draw(c) {
    if (this.life < 3 && Math.floor(this.life * 8) % 2) return;
    let y = this.y - 22 + Math.sin(this.game.clock * 5) * 6;
    let color =
      this.kind === "health"
        ? "#7affca"
        : this.kind === "power"
          ? "#87ccff"
          : "#ffe184";

    oval(c, this.x, this.y + 2, 19, 6, "#01081766");
    c.save();
    c.shadowColor = color;
    c.shadowBlur = 20;

    if (this.kind === "power") {
      poly(
        c,
        [
          [this.x, y - 20],
          [this.x + 13, y],
          [this.x, y + 16],
          [this.x - 13, y],
        ],
        color,
        "#fff",
      );
    } else {
      oval(c, this.x, y, 14, 14, color);
      text(c, this.kind === "health" ? "+" : "1", this.x, y, 20, "#16404c");
    }
    c.restore();
  }
}

class Breakable {
  constructor(game, x, y, kind) {
    Object.assign(this, { game, x, y, kind, hp: 38, dead: false });
  }

  hurt(damage) {
    if (this.dead) return;
    this.hp -= damage;
    this.game.burst(this.x, this.y - 30, "#d9b384", 7);

    if (this.hp <= 0) {
      this.dead = true;
      this.game.score += 50;
      this.game.audio.play("heavy");
      this.game.burst(this.x, this.y - 30, "#e6be88", 18, 1.3);

      if (Math.random() < 0.72) {
        this.game.items.push(
          new Item(
            this.game,
            this.x,
            this.y,
            Math.random() < 0.55 ? "health" : "power",
          ),
        );
      }
    }
  }

  draw(c) {
    oval(c, this.x, this.y + 3, 35, 9, "#01071566");

    if (this.kind === "barrel") {
      c.fillStyle = "#87694b";
      c.fillRect(this.x - 25, this.y - 59, 50, 58);
      oval(c, this.x, this.y - 59, 25, 8, "#bc915e");
      line(c, this.x - 25, this.y - 43, this.x + 25, this.y - 43, "#3a485b", 7);
      line(c, this.x - 25, this.y - 14, this.x + 25, this.y - 14, "#3a485b", 7);
    } else if (this.kind === "machine") {
      c.fillStyle = "#586f85";
      c.fillRect(this.x - 31, this.y - 70, 62, 69);
      c.fillStyle = "#172d47";
      c.fillRect(this.x - 22, this.y - 59, 44, 29);
      line(c, this.x - 17, this.y - 43, this.x + 17, this.y - 43, "#7cf7d9", 4);
      oval(c, this.x + 16, this.y - 15, 5, 5, "#ff846c");
    } else {
      c.fillStyle = "#b17e4b";
      c.fillRect(this.x - 30, this.y - 58, 60, 57);
      c.strokeStyle = "#e3bd86";
      c.lineWidth = 5;
      c.strokeRect(this.x - 27, this.y - 55, 54, 51);
      line(c, this.x - 22, this.y - 49, this.x + 23, this.y - 9, "#785337", 5);
      line(c, this.x + 22, this.y - 49, this.x - 23, this.y - 9, "#785337", 5);
    }
  }
}

/* ============================================================
   PLAYER / ZORD COMBAT
   ============================================================ */

class Player {
  constructor(game, ranger, giant = false) {
    Object.assign(this, {
      game,
      ranger,
      giant,
      config: RANGERS[ranger],
      x: giant ? 300 : 180,
      y: giant ? 625 : 540,
      z: 0,
      vz: 0,
      dir: 1,
      scale: giant ? 3.03 : 1.05,
      maxHp: giant ? 440 : 120,
      hp: giant ? 440 : 120,
      power: giant ? 65 : 35,
      state: "idle",
      moving: false,
      guarding: false,
      attack: null,
      buffer: null,
      comboStep: 0,
      comboTimer: 0,
      inv: 0,
      stun: 0,
      flash: 0,
      knock: 0,
      dashTime: 0,
      dashCooldown: 0,
      dashVector: { x: 1, y: 0 },
      dead: false,
      deathTimer: 0,
      deathDuration: 1.25,
    });
  }

  update(dt) {
    for (let key of ["inv", "stun", "flash", "dashCooldown", "comboTimer"]) {
      this[key] = Math.max(0, this[key] - dt);
    }

    if (!this.comboTimer && !this.attack) this.comboStep = 0;

    if (this.dead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.game.respawn();
      return;
    }

    this.x += this.knock * dt;
    this.knock *= Math.exp(-11 * dt);

    if (this.z > 0 || this.vz > 0) {
      this.z += this.vz * dt;
      this.vz -= 1050 * dt;

      if (this.z <= 0) {
        this.z = 0;
        this.vz = 0;
        this.game.burst(this.x, this.y, "#d4d8d6", 5, 0.5, true);
      }
    }

    let input = this.game.input;
    let axis = input.axes();
    if (this.giant) axis.y = 0;

    this.guarding =
      this.giant && input.held("dash") && !this.attack && this.stun <= 0;

    let j = input.take("attack");
    let k = input.take("heavy");
    let i = input.take("special");

    if (i && this.stun <= 0) {
      if (this.giant && this.game.finisherReady()) {
        this.game.startFinisher();
        return;
      }
      if (!this.attack) this.special();
    }

    if (this.attack && (j || k)) {
      this.buffer = k ? "heavy" : "normal";
    } else if (!this.attack && this.stun <= 0 && !this.guarding) {
      if (k) this.startAttack("heavy", axis);
      else if (j) this.startAttack(this.z > 15 ? "air" : "normal", axis);
    }

    if (
      !this.giant &&
      input.take("jump") &&
      this.z === 0 &&
      this.stun <= 0 &&
      !this.attack
    ) {
      this.vz = 460;
      this.state = "jumping";
      this.game.audio.play("punch");
    }

    if (
      !this.giant &&
      input.take("dash") &&
      this.dashCooldown <= 0 &&
      this.stun <= 0 &&
      !this.attack
    ) {
      this.dashVector = axis.x || axis.y ? { ...axis } : { x: this.dir, y: 0 };
      this.dashTime = 0.2;
      this.dashCooldown = 0.66;
      this.inv = Math.max(this.inv, 0.24);
      this.state = "running";
    }

    this.moving = false;

    if (this.dashTime > 0) {
      this.dashTime -= dt;
      this.x += this.dashVector.x * 810 * dt;
      this.y += this.dashVector.y * 560 * dt;
      this.moving = true;
      if (Math.random() < 0.6) {
        this.game.burst(this.x, this.y, this.config.color, 1, 0.4, true);
      }
    } else if (this.stun <= 0 && !this.attack && !this.guarding) {
      let speed = this.giant ? 195 : 192 + this.config.speed * 21;
      this.x += axis.x * speed * dt;
      this.y += axis.y * speed * 0.68 * dt;
      this.moving = !!(axis.x || axis.y);
      if (axis.x) this.dir = Math.sign(axis.x);
      this.state = this.z > 0 ? "jumping" : this.moving ? "walking" : "idle";
    }

    if (this.attack) this.updateAttack(dt);

    if (!this.attack && this.buffer && this.stun <= 0) {
      let buffered = this.buffer;
      this.buffer = null;
      this.startAttack(buffered, axis);
    }

    this.game.constrainPlayer();
  }

  startAttack(kind, axis = { x: 0, y: 0 }) {
    if (this.dead || this.stun > 0) return;
    if (axis.x) this.dir = Math.sign(axis.x);

    let finisher = kind === "heavy" && this.comboStep >= 2;
    this.comboStep = this.comboTimer > 0 ? (this.comboStep % 4) + 1 : 1;
    this.comboTimer = 1.3;
    if (this.comboStep === 4) finisher = true;

    let heavy = kind === "heavy" || finisher;
    let duration = this.giant
      ? heavy
        ? 0.82
        : 0.54
      : heavy
        ? 0.46
        : this.config.rate;
    let damage =
      (12 + this.config.atk * 3) * (heavy ? 1.8 : 1) * (this.giant ? 2.35 : 1);
    if (kind === "air") damage *= 1.25;
    if (finisher) damage *= 1.2;

    this.attack = {
      kind,
      heavy,
      finisher,
      duration,
      damage,
      elapsed: 0,
      resolved: false,
      hits: new Set(),
      range: this.giant
        ? heavy
          ? 345
          : 285
        : this.config.range + (heavy ? 35 : 0) + (kind === "air" ? 20 : 0),
      depth: this.giant ? 130 : heavy ? 65 : 45,
    };

    this.state = heavy ? "heavyAttack" : "attacking";
    this.game.audio.play(heavy ? "kick" : "punch");

    if (heavy && (axis.x || axis.y)) {
      this.x += axis.x * (this.giant ? 22 : 29);
      this.y += axis.y * 22;
    }
  }

  special() {
    if (this.power < 60) {
      this.game.toast(this.game.t("need"));
      return;
    }

    this.power -= 60;
    this.state = "special";
    this.inv = this.giant ? 1.2 : 0.85;
    this.attack = {
      kind: "special",
      heavy: true,
      elapsed: 0,
      duration: this.giant ? 1.1 : 0.8,
      damage: this.giant ? 185 : 72 + this.config.atk * 8,
      hits: new Set(),
      resolved: false,
      range: this.giant ? 1000 : 280,
      depth: 160,
    };

    this.game.toast(this.game.name(this.config.special));
    this.game.audio.play("special");
    this.game.shake = this.giant ? 14 : 8;
    this.game.flash = 0.13;
    this.game.burst(
      this.x,
      this.y - (this.giant ? 220 : 77),
      this.config.color,
      35,
      this.giant ? 2.5 : 1.5,
    );
  }

  updateAttack(dt) {
    let a = this.attack;
    a.elapsed += dt;
    let f = a.elapsed / a.duration;

    if (a.kind === "special") {
      if (!a.resolved && f >= 0.24) {
        a.resolved = true;
        this.resolveSpecial();
      }
    } else if (f >= 0.23 && f < 0.75) {
      for (let enemy of this.game.enemies) {
        if (enemy.dead || a.hits.has(enemy)) continue;
        let dx = enemy.x - this.x;
        let dy = enemy.y - this.y;

        if (
          Math.abs(dx) < a.range + enemy.scale * 12 &&
          Math.abs(dy) < a.depth &&
          dx * this.dir > -22 &&
          (enemy.z < 85 || a.kind === "air" || this.giant)
        ) {
          a.hits.add(enemy);
          enemy.hurt(a.damage, this.dir, {
            heavy: a.heavy,
            finisher: a.finisher,
            aerial: a.kind === "air",
          });
        }
      }

      for (let object of this.game.objects) {
        if (
          !object.dead &&
          !a.hits.has(object) &&
          Math.abs(object.x - this.x) < a.range &&
          Math.abs(object.y - this.y) < a.depth &&
          (object.x - this.x) * this.dir > -20
        ) {
          a.hits.add(object);
          object.hurt(a.damage);
        }
      }

      if (this.giant && a.heavy && !a.resolved) {
        a.resolved = true;
        this.game.damageBuilding(this.x + this.dir * 220);
      }
    }

    if (f >= 1) {
      this.attack = null;
      this.state = this.z > 0 ? "jumping" : "idle";
    }
  }

  resolveSpecial() {
    let g = this.game;
    let color = this.config.color;

    if (this.giant) {
      g.projectiles.push(
        new Projectile(g, {
          x: this.x + this.dir * 85,
          y: this.y,
          vx: this.dir * 790,
          team: "player",
          damage: 185,
          radius: 55,
          height: 220,
          life: 2,
          color,
          piercing: true,
          kind: this.ranger === 4 ? "beam" : "slash",
        }),
      );
      return;
    }

    if ([1, 3, 5].includes(this.ranger)) {
      let radius = this.ranger === 1 ? 290 : this.ranger === 3 ? 250 : 345;

      if (this.ranger === 5) {
        this.x += this.dir * 85;
        g.constrainPlayer();
      }

      for (let enemy of g.enemies) {
        if (
          !enemy.dead &&
          Math.abs(enemy.x - this.x) < radius &&
          Math.abs(enemy.y - this.y) < 150
        ) {
          enemy.hurt(
            this.attack.damage,
            Math.sign(enemy.x - this.x) || this.dir,
            { heavy: true, special: true },
          );
        }
      }

      for (let object of g.objects) {
        if (
          !object.dead &&
          Math.hypot(object.x - this.x, object.y - this.y) < radius
        ) {
          object.hurt(100);
        }
      }

      if (this.ranger === 3) {
        for (let i = -2; i <= 2; i++) {
          g.projectiles.push(
            new Projectile(g, {
              x: this.x,
              y: this.y,
              vx: this.dir * 650,
              vy: i * 85,
              team: "player",
              damage: 24,
              radius: 8,
              life: 0.8,
              color,
            }),
          );
        }
      }
    } else {
      g.projectiles.push(
        new Projectile(g, {
          x: this.x + this.dir * 45,
          y: this.y,
          vx: this.dir * 740,
          team: "player",
          damage: this.attack.damage,
          radius: this.ranger === 2 ? 29 : 25,
          life: 1.8,
          color,
          piercing: true,
          kind: this.ranger === 0 ? "slash" : "beam",
        }),
      );
    }
  }

  hurt(amount, direction, knockdown = false) {
    if (this.dead || this.inv > 0 || this.game.state !== "play") return;

    let blocked = this.guarding && direction === -this.dir;
    if (blocked) {
      amount *= 0.16;
      this.power = Math.min(100, this.power + 7);
      this.game.audio.play("guard");
      this.game.float(this.game.t("guard"), this.x, this.y - 300, "#9cefff");
      knockdown = false;
    }

    amount *= 1 - this.config.def * 0.035;
    this.hp = Math.max(0, this.hp - amount);
    this.power = Math.min(100, this.power + amount * 0.45);
    this.inv = this.giant ? 0.48 : 0.72;
    this.stun = blocked ? 0.08 : knockdown ? 0.6 : 0.28;
    this.flash = 0.12;
    this.knock = direction * (blocked ? 35 : this.giant ? 110 : 240);
    this.attack = null;
    this.buffer = null;
    this.dashTime = 0;
    this.state = knockdown ? "knockedDown" : "hurt";
    this.game.shake = Math.max(this.game.shake, this.giant ? 13 : 5);
    this.game.damageFlash = 0.16;
    this.game.audio.play("hit");
    this.game.burst(
      this.x,
      this.y - (this.giant ? 220 : 77),
      "#ff8d9d",
      12,
      this.giant ? 2 : 1,
    );

    if (this.hp <= 0) {
      this.dead = true;
      this.state = "dead";
      this.deathTimer = this.deathDuration;
      this.game.lives--;
      this.game.stageDeaths++;
      this.game.audio.play("explosion");
    }
  }

  draw(c) {
    if (this.giant) drawZord(c, this, this.game.clock);
    else drawFighter(c, this, this.game.clock);

    let a = this.attack;
    if (!a || this.dead) return;
    let f = clamp(a.elapsed / a.duration, 0, 1);
    let size = this.giant ? 2.6 : 1;

    c.save();
    c.globalAlpha = Math.sin(f * Math.PI) * 0.8;
    c.translate(this.x, this.y - this.z - 80 * size);

    if (a.kind === "special") {
      c.strokeStyle = this.config.color;
      c.lineWidth = 9 * size;
      c.beginPath();
      c.ellipse(
        0,
        25,
        (70 + f * 220) * size,
        (32 + f * 65) * size,
        f * 5,
        0,
        TAU,
      );
      c.stroke();

      if (this.ranger === 1 || this.ranger === 3) {
        for (let i = 0; i < 6; i++) {
          let angle = f * 13 + (i * TAU) / 6;
          line(
            c,
            Math.cos(angle) * 40,
            Math.sin(angle) * 25,
            Math.cos(angle) * 190,
            Math.sin(angle) * 85,
            this.config.color,
            5,
          );
        }
      }
    } else {
      c.scale(this.dir, 1);
      c.strokeStyle = a.heavy ? "#ffe6a1" : this.config.color;
      c.lineWidth = (a.heavy ? 14 : 8) * size;
      c.beginPath();
      c.ellipse(
        17,
        0,
        a.range * 0.88,
        50 * size,
        -0.25,
        -1.4 + f * 0.7,
        1.2 + f * 0.4,
      );
      c.stroke();
      c.strokeStyle = "#ffffffcc";
      c.lineWidth = 3 * size;
      c.stroke();
    }
    c.restore();
  }
}

/* ============================================================
   ENEMY AI / BOSSES
   ============================================================ */

let nextEnemyId = 1;

class Enemy {
  constructor(game, kind, x, y, options = {}) {
    let boss = !!options.boss;
    let config = boss ? BOSSES[kind] : ENEMIES[kind];
    let giant = !!options.giant;
    let hp = config.hp * (1 + game.stageIndex * (boss ? 0.025 : 0.045));
    if (giant && kind !== "titan") hp *= 1.65;
    if (options.duo) hp *= 0.72;
    if (options.mini && kind === "goldar") hp *= 0.62;

    Object.assign(this, {
      game,
      kind,
      x,
      y,
      config,
      boss,
      giant,
      mini: !!options.mini,
      id: nextEnemyId++,
      maxHp: hp,
      hp,
      scale: giant ? (kind === "titan" ? 3.55 : 3.2) : config.scale,
      z: 0,
      dir: -1,
      state: "walking",
      moving: false,
      stun: 0,
      inv: 0,
      flash: 0,
      open: 0,
      knock: 0,
      cooldown: random(0.7, 1.4),
      decision: random(0.6, 1.2),
      offset: random(-80, 80),
      retreat: 0,
      dodgeCooldown: random(1.5, 3),
      attack: null,
      phase: 1,
      rage: false,
      patternIndex: 0,
      environmentTimer: 3,
      dead: false,
      deathDuration: boss ? 1.35 : 0.85,
      deathTimer: boss ? 1.35 : 0.85,
    });

    this.side = this.id % 2 ? -1 : 1;
  }

  update(dt) {
    for (let key of ["flash", "inv", "stun", "open"]) {
      this[key] = Math.max(0, this[key] - dt);
    }

    this.cooldown -= dt;
    this.dodgeCooldown -= dt;

    if (this.dead) {
      this.deathTimer -= dt;
      return;
    }

    this.x += this.knock * dt;
    this.knock *= Math.exp(-9 * dt);
    this.moving = false;

    let g = this.game;
    let p = g.player;

    if (this.boss) {
      let previousPhase = this.phase;
      this.phase =
        this.hp < this.maxHp * 0.33 ? 3 : this.hp < this.maxHp * 0.66 ? 2 : 1;

      if (this.phase > previousPhase) {
        g.float(
          g.t("phase") + " " + this.phase,
          this.x,
          this.y - this.scale * 156,
          "#ffdc9d",
        );
        g.burst(this.x, this.y - this.scale * 80, this.config.color, 20, 1.5);
      }

      if (
        ["zedd", "titan"].includes(this.kind) &&
        this.phase === 3 &&
        !p.dead
      ) {
        this.environmentTimer -= dt;
        if (this.environmentTimer <= 0) {
          this.environmentTimer = this.giant ? 3.3 : 3.8;
          g.hazards.push(
            new Hazard(
              g,
              p.x,
              p.y,
              this.giant ? 120 : 80,
              this.config.damage,
              1.1,
              "lightning",
            ),
          );
        }
      }
    }

    if (this.stun > 0 || p.dead) {
      this.constrain();
      return;
    }

    if (this.attack) {
      this.updateAttack(dt);
      this.constrain();
      return;
    }

    this.z = 0;

    let dx = p.x - this.x;
    let dy = p.y - this.y;
    this.dir = dx >= 0 ? 1 : -1;

    let rage =
      this.rage || (this.kind === "goldar" && this.hp < this.maxHp * 0.4);
    let multiplier = 1 + (this.phase - 1) * 0.1 + (rage ? 0.25 : 0);
    if (this.kind === "scorpina" && this.hp < this.maxHp * 0.4)
      multiplier += 0.3;

    let speed = this.config.speed * multiplier * (1 + g.stageIndex * 0.025);
    let range = this.giant ? 305 : this.config.range;
    let aligned = Math.abs(dy) < (this.giant ? 130 : this.boss ? 60 : 38);
    let limit =
      this.giant || (g.stageIndex === 4 && this.boss && !this.mini) ? 1 : 2;
    let canAttack = g.enemies.filter((e) => !e.dead && e.attack).length < limit;

    let nextPattern = this.boss
      ? this.config.patterns[this.patternIndex % this.config.patterns.length]
      : this.kind === "gunner"
        ? "energy"
        : this.kind === "tenga"
          ? "dive"
          : this.kind === "brute"
            ? "slam"
            : "combo";

    let rangedPattern = [
      "energy",
      "beam",
      "wind",
      "missiles",
      "lightning",
      "teleport",
      "wave",
      "charge",
      "dive",
    ].includes(nextPattern);

    let inRange = rangedPattern
      ? Math.abs(dx) < (this.giant ? 1100 : 610)
      : Math.abs(dx) < range + (nextPattern === "spin" ? 70 : 12);

    let alignedEnough =
      ["teleport", "lightning", "dive"].includes(nextPattern) || aligned;

    if (this.retreat > 0) {
      this.retreat -= dt;
      this.move(
        -Math.sign(dx) * speed * 0.7,
        Math.sign(this.offset) * speed * 0.25,
        dt,
      );
    } else if (canAttack && this.cooldown <= 0 && inRange && alignedEnough) {
      this.startAttack(nextPattern);
    } else {
      this.decision -= dt;

      if (this.decision <= 0) {
        this.decision = random(0.7, 1.5);
        this.offset = random(-90, 90);
        if (!this.boss && Math.random() < 0.15 && Math.abs(dx) < 150) {
          this.retreat = 0.35;
        }
      }

      let waiting = !canAttack || this.cooldown > 0.3;
      let desired = this.kind === "gunner" ? 340 : range * 0.72;
      let targetX = p.x + this.side * (desired + (waiting ? 55 : 0));
      let targetY = p.y + (waiting && !this.giant ? this.offset : 0);

      if (this.kind === "gunner") targetX = p.x - this.dir * desired;

      let mx = targetX - this.x;
      let my = targetY - this.y;
      if (Math.abs(dx) < desired * 0.48) mx = -Math.sign(dx) * 100;

      let length = Math.hypot(mx, my);
      if (length > 10)
        this.move((mx / length) * speed, (my / length) * speed * 0.7, dt);
    }

    if (
      ["ninja", "tenga"].includes(this.kind) &&
      this.dodgeCooldown <= 0 &&
      p.attack &&
      Math.abs(dx) < 185 &&
      Math.abs(dy) < 75
    ) {
      this.dodgeCooldown = random(2.2, 3.6);
      g.burst(this.x, this.y - 65, "#bc97f3", 10);
      this.x -= this.dir * (this.kind === "ninja" ? 110 : 45);
      this.y += pick([-68, 68]);
      this.inv = 0.18;
    }

    this.constrain();
  }

  move(vx, vy, dt) {
    this.x += vx * dt;
    if (!this.giant) this.y += vy * dt;
    this.moving = Math.abs(vx) + Math.abs(vy) > 10;
  }

  constrain() {
    let left = this.giant ? 0 : this.game.stageManager.left;
    this.x = clamp(
      this.x,
      left + (this.giant ? 95 : 42),
      left + W - (this.giant ? 95 : 42),
    );
    this.y = this.giant ? 625 : clamp(this.y, 431, 650);
  }

  startAttack(pattern) {
    let p = this.game.player;
    let windup =
      (this.giant ? 0.9 : this.boss ? 0.67 : 0.47) /
      (1 + (this.phase - 1) * 0.08 + (this.rage ? 0.12 : 0));

    this.attack = {
      pattern,
      windup,
      elapsed: 0,
      duration: windup + (pattern === "combo" ? 0.72 : 0.58),
      done: false,
      strikes: 0,
      targetX: p.x,
      targetY: p.y,
      dir: Math.sign(p.x - this.x) || this.dir,
    };

    this.dir = this.attack.dir;
    this.state = "attacking";
    if (this.boss) this.patternIndex++;
  }

  updateAttack(dt) {
    let a = this.attack;
    let g = this.game;
    let p = g.player;
    a.elapsed += dt;
    let active = a.elapsed >= a.windup;
    let damage =
      this.config.damage * (this.rage ? 1.2 : 1) * (this.giant ? 1.15 : 1);
    let range = this.giant ? 315 : this.config.range;

    if (a.pattern === "dive") {
      this.z =
        Math.sin(clamp(a.elapsed / a.duration, 0, 1) * Math.PI) *
        (this.giant ? 115 : 145);
      if (active) {
        this.x = lerp(this.x, a.targetX, 1 - Math.exp(-8 * dt));
        if (!this.giant)
          this.y = lerp(this.y, a.targetY, 1 - Math.exp(-8 * dt));
      }
    }

    if (a.pattern === "charge" && active) {
      this.x += a.dir * (this.giant ? 680 : 575) * dt;
      if (
        !a.done &&
        Math.abs(p.x - this.x) < range * 0.65 &&
        Math.abs(p.y - this.y) < (this.giant ? 130 : 65)
      ) {
        p.hurt(damage * 1.2, a.dir, true);
        a.done = true;
      }
      if (Math.random() < 0.45)
        g.burst(this.x, this.y, "#d7d7d6", 2, 0.7, true);
    } else if (a.pattern === "combo" && active) {
      let count = this.boss ? (this.phase > 1 ? 3 : 2) : 1;
      if (a.strikes < count && a.elapsed >= a.windup + a.strikes * 0.23) {
        a.strikes++;
        let dx = p.x - this.x;

        if (
          Math.abs(dx) < range &&
          Math.abs(p.y - this.y) < (this.giant ? 130 : 60) &&
          dx * a.dir > -25 &&
          p.z < 70
        ) {
          p.hurt(damage, a.dir, this.kind === "brute");
        }

        g.burst(
          this.x + a.dir * range * 0.62,
          this.y - (this.giant ? 220 : 75),
          "#ffdda5",
          5,
        );
        g.audio.play("kick");
      }
    } else if (active && !a.done && a.pattern !== "charge") {
      a.done = true;

      if (["energy", "beam", "missiles", "wind"].includes(a.pattern)) {
        let count =
          a.pattern === "missiles"
            ? 5
            : a.pattern === "wind"
              ? 3
              : this.phase >= 2
                ? 2
                : 1;

        for (let n = 0; n < count; n++) {
          let spread = (n - (count - 1) / 2) * (this.giant ? 0 : 43);
          let delayDistance = this.giant ? n * 105 : 0;
          g.projectiles.push(
            new Projectile(g, {
              x:
                this.x + a.dir * (this.giant ? 90 : 42) - a.dir * delayDistance,
              y: this.y + spread,
              vx: a.dir * (a.pattern === "wind" ? 325 : this.giant ? 570 : 425),
              vy: this.giant ? 0 : clamp((a.targetY - this.y) * 0.5, -75, 75),
              damage,
              radius: this.giant ? 32 : a.pattern === "beam" ? 21 : 13,
              height: this.giant ? 220 : 70,
              color: a.pattern === "wind" ? "#b0f1ff" : "#ff7aad",
              kind:
                a.pattern === "beam"
                  ? "beam"
                  : this.kind === "goldar" || this.kind === "scorpina"
                    ? "slash"
                    : "orb",
            }),
          );
        }
        g.audio.play("special");
      } else if (a.pattern === "lightning") {
        for (let n = 0; n < this.phase + 1; n++) {
          g.hazards.push(
            new Hazard(
              g,
              clamp(
                a.targetX + (n - this.phase / 2) * (this.giant ? 135 : 95),
                g.camera + 55,
                g.camera + W - 55,
              ),
              a.targetY,
              this.giant ? 100 : 68,
              damage,
              0.7 + n * 0.15,
              "lightning",
            ),
          );
        }
      } else if (a.pattern === "teleport") {
        g.burst(this.x, this.y - 80, "#f18bdf", 20);
        this.x = p.x - p.dir * 125;
        this.y = p.y;
        this.inv = 0.2;
        this.dir = p.dir;
        this.constrain();
        g.hazards.push(new Hazard(g, p.x, p.y, 105, damage, 0.58));
      } else if (a.pattern === "wave") {
        for (let n = 1; n <= 5; n++) {
          g.hazards.push(
            new Hazard(
              g,
              this.x + a.dir * n * (this.giant ? 140 : 105),
              this.y,
              this.giant ? 102 : 78,
              damage,
              0.15 * n + 0.15,
              "wave",
            ),
          );
        }
      } else {
        let x =
          a.pattern === "dive"
            ? a.targetX
            : a.pattern === "slam"
              ? this.x + a.dir * range * 0.55
              : this.x;
        let y = a.pattern === "dive" ? a.targetY : this.y;
        g.hazards.push(
          new Hazard(
            g,
            x,
            y,
            this.giant ? 225 : a.pattern === "spin" ? 185 : 130,
            damage * 1.15,
            a.pattern === "dive" ? 0.2 : 0.28,
          ),
        );
      }
    }

    if (a.elapsed >= a.duration) {
      this.attack = null;
      this.z = 0;
      this.open = this.kind === "zputty" ? 1.2 : 0.25;
      this.state = "idle";
      this.cooldown =
        (this.boss ? 1.25 : random(0.95, 1.7)) /
        (1 + (this.phase - 1) * 0.17 + (this.rage ? 0.2 : 0));

      if (!this.boss && Math.random() < 0.4) this.retreat = 0.4;
    }
  }

  hurt(amount, direction, flags = {}) {
    if (this.dead || this.inv > 0) return false;
    let g = this.game;
    let frontal = direction === -this.dir;
    let shield = ["shield", "shieldCommander", "guard"].includes(this.kind);
    let blockChance =
      ["elite", "goldar"].includes(this.kind) && Math.random() < 0.22;

    if (
      frontal &&
      !flags.heavy &&
      !flags.special &&
      !this.attack &&
      (shield || blockChance)
    ) {
      g.audio.play("guard");
      g.float(g.t("block"), this.x, this.y - this.scale * 150, "#b5ecff");
      g.burst(this.x, this.y - this.scale * 77, "#b5ecff", 7);
      this.cooldown = Math.min(this.cooldown, 0.3);
      return false;
    }

    if (this.kind === "zputty" && (flags.heavy || this.open > 0)) {
      amount *= 1.8;
      g.float(g.t("weak"), this.x, this.y - 155, "#ffe393");
    }

    this.hp = this.giant
      ? Math.max(this.maxHp * 0.15, this.hp - amount)
      : Math.max(0, this.hp - amount);

    this.flash = 0.11;
    this.stun = this.boss
      ? flags.heavy
        ? 0.15
        : 0.035
      : flags.heavy
        ? 0.46
        : 0.25;
    this.knock = direction * (this.boss ? 65 : flags.heavy ? 420 : 185);

    if (!this.boss || flags.special) {
      this.attack = null;
      this.z = 0;
    }

    this.state = "hurt";
    g.registerHit();
    g.player.power = Math.min(100, g.player.power + (flags.special ? 1 : 5));
    g.burst(
      this.x,
      this.y - this.scale * 78,
      flags.heavy ? "#ffe59b" : "#c2f3ff",
      flags.heavy ? 15 : 8,
      this.giant ? 2 : 1,
    );
    g.audio.play(flags.heavy ? "heavy" : "hit");
    g.shake = Math.max(g.shake, this.giant ? 12 : flags.heavy ? 7 : 3);
    if (flags.finisher) g.slow = 0.13;
    g.float(
      String(Math.round(amount)),
      this.x,
      this.y - this.scale * 128,
      flags.heavy ? "#ffe8ac" : "#fff",
    );

    if (this.hp <= 0) this.die();
    return true;
  }

  die() {
    if (this.dead) return;
    let g = this.game;
    this.dead = true;
    this.attack = null;
    this.state = "dead";
    this.deathTimer = this.deathDuration;
    g.kills++;
    if (this.boss) g.bossKills++;
    g.score += this.boss ? (this.mini ? 1000 : 5000) : this.config.score;
    g.player.power = Math.min(100, g.player.power + (this.boss ? 20 : 10));
    g.burst(
      this.x,
      this.y - this.scale * 70,
      this.config.color,
      this.boss ? 35 : 15,
      this.boss ? 2 : 1,
    );

    if (this.boss) {
      g.audio.play("explosion");
      g.shake = 16;
      g.slow = 0.25;

      if (g.stageIndex === 4 && !this.mini) {
        g.enemies
          .filter((e) => e !== this && e.boss && !e.dead)
          .forEach((e) => {
            e.rage = true;
            g.float(g.t("rage"), e.x, e.y - e.scale * 155, "#ff9a8e");
          });
      }
    }

    if (!g.giant) {
      let chance = Math.random();
      if (chance < 0.022) g.items.push(new Item(g, this.x, this.y, "life"));
      else if (chance < 0.2)
        g.items.push(new Item(g, this.x, this.y, "health"));
      else if (chance < 0.35)
        g.items.push(new Item(g, this.x, this.y, "power"));
    }

    g.saveHigh();
  }

  draw(c) {
    drawFighter(c, this, this.game.clock);

    if (!this.dead && !this.boss && this.hp < this.maxHp) {
      let width = 47 * this.scale;
      c.fillStyle = "#172239";
      c.fillRect(this.x - width / 2, this.y - this.scale * 160, width, 5);
      c.fillStyle = "#ffa28a";
      c.fillRect(
        this.x - width / 2,
        this.y - this.scale * 160,
        (width * this.hp) / this.maxHp,
        5,
      );
    }

    let a = this.attack;
    if (a && !this.dead && a.elapsed < a.windup) {
      text(
        c,
        "!",
        this.x,
        this.y - this.scale * 165,
        this.giant ? 55 : 34,
        Math.floor(a.elapsed * 12) % 2 ? "#fff" : "#ff7b91",
      );

      if (["charge", "beam"].includes(a.pattern)) {
        c.fillStyle = "#ff416b22";
        let width = this.giant ? 950 : 460;
        c.fillRect(a.dir > 0 ? this.x : this.x - width, this.y - 30, width, 60);
      }

      if (a.pattern === "dive") {
        oval(c, a.targetX, a.targetY, this.giant ? 165 : 90, 28, "#ff486650");
      }
    }

    if (
      !this.dead &&
      this.boss &&
      (this.rage || (this.kind === "goldar" && this.hp < this.maxHp * 0.4))
    ) {
      c.save();
      c.globalAlpha = 0.35 + Math.sin(this.game.clock * 12) * 0.15;
      c.strokeStyle = "#ff754f";
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(
        this.x,
        this.y - this.scale * 75,
        this.scale * 45,
        this.scale * 80,
        0,
        0,
        TAU,
      );
      c.stroke();
      c.restore();
    }
  }
}

/* ============================================================
   STAGE PROGRESSION
   ============================================================ */

class StageManager {
  constructor(game) {
    this.game = game;
    this.index = -1;
    this.left = 0;
    this.locked = false;
    this.nextTrigger = 260;
    this.queue = [];
    this.spawnTimer = 0;
    this.clearTimer = 0;
    this.finished = false;
    this.encounters = [];
  }

  setup() {
    let g = this.game;
    let stage = STAGES[g.stageIndex];

    this.encounters = stage.waves.map((pool, i) => ({
      types: Array.from(
        { length: 3 + i + (g.stageIndex >= 3 ? 1 : 0) },
        (_, n) => pool[n % pool.length],
      ),
      boss: false,
      mini: false,
    }));

    if (stage.mini) {
      this.encounters.push({ types: [stage.mini], boss: true, mini: true });
    }

    this.encounters.push({ types: stage.bosses, boss: true, mini: false });

    for (let i = 0; i < this.encounters.length; i++) {
      let x = i * 930;
      let machine = ["factory", "fortress", "moon"].includes(stage.theme);
      g.objects.push(
        new Breakable(g, x + 560, 592, machine ? "machine" : "crate"),
      );
      g.objects.push(
        new Breakable(
          g,
          x + 980,
          458,
          stage.theme === "park" ? "crate" : "barrel",
        ),
      );
    }
  }

  update(dt) {
    if (this.finished) return;
    let g = this.game;

    if (!this.locked && g.player.x >= this.nextTrigger) this.start();

    if (this.locked) {
      this.spawnTimer -= dt;
      let encounter = this.encounters[this.index];
      let alive = g.enemies.filter((e) => !e.dead).length;

      if (
        this.queue.length &&
        this.spawnTimer <= 0 &&
        alive < (encounter.boss ? 2 : 4)
      ) {
        this.spawn();
        this.spawnTimer = 0.72;
      }

      if (!this.queue.length && !g.enemies.length) {
        this.clearTimer += dt;

        if (this.clearTimer >= 0.65) {
          this.clearTimer = 0;
          this.locked = false;

          if (this.index === this.encounters.length - 1) {
            this.finished = true;
            g.endGround();
          } else {
            this.nextTrigger = this.left + 1190;
            g.toast(g.t("go"));
          }
        }
      }
    } else {
      let target = Math.max(this.left, g.player.x - 370);
      g.camera = lerp(g.camera, target, 1 - Math.exp(-5 * dt));
    }
  }

  start() {
    let g = this.game;
    this.index++;
    this.locked = true;
    this.left = Math.max(0, this.nextTrigger - 260);
    g.camera = this.left;
    this.queue = [...this.encounters[this.index].types];
    this.spawnTimer = 0.72;
    let encounter = this.encounters[this.index];

    if (encounter.boss) {
      g.toast(
        g.t("warning") +
          " " +
          encounter.types.map((kind) => g.name(BOSSES[kind].name)).join(" + "),
        3,
      );
      g.audio.play("transform");
    } else {
      g.toast(g.t("wave") + " " + (this.index + 1) + " — " + g.t("fight"), 2.6);
    }

    this.spawn();
  }

  spawn() {
    let kind = this.queue.shift();
    if (!kind) return;
    let encounter = this.encounters[this.index];
    let leftSide = !encounter.boss && Math.random() < 0.3;

    this.game.enemies.push(
      new Enemy(
        this.game,
        kind,
        this.left + (leftSide ? 60 : random(950, 1170)),
        random(455, 622),
        {
          boss: encounter.boss,
          mini: encounter.mini,
          duo: encounter.boss && encounter.types.length > 1,
        },
      ),
    );
  }
}

/* ============================================================
   GAME / MENUS / LIFECYCLE
   ============================================================ */

class Game {
  constructor() {
    this.lang = save.get("language", 0) === 1 ? 1 : 0;
    this.high = Number(save.get("high", 0)) || 0;
    this.audio = new AudioManager();
    this.state = "title";
    this.previousState = "play";
    this.selected = 0;
    this.menuIndex = 0;
    this.menuActions = [];
    this.clock = 0;
    this.animationTime = 0;
    this.runTime = 0;
    this.lastFrame = 0;
    this.camera = 0;
    this.stageIndex = 0;
    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.lives = 3;
    this.combo = 0;
    this.comboTimer = 0;
    this.bestCombo = 0;
    this.stageDeaths = 0;
    this.giant = false;
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.hazards = [];
    this.items = [];
    this.objects = [];
    this.particles = [];
    this.floats = [];
    this.damagedBuildings = new Set();
    this.shake = 0;
    this.flash = 0;
    this.damageFlash = 0;
    this.slow = 0;
    this.toastTimer = 0;
    this.touch =
      matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    this.dom = {};

    [
      "hud",
      "overlay",
      "panel",
      "toast",
      "touchControls",
      "portrait",
      "playerName",
      "hpLabel",
      "powerLabel",
      "hpFill",
      "powerFill",
      "livesLabel",
      "scoreLabel",
      "stageLabel",
      "bossBars",
    ].forEach((id) => (this.dom[id] = document.getElementById(id)));

    this.input = new InputManager(this);
    // Update mobile controls when switching device mode or resizing.
    let updateMobileControls = () => {
      this.touch =
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(any-pointer: coarse)").matches ||
        window.matchMedia("(max-width: 900px)").matches;

      this.dom.touchControls.hidden = !(this.touch && this.state === "play");
    };

    window.addEventListener("resize", updateMobileControls);

    window
      .matchMedia("(any-pointer: coarse)")
      .addEventListener("change", updateMobileControls);

    window
      .matchMedia("(max-width: 900px)")
      .addEventListener("change", updateMobileControls);

    updateMobileControls();
    document
      .querySelector("#pauseButton")
      .addEventListener("click", () => this.pauseOrBack());
    document.documentElement.lang = this.lang ? "zh-CN" : "en";
    this.title();

    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  t(key) {
    return WORDS[key]?.[this.lang] || key;
  }
  name(value) {
    return value[this.lang];
  }

  isMenu() {
    return [
      "title",
      "select",
      "help",
      "paused",
      "over",
      "clear",
      "victory",
    ].includes(this.state);
  }

  active() {
    return ["intro", "play", "growth", "finisher"].includes(this.state);
  }

  setState(state) {
    this.state = state;
    this.input.clear();
    this.dom.overlay.hidden = !this.isMenu();
    this.dom.hud.hidden = ["title", "select", "help", "victory"].includes(
      state,
    );
    this.dom.touchControls.hidden = !(this.touch && state === "play");
    if (!this.isMenu()) this.dom.panel.innerHTML = "";
  }

  menu(header, entries, footer = "") {
    this.menuActions = entries.map((e) => e.action);
    this.menuIndex = clamp(this.menuIndex, 0, entries.length - 1);

    this.dom.panel.innerHTML =
      header +
      `
      <div class="menu">
        ${entries
          .map(
            (entry, i) => `
          <button data-menu="${i}" class="${entry.primary ? "primary " : ""}
            ${i === this.menuIndex ? "selected" : ""}">${entry.label}</button>
        `,
          )
          .join("")}
      </div>${footer}`;

    this.dom.panel.querySelectorAll("[data-menu]").forEach((button) => {
      button.addEventListener("click", () => {
        this.menuIndex = Number(button.dataset.menu);
        this.activateMenu();
      });
      button.addEventListener("pointerenter", () => {
        this.menuIndex = Number(button.dataset.menu);
        this.highlightMenu();
      });
    });
  }

  highlightMenu() {
    this.dom.panel.querySelectorAll("[data-menu]").forEach((button) => {
      button.classList.toggle(
        "selected",
        Number(button.dataset.menu) === this.menuIndex,
      );
    });
  }

  activateMenu() {
    this.audio.unlock();
    this.audio.play("menu");
    this.menuActions[this.menuIndex]?.();
  }

  menuKey(code) {
    if (this.state === "select") {
      let delta = 0;
      let columns = matchMedia("(pointer: coarse) and (orientation: portrait)")
        .matches
        ? 3
        : 6;

      if (["ArrowLeft"].includes(code)) delta = -1;
      if (["ArrowRight"].includes(code)) delta = 1;
      if (["ArrowUp"].includes(code)) delta = columns === 3 ? -3 : -1;
      if (["ArrowDown"].includes(code)) delta = columns === 3 ? 3 : 1;

      if (delta) {
        this.selected = (this.selected + delta + 6) % 6;
        this.audio.play("menu");
        this.renderSelection();
      } else if (code === "Enter" || code === "KeyA") {
        this.startRun();
      }
      return;
    }

    let count = this.menuActions.length;
    if (!count) return;

    if (["ArrowUp"].includes(code)) {
      this.menuIndex = (this.menuIndex - 1 + count) % count;
      this.audio.play("menu");
      this.highlightMenu();
    } else if (["ArrowDown"].includes(code)) {
      this.menuIndex = (this.menuIndex + 1) % count;
      this.audio.play("menu");
      this.highlightMenu();
    } else if (["Enter", "KeyA", "Space"].includes(code)) {
      this.activateMenu();
    }
  }

  setting(kind) {
    return (
      this.t(kind) +
      " " +
      this.t(
        (kind === "music" ? this.audio.musicOn : this.audio.soundOn)
          ? "on"
          : "off",
      )
    );
  }

  toggle(kind) {
    if (kind === "music") {
      this.audio.toggleMusic();
      if (this.audio.musicOn && this.audio.missing)
        this.toast(this.t("musicMissing"));
    } else {
      this.audio.toggleSound();
    }

    if (this.state === "paused") this.renderPause();
    else this.title(false);
  }

  title(reset = true) {
    this.saveHigh();
    this.setState("title");
    this.giant = false;
    if (reset) this.menuIndex = 0;

    this.menu(
      `
      <div class="eyebrow">${this.t("arcade")}</div>
      <h1 class="title"><em>MIGHTY MORPHIN</em><br>POWER RANGERS</h1>
      <div class="subtitle">恐龙战队</div>`,
      [
        {
          label: this.t("start"),
          primary: true,
          action: () => this.selection(),
        },
        { label: this.t("how"), action: () => this.help() },
        { label: this.setting("music"), action: () => this.toggle("music") },
        { label: this.setting("sound"), action: () => this.toggle("sound") },
        {
          label:
            this.t("language") + " " + (this.lang ? "简体中文" : "English"),
          action: () => {
            this.lang = 1 - this.lang;
            save.set("language", this.lang);
            document.documentElement.lang = this.lang ? "zh-CN" : "en";
            this.title(false);
          },
        },
      ],
      `<div class="note">${this.t("high")} ${String(this.high).padStart(7, "0")}
      <br>${this.t("menuHint")}</div>`,
    );
  }

  selection() {
    this.setState("select");
    this.renderSelection();
  }

  renderSelection() {
    let r = RANGERS[this.selected];

    this.dom.panel.innerHTML = `
      <div class="eyebrow">⚡ ${this.t("grid")} ⚡</div>
      <h2>${this.t("select")}</h2>
      <div class="rangers">
        ${RANGERS.map(
          (ranger, i) => `
          <button class="card ${i === this.selected ? "selected" : ""}"
            style="--color:${ranger.color}" data-ranger="${i}">
            <canvas width="150" height="180"></canvas>
            <span>${this.name(ranger.name)}</span>
          </button>
        `,
        ).join("")}
      </div>
      <div class="details">
        <strong>${this.name(r.weapon)}</strong>
        <div class="stats">
          <span>${this.t("attack")} ${"★".repeat(Math.max(0, Math.min(5, r.atk)))}${"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, r.atk))))}</span>
          <span>${this.t("speed")} ${"★".repeat(Math.max(0, Math.min(5, r.speed)))}${"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, r.speed))))}</span>
          <span>${this.t("defence")} ${"★".repeat(Math.max(0, Math.min(5, r.def)))}${"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, r.def))))}</span>
        </div>
        <div>${this.t("special")}: ${this.name(r.special)}</div>
      </div>
      <div class="selection-buttons">
        <button id="selectBack" class="back">${this.t("back")}</button>
        <button id="deploy" class="confirm">${this.t("deploy")}</button>
      </div>
      <p class="note">${this.t("selectHint")}</p>
    `;

    this.dom.panel.querySelectorAll("[data-ranger]").forEach((button) => {
      let i = Number(button.dataset.ranger);
      let c = button.querySelector("canvas").getContext("2d");
      drawFighter(
        c,
        {
          ranger: i,
          x: 63,
          y: 173,
          scale: 1.08,
          dir: 1,
          inv: 0,
          stun: 0,
          state: "idle",
        },
        this.clock,
      );

      button.addEventListener("click", () => {
        this.selected = i;
        this.audio.play("menu");
        this.renderSelection();
      });
    });

    document
      .querySelector("#deploy")
      .addEventListener("click", () => this.startRun());
    document
      .querySelector("#selectBack")
      .addEventListener("click", () => this.title());
  }

  help() {
    this.setState("help");
    this.menuIndex = 0;

    let english = `
      <p><b>MOVE:</b> Arrows. Move vertically and diagonally to line up attacks.</p>
      <p><b>FIGHT:</b> A attack · S heavy · SPACE jump · D special · W dodge.
      Double-tap a direction to dash. P / ESC pauses.</p>
      <p><b>COMBOS:</b> A → A → A → A finishes a combo. A → A → S gives a heavy finish.
      Press the next attack during a swing to queue it. Jump, then A for an aerial attack.</p>
      <p><b>TACTICS:</b> Direction + S lunges. Heavy attacks break shields.
      Z-Putties take extra damage from heavy attacks or just after attacking.
      Avoid red warnings; jump over ground shockwaves.</p>
      <p><b>POWER:</b> Hits, defeats and damage build power. Specials cost 60.
      Green orbs restore HP, blue crystals restore power, gold orbs give a life.</p>
      <p><b>ZORDS:</b> Stages 2, 4 and 6 have giant battles.
      A attacks, S strikes heavily, W guards from the front, D fires an ultimate.
      At 15% boss HP, press D for the cinematic finisher.</p>
      <p><b>MOBILE:</b> Hold two direction buttons for diagonals.
      A attack · S heavy · SP jump · D special / finisher · » dodge / guard.
      Tap Ⅱ to pause. Landscape provides more room.</p>
      <p><b>PROGRESS:</b> Clear each encounter, then follow GO to the right.
      Start with 3 lives. Continue restarts the current stage with 3 lives.</p>`;

    let chinese = `
      <p><b>移动：</b>方向键，可上下左右及斜向移动，先对齐敌人再攻击。</p>
      <p><b>战斗：</b>A 普通攻击 · S 重击 · 空格跳跃 · D 必杀技 · W 闪避。
      双击方向冲刺，P / ESC 暂停。</p>
      <p><b>连招：</b>A → A → A → A 终结连招，A → A → S 重击终结。
      挥击时按下次攻击可排队连招，跳跃后按 A 发动空中攻击。</p>
      <p><b>技巧：</b>方向 + S 突进重击，重击可破盾。
      Z型泥人在攻击后或受到重击时暴露弱点。避开红色预警，跳跃躲地面冲击波。</p>
      <p><b>能量：</b>命中、击败敌人和受伤可增加能量，必杀消耗60点。
      绿色球恢复生命，蓝色水晶补充能量，金色球增加一条生命。</p>
      <p><b>机甲：</b>第2、4、6关有巨大化战斗。
      A 攻击，S 重击，W 防御正面攻击，D 大招。
      首领生命降至15%时，按 D 使用剧情终结技。</p>
      <p><b>手机：</b>同时按住两个方向可斜向移动。
      A 攻击 · S 重击 · SP 跳跃 · D 必杀 / 终结 · » 闪避 / 防御。
      点击 Ⅱ 暂停，横屏体验更佳。</p>
      <p><b>流程：</b>清除当前敌人后跟随“前进”向右移动。
      初始3条生命，“继续”会以3条生命重开当前关卡。</p>`;

    this.menu(
      `<h2>${this.t("how")}</h2>
      <div class="instructions">${this.lang ? chinese : english}</div>`,
      [{ label: this.t("back"), primary: true, action: () => this.title() }],
    );
  }

  startRun() {
    this.audio.unlock();
    this.score = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.bestCombo = 0;
    this.runTime = 0;
    this.lives = 3;
    this.loadStage(0);
  }

  clearWorld() {
    this.enemies = [];
    this.projectiles = [];
    this.hazards = [];
    this.items = [];
    this.objects = [];
    this.particles = [];
    this.floats = [];
    this.damagedBuildings.clear();
    this.camera = 0;
    this.shake = 0;
    this.flash = 0;
    this.damageFlash = 0;
    this.slow = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.dom.bossBars.innerHTML = "";
    this.dom.bossBars.dataset.ids = "";
    this.dom.toast.classList.remove("visible");
    this.toastTimer = 0;
  }

  loadStage(index, checkpoint = null) {
    if (checkpoint) {
      this.score = checkpoint.score;
      this.kills = checkpoint.kills;
      this.bossKills = checkpoint.bossKills;
      this.lives = checkpoint.lives;
    }

    this.clearWorld();
    this.stageIndex = index;
    this.stage4BossPhase = 1;
    this.stage4BossEncountered = false;
    this.giant = false;
    this.stageDeaths = 0;
    this.checkpoint = {
      score: this.score,
      kills: this.kills,
      bossKills: this.bossKills,
      lives: this.lives,
    };

    this.player = new Player(this, this.selected);
    this.stageManager = new StageManager(this);
    this.stageManager.setup();
    this.introTimer = 2.5;
    this.setState("intro");
    this.audio.play("transform");
  }

  pauseOrBack() {
    if (this.active()) this.pause();
    else if (this.state === "paused") this.setState(this.previousState);
    else if (["select", "help"].includes(this.state)) this.title();
  }

  pause() {
    if (!this.active()) return;
    this.previousState = this.state;
    this.setState("paused");
    this.menuIndex = 0;
    this.renderPause();
  }

  renderPause() {
    this.menu(
      `<div class="eyebrow">${this.t("stage")} ${this.stageIndex + 1}</div>
      <h2>${this.t("paused")}</h2>`,
      [
        {
          label: this.t("resume"),
          primary: true,
          action: () => this.setState(this.previousState),
        },
        {
          label: this.t("restartStage"),
          action: () => this.loadStage(this.stageIndex, { ...this.checkpoint }),
        },
        { label: this.setting("music"), action: () => this.toggle("music") },
        { label: this.setting("sound"), action: () => this.toggle("sound") },
        { label: this.t("menu"), action: () => this.title() },
      ],
    );
  }

  respawn() {
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    let old = this.player;
    let p = new Player(this, this.selected, this.giant);
    p.x = clamp(old.x, this.camera + 110, this.camera + W - 110);
    p.y = old.y;
    p.power = Math.max(35, old.power);
    p.inv = 3;
    this.player = p;
    this.projectiles = [];
    this.hazards = [];

    this.enemies.forEach((e) => {
      e.attack = null;
      e.cooldown = 1.5;
      e.z = 0;
    });

    this.burst(p.x, p.y - (p.giant ? 220 : 77), p.config.color, 30, 1.5);
  }

  gameOver() {
    this.saveHigh();
    this.setState("over");
    this.menuIndex = 0;

    this.menu(
      `<h2>${this.t("over")}</h2>
      <p>${this.t("score")} ${this.score.toLocaleString()}</p>`,
      [
        {
          label: this.t("continue"),
          primary: true,
          action: () =>
            this.loadStage(this.stageIndex, { ...this.checkpoint, lives: 3 }),
        },
        { label: this.t("restart"), action: () => this.startRun() },
        { label: this.t("menu"), action: () => this.title() },
      ],
    );
  }

  endGround() {
    this.projectiles = [];
    this.hazards = [];

    if (STAGES[this.stageIndex].giant) {
      this.growthTimer = 0;
      this.growingKind =
        this.stageIndex === 5 ? "titan" : STAGES[this.stageIndex].bosses[0];
      this.setState("growth");
      this.audio.play("transform");
    } else {
      this.stageClear();
    }
  }

  startGiant() {
    this.clearWorld();
    this.giant = true;
    this.stage2BossPhase = 1;
    this.player = new Player(this, this.selected, true);
    let kind =
      this.stageIndex === 5 ? "titan" : STAGES[this.stageIndex].bosses[0];

    this.enemies.push(
      new Enemy(this, kind, 1000, 625, {
        boss: true,
        giant: true,
      }),
    );

    this.setState("play");
    this.toast(this.t("zord") + " — " + this.zordName(), 3);
    this.shake = 18;
    this.flash = 0.3;
  }

  zordName() {
    return this.t(
      this.selected === 4 ? "dragon" : this.selected === 5 ? "tiger" : "mega",
    );
  }

  finisherReady() {
    let boss = this.enemies.find((e) => e.boss && !e.dead);
    return this.giant && boss && boss.hp <= boss.maxHp * 0.151;
  }

  startFinisher() {
    if (!this.finisherReady()) return;
    this.finisherTimer = 0;
    this.finisherHit = false;
    this.projectiles = [];
    this.hazards = [];
    this.player.attack = null;
    this.player.guarding = false;
    this.setState("finisher");
    this.audio.play("transform");
  }

  stageClear() {
    this.player.state = "victory";
    this.clearScore = this.score;
    this.clearBonus =
      1500 +
      (this.stageIndex + 1) * 500 +
      Math.round((this.player.hp / this.player.maxHp) * 1200) +
      (this.stageDeaths === 0 ? 1500 : 0);
    this.score += this.clearBonus;
    this.saveHigh();
    this.setState("clear");
    this.menuIndex = 0;

    this.menu(
      `<div class="eyebrow">${this.t("mission")}</div>
      <h2>${this.t("clear")}</h2>
      <p>${this.name(STAGES[this.stageIndex].name)}</p>
      <div class="results">
        <span>${this.t("score")}</span><span>${this.clearScore.toLocaleString()}</span>
        <span>${this.t("bonus")}</span><span>+${this.clearBonus.toLocaleString()}</span>
        <span>${this.t("total")}</span><span>${this.score.toLocaleString()}</span>
      </div>`,
      [
        {
          label: this.stageIndex === 5 ? this.t("continue") : this.t("next"),
          primary: true,
          action: () =>
            this.stageIndex === 5
              ? this.victory()
              : this.loadStage(this.stageIndex + 1),
        },
        { label: this.t("menu"), action: () => this.title() },
      ],
    );
  }

  victory() {
    this.setState("victory");
    this.menuIndex = 0;
    let minutes = Math.floor(this.runTime / 60);
    let seconds = String(Math.floor(this.runTime % 60)).padStart(2, "0");

    this.menu(
      `<div class="eyebrow">${this.t("thanks")}</div>
      <h2>${this.t("victory")}</h2>
      <p>${this.t("safe")}</p>
      <div class="results">
        <span>${this.t("score")}</span><span>${this.score.toLocaleString()}</span>
        <span>${this.t("enemies")}</span><span>${this.kills}</span>
        <span>${this.t("bosses")}</span><span>${this.bossKills}</span>
        <span>${this.t("highest")}</span><span>${this.bestCombo}</span>
        <span>${this.t("ranger")}</span><span>${this.name(RANGERS[this.selected].name)}</span>
        <span>${this.t("time")}</span><span>${minutes}:${seconds}</span>
      </div>`,
      [
        {
          label: this.t("again"),
          primary: true,
          action: () => this.startRun(),
        },
        { label: this.t("another"), action: () => this.selection() },
        { label: this.t("menu"), action: () => this.title() },
      ],
    );
  }

  constrainPlayer() {
    let p = this.player;

    if (this.giant) {
      p.x = clamp(p.x, 95, 1185);
      p.y = 625;
    } else {
      p.y = clamp(p.y, 432, 655);
      let sm = this.stageManager;
      let left = sm.locked ? sm.left : this.camera;
      p.x = clamp(
        p.x,
        left + 42,
        sm.locked ? sm.left + W - 42 : sm.nextTrigger + 350,
      );
    }
  }

  registerHit() {
    this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
    this.comboTimer = 2.4;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.score += 10 + Math.min(30, this.combo) * 3;
  }

  saveHigh() {
    if (this.score > this.high) {
      this.high = Math.floor(this.score);
      save.set("high", this.high);
    }
  }

  burst(x, y, color, count = 12, strength = 1, dust = false) {
    let room = Math.max(0, 280 - this.particles.length);
    for (let i = 0; i < Math.min(room, count); i++) {
      this.particles.push(new Particle(x, y, color, strength, dust));
    }
  }

  float(value, x, y, color) {
    if (this.floats.length >= 35) this.floats.shift();
    this.floats.push({ value, x, y, color, life: 0.8 });
  }

  toast(value, duration = 2) {
    this.dom.toast.textContent = value;
    this.dom.toast.classList.add("visible");
    this.toastTimer = duration;
  }

  damageBuilding(x) {
    this.damagedBuildings.add(Math.floor(x / 100));
    this.burst(x, 607, "#ffb276", 20, 1.5);
  }

  /* ==========================================================
     UPDATE LOOP
     ========================================================== */

  frame(timestamp) {
    let dt = this.lastFrame
      ? Math.min((timestamp - this.lastFrame) / 1000, 0.034)
      : 0.016;
    this.lastFrame = timestamp;

    if (this.state !== "paused") {
      this.clock += dt;
      this.animationTime += dt;
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.dom.toast.classList.remove("visible");
    }

    if (this.active()) {
      this.runTime += dt;
      let simulationDt = this.slow > 0 ? dt * 0.33 : dt;
      this.slow = Math.max(0, this.slow - dt);
      this.update(simulationDt);
    }

    this.render();
    this.updateHUD();
    this.input.pressed.clear();
    requestAnimationFrame(this.frame);
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 28);
    this.flash = Math.max(0, this.flash - dt);
    this.damageFlash = Math.max(0, this.damageFlash - dt);

    if (this.state === "intro") {
      this.introTimer -= dt;
      if (this.introTimer <= 0) this.setState("play");
      return;
    }

    if (this.state === "growth") {
      this.growthTimer += dt;
      this.shake = this.growthTimer < 3 ? 5 + this.growthTimer * 4 : 9;
      this.updateEffects(dt);
      if (this.growthTimer >= 6.2) this.startGiant();
      return;
    }

    if (this.state === "finisher") {
      this.finisherTimer += dt;

      if (this.finisherTimer >= 1.8 && !this.finisherHit) {
        this.finisherHit = true;
        let boss = this.enemies.find((e) => !e.dead);
        if (boss) {
          boss.hp = 0;
          boss.die();
        }
        this.flash = 0.6;
        this.shake = 34;
        this.audio.play("explosion");

        for (let i = 0; i < 9; i++) {
          this.burst(
            random(100, 1180),
            random(210, 620),
            pick(["#ffd578", "#fff4d9", "#ff7959"]),
            22,
            2,
          );
        }
        for (let i = 0; i < 13; i++) this.damagedBuildings.add(i);
      }

      if (this.finisherHit) {
        this.enemies.forEach((e) => {
          if (e.dead) e.deathTimer -= dt * 0.35;
        });
      }

      this.updateEffects(dt * 0.5);
      if (this.finisherTimer >= 5) this.stageClear();
      return;
    }

    if (this.state !== "play") return;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;

    this.player.update(dt);
    if (this.state !== "play") return;

    this.enemies.forEach((e) => e.update(dt));
    this.projectiles.forEach((p) => p.update(dt));
    this.hazards.forEach((h) => h.update(dt));
    this.items.forEach((i) => i.update(dt));
    this.updateEffects(dt);

    this.enemies = this.enemies.filter((e) => !e.dead || e.deathTimer > 0);
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.hazards = this.hazards.filter((h) => h.life > 0);
    this.items = this.items.filter((i) => !i.dead);
    this.objects = this.objects.filter((o) => !o.dead);

    if (!this.giant && !this.player.dead) this.stageManager.update(dt);
  }

  updateEffects(dt) {
    this.particles.forEach((p) => p.update(dt));
    this.particles = this.particles.filter((p) => p.life > 0);
    this.floats.forEach((f) => {
      f.life -= dt;
      f.y -= 47 * dt;
    });
    this.floats = this.floats.filter((f) => f.life > 0);
  }

  updateHUD() {
    if (!this.player || this.dom.hud.hidden) return;
    let p = this.player;

    this.dom.playerName.textContent = this.giant
      ? this.zordName()
      : this.name(p.config.name);
    this.dom.portrait.style.background = p.config.color;
    this.dom.hpLabel.textContent = this.t("health");
    this.dom.powerLabel.textContent = this.t("power");
    this.dom.hpFill.style.width = clamp((p.hp / p.maxHp) * 100, 0, 100) + "%";
    this.dom.powerFill.style.width = clamp(p.power, 0, 100) + "%";
    this.dom.livesLabel.textContent =
      this.t("lives") +
      " × " +
      this.lives +
      " · " +
      Math.ceil(p.hp) +
      "/" +
      p.maxHp;
    this.dom.scoreLabel.textContent =
      this.t("score") + " " + String(Math.floor(this.score)).padStart(7, "0");
    this.dom.stageLabel.textContent =
      this.t("stage") + " " + (this.stageIndex + 1) + " / 6";

    let bosses = this.enemies.filter((e) => e.boss && !e.dead);
    let ids = bosses.map((e) => e.id).join(",");

    if (this.dom.bossBars.dataset.ids !== ids) {
      this.dom.bossBars.dataset.ids = ids;
      this.dom.bossBars.innerHTML = bosses
        .map(
          (e) => `
        <div class="bossbar" data-boss="${e.id}">
          <strong></strong><div><i></i></div>
        </div>
      `,
        )
        .join("");
    }

    bosses.forEach((e) => {
      let element = this.dom.bossBars.querySelector(`[data-boss="${e.id}"]`);
      if (!element) return;
      element.querySelector("strong").textContent =
        this.name(e.config.name) + " · " + this.t("phase") + " " + e.phase;
      element.querySelector("i").style.width =
        clamp((e.hp / e.maxHp) * 100, 0, 100) + "%";
    });
  }

  /* ==========================================================
     PROCEDURAL BACKGROUNDS
     ========================================================== */

  sky(theme) {
    let palettes = {
      city: ["#173d73", "#80becf", "#f4d6ad"],
      factory: ["#1b2a42", "#617c8b", "#c4a58c"],
      park: ["#554178", "#e9948c", "#ffdcaa"],
      ruins: ["#11172f", "#514863", "#bb7b8e"],
      moon: ["#03091c", "#132c53", "#4b4773"],
      fortress: ["#250820", "#802944", "#e77658"],
    };

    let colors = palettes[theme];
    let gradient = ctx.createLinearGradient(0, 0, 0, 470);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.65, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    if (["moon", "ruins", "fortress"].includes(theme)) {
      for (let i = 0; i < 75; i++) {
        oval(
          ctx,
          (i * 193.7) % W,
          (i * 71.3) % 280,
          i % 3 ? 1 : 1.8,
          1.2,
          `rgba(223,237,255,${0.35 + Math.sin(this.clock + i) * 0.22})`,
        );
      }

      if (theme === "moon") {
        let earth = ctx.createRadialGradient(945, 110, 5, 970, 135, 78);
        earth.addColorStop(0, "#b9f9ed");
        earth.addColorStop(0.55, "#4288c7");
        earth.addColorStop(1, "#142e60");
        oval(ctx, 970, 135, 78, 78, earth);
        poly(
          ctx,
          [
            [939, 79],
            [971, 91],
            [962, 120],
            [982, 146],
            [951, 163],
            [936, 126],
          ],
          "#7ac49f",
        );
        line(ctx, 924, 108, 999, 114, "#ffffff66", 8);
      } else {
        oval(ctx, 1030, 115, 52, 52, "#e5dfe599");
        oval(ctx, 1045, 102, 49, 49, colors[1]);
      }
    } else {
      oval(ctx, theme === "park" ? 860 : 1050, 193, 66, 66, "#ffe7bcbb");
    }

    for (let i = 0; i < 8; i++) {
      let x = i * 240 - ((this.camera * 0.07) % 240);
      poly(
        ctx,
        [
          [x - 100, 385],
          [x + 75, 245 + (i % 3) * 27],
          [x + 265, 385],
        ],
        theme === "park" ? "#826f91" : "#3c526e77",
      );
    }

    if (
      ["ruins", "fortress"].includes(theme) &&
      Math.sin(this.clock * 2.3) > 0.993
    ) {
      bolt(ctx, 390, 0, 505, 320, "#d6beff", 5);
      ctx.fillStyle = "#ffffff12";
      ctx.fillRect(0, 0, W, H);
    }
  }

  background(forceTheme = null, giant = this.giant) {
    if (this.stageIndex === 0 && forceTheme === null && !giant) {
      let maxCamera = 4 * 930;
      let ratio = Math.max(0, Math.min(1, this.camera / maxCamera));
      let drawX = ratio * (stage1Background.naturalWidth - W);
      ctx.drawImage(stage1Background, Math.floor(drawX), 0, W, H, 0, 0, W, H);
      return;
    }

    if (this.stageIndex === 1 && forceTheme === null && !giant) {
      let maxCamera = 4 * 930;
      let ratio = Math.max(0, Math.min(1, this.camera / maxCamera));
      let drawX = ratio * (stage2Background.naturalWidth - W);
      ctx.drawImage(stage2Background, Math.floor(drawX), 0, W, H, 0, 0, W, H);
      return;
    }

    if (this.stageIndex === 2 && forceTheme === null && !giant) {
      let maxCamera = 4 * 930;
      let ratio = Math.max(0, Math.min(1, this.camera / maxCamera));
      let drawX = ratio * (stage3Background.naturalWidth - W);
      ctx.drawImage(stage3Background, Math.floor(drawX), 0, W, H, 0, 0, W, H);
      return;
    }

    if (this.stageIndex === 3 && forceTheme === null && !giant) {
      let boss = this.enemies.find((e) => e.boss && !e.mini);
      if (boss) this.stage4BossEncountered = true;

      if (this.stage4BossEncountered) {
        if (boss) {
          let ratio = boss.hp / boss.maxHp;
          if (ratio <= 0.75 && ratio > 0.5 && this.stage4BossPhase < 2) {
            this.stage4BossPhase = 2;
          } else if (ratio <= 0.5 && ratio > 0.25 && this.stage4BossPhase < 3) {
            this.stage4BossPhase = 3;
          } else if (ratio <= 0.25 && this.stage4BossPhase < 4) {
            this.stage4BossPhase = 4;
          }
        }

        let bossBg = stage4Boss1;
        if (this.stage4BossPhase === 2) bossBg = stage4Boss2;
        if (this.stage4BossPhase === 3) bossBg = stage4Boss3;
        if (this.stage4BossPhase === 4) bossBg = stage4Boss4;

        ctx.drawImage(bossBg, 0, 0, W, H);
      } else {
        let maxCamera = 4 * 930;
        let ratio = Math.max(0, Math.min(1, this.camera / maxCamera));
        let drawX = ratio * (stage4Background.naturalWidth - W);
        ctx.drawImage(stage4Background, Math.floor(drawX), 0, W, H, 0, 0, W, H);
      }
      return;
    }


    let theme = forceTheme || STAGES[this.stageIndex].theme;
    if (theme === "ruins" && this.camera < 1050 && !giant) theme = "city";
    this.sky(theme);

    if (giant) {
      if (this.stageIndex === 1) {
        let boss = this.enemies.find((e) => e.boss);
        if (boss) {
          let ratio = boss.hp / boss.maxHp;
          if (ratio <= 0.75 && ratio > 0.5 && this.stage2BossPhase < 2) {
            this.stage2BossPhase = 2;
          } else if (ratio <= 0.5 && ratio > 0.25 && this.stage2BossPhase < 3) {
            this.stage2BossPhase = 3;
          } else if (ratio <= 0.25 && this.stage2BossPhase < 4) {
            this.stage2BossPhase = 4;
          }
        }
        let bossBg = stage2Boss1;
        if (this.stage2BossPhase === 2) bossBg = stage2Boss2;
        if (this.stage2BossPhase === 3) bossBg = stage2Boss3;
        if (this.stage2BossPhase === 4) bossBg = stage2Boss4;
        
        ctx.drawImage(bossBg, 0, 0, W, H);
        return;
      }

      this.giantCity(theme);
      return;
    }

    let parallax = this.camera * 0.38;
    for (let i = -1; i < 10; i++) {
      let cell = Math.floor(parallax / 180) + i;
      let x = i * 180 - (parallax % 180);
      let height = 90 + ((cell * 37 + 9000) % 110);
      ctx.fillStyle =
        theme === "moon"
          ? "#293660"
          : theme === "fortress"
            ? "#3c2038"
            : "#3b4a64";
      ctx.fillRect(x, 384 - height, 140, height);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          ctx.fillStyle = (row + col + cell) % 3 ? "#86bdd333" : "#f1cc9666";
          ctx.fillRect(x + 12 + col * 24, 397 - height + row * 23, 10, 12);
        }
      }
    }

    ctx.save();
    ctx.translate(-this.camera, 0);
    let start = Math.floor(this.camera / 370) - 1;

    for (let i = start; i < start + 6; i++) {
      let x = i * 370;
      let variant = ((i % 3) + 3) % 3;

      if (theme === "city") {
        ctx.fillStyle = ["#81718b", "#6e9398", "#a08075"][variant];
        ctx.fillRect(x, 242, 340, 179);
        ctx.fillStyle = "#2c405b";
        ctx.fillRect(x + 20, 303, 131, 113);
        ctx.fillRect(x + 173, 303, 145, 113);
        ctx.fillStyle = "#88cad955";
        ctx.fillRect(x + 27, 312, 115, 65);
        ctx.fillRect(x + 182, 312, 127, 65);

        for (let n = 0; n < 9; n++) {
          ctx.fillStyle = n % 2 ? "#efddbc" : "#b86174";
          ctx.fillRect(x + n * 37, 288, 37, 16);
        }

        let signs = this.lang
          ? ["天使丛林市", "果汁吧", "游戏厅"]
          : ["ANGEL GROVE", "JUICE BAR", "ARCADE"];
        text(ctx, signs[variant], x + 166, 267, 19, "#ffe9b6");

        let car = x + 145;
        poly(
          ctx,
          [
            [car - 63, 411],
            [car - 47, 386],
            [car + 14, 382],
            [car + 36, 400],
            [car + 74, 406],
            [car + 73, 431],
            [car - 63, 431],
          ],
          ["#926d8b", "#b98468", "#60899b"][variant],
          "#29374d",
        );
        poly(
          ctx,
          [
            [car - 36, 390],
            [car + 8, 389],
            [car + 24, 401],
            [car - 42, 403],
          ],
          "#afdce2",
        );
        oval(ctx, car - 37, 430, 12, 12, "#202a3b");
        oval(ctx, car + 46, 430, 12, 12, "#202a3b");

        let civilian = x + ((this.clock * 78 + (i + 50) * 83) % 330);
        let stride = Math.sin(this.clock * 13 + i) * 8;
        oval(ctx, civilian, 356, 7, 8, "#e7bb96");
        line(ctx, civilian, 366, civilian, 389, "#eed096", 11);
        line(ctx, civilian, 389, civilian - 9 + stride, 415, "#2a4158", 5);
        line(ctx, civilian, 389, civilian + 9 - stride, 415, "#2a4158", 5);
      } else if (theme === "factory") {
        ctx.fillStyle = "#5a6978";
        ctx.fillRect(x, 216, 340, 205);
        poly(
          ctx,
          [
            [x - 10, 216],
            [x + 95, 171],
            [x + 340, 171],
            [x + 350, 216],
          ],
          "#3c485b",
        );
        ctx.fillStyle = "#2c4259";
        ctx.fillRect(x + 28, 276, 121, 145);
        ctx.fillStyle = variant % 2 ? "#9a6a5e" : "#56888c";
        ctx.fillRect(x + 165, 319, 182, 101);

        for (let n = 0; n < 10; n++) {
          line(
            ctx,
            x + 175 + n * 17,
            324,
            x + 175 + n * 17,
            415,
            "#ffffff20",
            3,
          );
        }

        line(ctx, x + 38, 244, x + 307, 244, "#b4c1c5", 13);
        line(ctx, x + 307, 244, x + 307, 311, "#b4c1c5", 13);

        for (let n = 0; n < 5; n++) {
          let rise = (this.clock * 33 + n * 19) % 96;
          oval(
            ctx,
            x + 305 + Math.sin(rise * 0.05) * 9,
            309 - rise,
            11 + rise * 0.13,
            9 + rise * 0.15,
            "#d8e6eb22",
          );
        }

        if (variant === 0) bolt(ctx, x + 76, 331, x + 96, 371, "#ffe295", 2);
      } else if (theme === "park") {
        ctx.fillStyle = "#72a5b3";
        ctx.fillRect(x, 347, 370, 76);

        for (let n = 0; n < 7; n++) {
          let y = 376 + Math.sin(this.clock + n) * 8;
          line(ctx, x + n * 58, y, x + n * 58 + 31, y, "#f5e6cc66", 2);
        }

        line(ctx, x + 61, 252, x + 65, 420, "#725e4c", 22);
        oval(ctx, x + 62, 266, 78, 86, "#3e6968");
        oval(ctx, x + 22, 288, 47, 52, "#517f72");
        oval(ctx, x + 95, 245, 55, 63, "#638676");

        line(ctx, x + 170, 389, x + 329, 389, "#d4ae85", 9);
        line(ctx, x + 179, 367, x + 320, 367, "#ddb991", 8);
        line(ctx, x + 183, 367, x + 183, 420, "#806047", 7);
        line(ctx, x + 311, 367, x + 311, 420, "#806047", 7);

        if (variant === 1) {
          poly(
            ctx,
            [
              [x + 123, 340],
              [x + 196, 315],
              [x + 335, 340],
              [x + 335, 352],
              [x + 123, 352],
            ],
            "#b18e77",
          );
          line(ctx, x + 136, 328, x + 325, 328, "#e7c4a3", 6);
        }
      } else if (theme === "moon") {
        poly(
          ctx,
          [
            [x, 423],
            [x, 223],
            [x + 36, 199],
            [x + 76, 223],
            [x + 76, 423],
          ],
          "#55517f",
          "#9c8fbd",
        );
        poly(
          ctx,
          [
            [x + 260, 423],
            [x + 260, 216],
            [x + 299, 192],
            [x + 338, 216],
            [x + 338, 423],
          ],
          "#55517f",
          "#9c8fbd",
        );

        ctx.strokeStyle = "#8980b4";
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.arc(x + 168, 252, 111, Math.PI, TAU);
        ctx.stroke();

        poly(
          ctx,
          [
            [x + 156, 297],
            [x + 183, 350],
            [x + 159, 419],
            [x + 134, 350],
          ],
          "#ac8ef5",
          "#ded0ff",
        );
        oval(ctx, x + 160, 418, 49, 9, "#b392ff44");
        ctx.fillStyle = "#303754";
        ctx.fillRect(x + 200, 372, 52, 48);
        line(ctx, x + 206, 386, x + 245, 386, "#81f0dc", 4);
      } else {
        let red = theme === "fortress";
        poly(
          ctx,
          [
            [x, 423],
            [x, 201],
            [x + 49, 180],
            [x + 83, 220],
            [x + 117, 188],
            [x + 158, 249],
            [x + 205, 204],
            [x + 331, 237],
            [x + 331, 423],
          ],
          red ? "#4d293f" : "#484457",
          "#756677",
        );
        ctx.fillStyle = "#11172c";
        ctx.fillRect(x + 42, 267, 75, 141);
        ctx.fillRect(x + 219, 297, 62, 111);
        line(ctx, x + 170, 222, x + 164, 420, red ? "#b26784" : "#8b869b", 13);

        if (red) {
          oval(ctx, x + 166, 309, 36, 48, "#ff658a33");
          oval(ctx, x + 166, 309, 15, 34, "#ff6e8b");
          bolt(ctx, x + 166, 270, x + 166, 350, "#ffd2ee", 3);
        }

        for (let n = 0; n < 4; n++) {
          let fx = x + 51 + n * 68;
          let flame = 25 + Math.sin(this.clock * 12 + i + n * 2) * 13;
          poly(
            ctx,
            [
              [fx - 12, 423],
              [fx - 4, 396],
              [fx + 2, 423 - flame],
              [fx + 10, 404],
              [fx + 16, 423],
            ],
            "#f29a58",
          );
          oval(ctx, fx + 2, 420, 18, 7, "#ffd77944");
        }
      }
    }
    ctx.restore();

    let floor = ctx.createLinearGradient(0, 424, 0, H);
    floor.addColorStop(
      0,
      theme === "park" ? "#7f9080" : theme === "moon" ? "#726b88" : "#616170",
    );
    floor.addColorStop(
      1,
      theme === "park"
        ? "#4a595c"
        : theme === "fortress"
          ? "#3a273c"
          : "#30394a",
    );
    ctx.fillStyle = floor;
    ctx.fillRect(0, 424, W, H - 424);
    line(ctx, 0, 428, W, 428, "#e2d3bd55", 6);

    for (let i = 0; i < 12; i++) {
      let x = i * 150 - (this.camera % 150);
      line(ctx, x, 434, x - 125, H, "#ffffff0d", 2);
      if (["city", "ruins"].includes(theme)) {
        ctx.fillStyle = "#e3d8aa55";
        ctx.fillRect(x, 575, 78, 7);
      }
    }

    for (let y = 469; y < H; y += 69) line(ctx, 0, y, W, y, "#111a2925", 2);

    for (let i = 0; i < 18; i++) {
      oval(
        ctx,
        i * 107 - (this.camera % 107),
        458 + ((i * 47) % 230),
        3 + (i % 4),
        2,
        "#d5d0bd25",
      );
    }
  }

  giantCity(theme) {
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 16; i++) {
        let x = i * 93 - 35;
        let height = 52 + ((i * 47 + layer * 31) % 150);
        let damaged = this.damagedBuildings.has(Math.floor((x + 40) / 100));
        if (damaged) height *= 0.35;
        let base = layer ? 633 : 574;
        ctx.fillStyle = layer ? "#30384e" : "#575169";
        ctx.fillRect(x, base - height, 73, height);

        if (damaged) {
          poly(
            ctx,
            [
              [x, base - height],
              [x + 18, base - height - 14],
              [x + 40, base - height + 7],
              [x + 57, base - height - 9],
              [x + 73, base - height],
            ],
            "#3b374e",
          );
        }

        for (let row = 0; row < Math.floor(height / 20); row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = damaged ? "#ffa67488" : "#ffe1a566";
            ctx.fillRect(
              x + 12 + col * 18,
              base - height + 10 + row * 20,
              7,
              8,
            );
          }
        }

        if (damaged) {
          let flicker = 15 + Math.sin(this.clock * 11 + i) * 10;
          poly(
            ctx,
            [
              [x + 21, base],
              [x + 28, base - 38 - flicker],
              [x + 36, base - 16],
              [x + 49, base - 46],
              [x + 56, base],
            ],
            "#ffad62",
          );

          for (let s = 0; s < 3; s++) {
            let rise = (this.clock * 27 + s * 33 + i * 10) % 100;
            oval(
              ctx,
              x + 35 + rise * 0.2,
              base - 41 - rise,
              14 + rise * 0.18,
              15 + rise * 0.2,
              "#252a3c66",
            );
          }
        }
      }
    }

    ctx.fillStyle = theme === "fortress" ? "#2c2135" : "#2d3648";
    ctx.fillRect(0, 632, W, 88);
    line(ctx, 0, 637, W, 637, "#f3d0a655", 4);

    for (let i = 0; i < 30; i++) {
      poly(
        ctx,
        [
          [i * 46, 667],
          [i * 46 + 14, 653 + (i % 4) * 7],
          [i * 46 + 32, 676],
        ],
        "#555366",
      );
    }
  }

  titleBackground() {
    // Draw new static title-screen background
    if (gameBackground.complete && gameBackground.naturalWidth > 0) {
      ctx.drawImage(gameBackground, 0, 0, W, H);
    } else {
      // Fallback while image loads
      ctx.fillStyle = "#060d20";
      ctx.fillRect(0, 0, W, H);
    }

    // Keep the six Rangers as a Canvas overlay
    RANGERS.forEach((r, i) => {
      drawFighter(
        ctx,
        {
          ranger: i,
          x: 105 + i * 212,
          y: 716,
          scale: 1.35,
          dir: i < 3 ? 1 : -1,
          state: "idle",
          inv: 0,
          stun: 0,
        },
        this.clock,
      );
    });

    // Optional existing lightning effect
    if (Math.sin(this.clock * 1.7) > 0.975) {
      bolt(ctx, 130, 0, 350, 600, "#7c9cff66", 3);
      bolt(ctx, 1180, 0, 970, 590, "#d6b2ff66", 3);
    }
  }

  /* ==========================================================
     RENDERING / CINEMATICS
     ========================================================== */

  render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (["title", "select", "help"].includes(this.state)) {
      this.titleBackground();
      return;
    }

    if (this.state === "victory") {
      let camera = this.camera;
      this.camera = 0;
      this.background("city", false);
      this.camera = camera;

      drawFighter(
        ctx,
        {
          ranger: this.selected,
          x: 115,
          y: 650,
          scale: 1.6,
          dir: 1,
          state: "victory",
          inv: 0,
          stun: 0,
          attack: { elapsed: 0.02, duration: 1 },
        },
        this.clock,
      );
      return;
    }

    let displayState =
      this.state === "paused" ? this.previousState : this.state;
    ctx.save();

    if (this.shake > 0 && this.state !== "paused") {
      ctx.translate(
        random(-this.shake, this.shake),
        random(-this.shake, this.shake) * 0.5,
      );
    }

    this.background();

    if (displayState === "growth") {
      this.drawGrowth();
    } else {
      ctx.save();
      ctx.translate(-this.camera, 0);
      this.hazards.forEach((h) => h.draw(ctx));

      let actors = [...this.objects, ...this.items, ...this.enemies];
      if (this.player) actors.push(this.player);
      actors.sort((a, b) => a.y - b.y);

      actors.forEach((actor) => {
        if (actor.x > this.camera - 400 && actor.x < this.camera + W + 400) {
          actor.draw(ctx);
        }
      });

      this.projectiles.forEach((p) => p.draw(ctx));
      this.particles.forEach((p) => p.draw(ctx));
      this.floats.forEach((f) => {
        ctx.globalAlpha = clamp(f.life / 0.3, 0, 1);
        text(ctx, f.value, f.x, f.y, 21, f.color);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    ctx.restore();

    if (displayState === "intro") this.drawIntro();
    if (displayState === "finisher") this.drawFinisher();

    if (this.state === "play") {
      if (this.combo >= 2 && this.comboTimer > 0) {
        text(
          ctx,
          this.combo + " " + this.t("hit"),
          115,
          201,
          Math.min(48, 29 + this.combo),
          "#ffe69c",
        );
      }

      if (!this.giant && !this.player.dead) {
        if (this.stageManager.locked) {
          text(ctx, this.t("fight"), 640, 689, 17, "#e6dec8");
        } else if (!this.stageManager.finished) {
          text(
            ctx,
            this.t("go") + " ▶",
            1140 + Math.sin(this.clock * 7) * 9,
            385,
            32,
            "#ffe598",
          );
        }
      }

      if (this.finisherReady()) {
        ctx.fillStyle = "#0c142bda";
        ctx.fillRect(310, 146, 660, 50);
        text(
          ctx,
          this.t("finish"),
          640,
          171,
          29,
          Math.sin(this.clock * 8) > 0 ? "#fff" : "#ffe58d",
        );
      }
    }

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(240,252,255,${Math.min(0.85, this.flash * 2)})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (this.damageFlash > 0) {
      ctx.strokeStyle = `rgba(255,64,100,${this.damageFlash * 3})`;
      ctx.lineWidth = 30;
      ctx.strokeRect(0, 0, W, H);
    }

    let vignette = ctx.createRadialGradient(640, 350, 260, 640, 350, 780);
    vignette.addColorStop(0, "#0000");
    vignette.addColorStop(1, "#02081766");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  drawIntro() {
    ctx.fillStyle = "#070f25b3";
    ctx.fillRect(0, 200, W, 262);
    line(ctx, 260, 203, 1020, 203, "#ffe09a", 3);
    line(ctx, 260, 459, 1020, 459, "#ffe09a", 3);
    text(
      ctx,
      this.t("stage") + " " + (this.stageIndex + 1),
      640,
      266,
      34,
      "#ffe099",
    );
    text(
      ctx,
      this.name(STAGES[this.stageIndex].name),
      640,
      339,
      this.lang ? 43 : 38,
      "#fff",
    );
    text(
      ctx,
      this.stageIndex === 5 ? this.t("final") : this.t("deploy"),
      640,
      405,
      22,
      "#a6e8ff",
    );
  }

  drawGrowth() {
    let t = this.growthTimer;
    let f = clamp(t / 3.7, 0, 1);
    let config = BOSSES[this.growingKind];

    ctx.fillStyle = `rgba(10,7,31,${0.18 + f * 0.4})`;
    ctx.fillRect(0, 0, W, H);

    if (f > 0.3) {
      ctx.save();
      ctx.globalAlpha = clamp((f - 0.3) / 0.7, 0, 1);
      if (this.stageIndex === 1) {
        ctx.drawImage(stage2Boss1, 0, 0, W, H);
      } else {
        this.sky(STAGES[this.stageIndex].theme);
        this.giantCity(STAGES[this.stageIndex].theme);
      }
      ctx.restore();
    }

    let growingScale =
      this.growingKind === "titan"
        ? lerp(1.2, 3.55, f)
        : lerp(config.scale, 3.2, f);

    oval(ctx, 870, 606, 80 + f * 145, 30 + f * 22, "#ce8aff44");
    drawFighter(
      ctx,
      {
        kind: this.growingKind,
        config,
        x: 870,
        y: lerp(580, 625, f),
        scale: growingScale,
        dir: -1,
        state: "idle",
        inv: 0,
        stun: 0,
      },
      this.clock,
    );

    if (t < 4.3) {
      bolt(ctx, 755, -30, 870, 310, "#e6b1ff", 9);
      bolt(ctx, 965, -30, 870, 340, "#fff", 3);
      text(ctx, this.t("warning"), 410, 269, 54, "#ffcd94");
      text(ctx, this.t("growing"), 410, 339, 34, "#fff");
    } else {
      let summon = clamp((t - 4.3) / 1.9, 0, 1);
      ctx.save();
      ctx.globalAlpha = summon;
      drawZord(
        ctx,
        {
          ranger: this.selected,
          x: 285,
          y: 625,
          scale: 3.03,
          dir: 1,
          inv: 0,
          z: (1 - summon) * 320,
        },
        this.clock,
      );
      ctx.restore();
      text(ctx, this.t("summon"), 640, 195, 47, "#c0f5ff");
      text(ctx, this.zordName(), 640, 252, 28, "#ffe6a5");
    }
  }

  drawFinisher() {
    let t = this.finisherTimer;
    let key =
      this.selected === 4
        ? "dragonFinish"
        : this.selected === 5
          ? "tigerFinish"
          : "megaFinish";

    ctx.fillStyle = "#030919";
    ctx.fillRect(0, 0, W, 110);
    ctx.fillRect(0, 637, W, 83);

    if (t < 1.8) {
      ctx.fillStyle = "#16326377";
      ctx.fillRect(0, 110, W, 527);

      for (let i = 0; i < 24; i++) {
        let y = 132 + i * 22;
        let x = ((this.clock * 1600 + i * 137) % 1700) - 300;
        line(ctx, x, y, x + 240, y, "#b5eaff55", 2);
      }

      text(ctx, this.t(key), 640, 80, 36, "#fff0b6");
      drawZord(
        ctx,
        {
          ...this.player,
          x: 335,
          y: 640,
          scale: 3.55,
          attack: { elapsed: 0.04, duration: 1 },
          inv: 0,
        },
        this.clock,
      );
    } else if (t < 3.3) {
      let f = clamp((t - 1.8) / 1.5, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - f;

      if (this.selected === 4) {
        line(ctx, 240, 380, 1120, 380, "#84ffd0", 130);
        line(ctx, 240, 380, 1120, 380, "#fff", 45);
      } else {
        line(ctx, 190, 610, 1110, 140, "#c4faff", 100);
        line(ctx, 190, 610, 1110, 140, "#fff", 35);
      }

      ctx.restore();
      text(ctx, this.t(key), 640, 79, 32, "#ffe8ad");
    } else {
      text(ctx, this.t("mission"), 640, 329, 55, "#ffe49b");
      text(ctx, this.t("clear"), 640, 396, 29, "#fff");
    }
  }
}

/* Exactly one game instance and one requestAnimationFrame loop. */
let game = new Game();

// Orientation warning logic
document.addEventListener("DOMContentLoaded", () => {
  const warning = document.getElementById("orientation-warning");

  if (warning) {
    warning.removeAttribute("hidden");
  }

  let orientationPaused = false;
  const portraitQuery = window.matchMedia(
    "(pointer: coarse) and (orientation: portrait)",
  );

  portraitQuery.addEventListener("change", (e) => {
    if (e.matches) {
      if (game.active() && game.state !== "paused") {
        game.pause();
        orientationPaused = true;
      }
    } else {
      if (orientationPaused) {
        if (game.state === "paused") {
          game.setState(game.previousState);
        }
        orientationPaused = false;
      }
    }
  });

  // Handle initial orientation
  if (portraitQuery.matches && game.active() && game.state !== "paused") {
    game.pause();
    orientationPaused = true;
  }
});
