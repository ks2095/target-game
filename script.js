const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerCountInput = document.getElementById('player-count');
const rotationSpeedInput = document.getElementById('rotation-speed');
const nameInputsContainer = document.getElementById('name-inputs');
const resultOverlay = document.getElementById('result-overlay');
const resultStatus = document.getElementById('result-status');
const resultShooter = document.getElementById('result-shooter');
const uiLayer = document.getElementById('ui-layer');
const fireBtn = document.getElementById('fire-btn'); // New Fire Button
const retryBtn = document.getElementById('retry-btn');
const ratioToggleBtn = document.getElementById('ratio-toggle-btn');
const arrowSpeedMultiplierInput = document.getElementById('arrow-speed-multiplier');
const winLabel = document.querySelector('.win-label');
const betPlayerInputsContainer = document.getElementById('bet-player-inputs');

const soundTension = document.getElementById('sound-tension');
const soundAward = document.getElementById('sound-award');
const soundPull = document.getElementById('sound-pull');
const soundShoot = document.getElementById('sound-shoot');
const soundHit = document.getElementById('sound-hit');
if (soundHit) soundHit.volume = 0.65;
const soundFlight = document.getElementById('sound-flight');
const soundFall = document.getElementById('sound-fall');
const soundShuffle = document.getElementById('sound-shuffle');
const modeToggle = document.getElementById('mode-toggle');
const distToggle = document.getElementById('dist-toggle'); // New toggle
const playerCountLabel = document.getElementById('player-count-label');
const betCountInput = document.getElementById('bet-count');
const betCountGroup = document.getElementById('bet-count-group');
const countDisplay = document.getElementById('count-display');
const diffArrowGroup = document.getElementById('diff-arrow-group');
const diffArrowSpeedInput = document.getElementById('diff-arrow-speed');
let flightSoundTimer = null;
let hasShuffled = false; // Track if shooters have been shuffled
let isSelectingBoostItem = false; // For 1st player's special privilege
let boostedItemIndex = -1; // Index of the item expanded by 1.5x
const customAlert = document.getElementById('custom-alert');
const alertMessage = document.getElementById('alert-message');
const alertOkBtn = document.getElementById('alert-ok-btn');
const alertCancelBtn = document.getElementById('alert-cancel-btn');
let activeOptionSelection = 0; // 0: None, 1: Expand Area, 2: Shrink Area...
let currentBoostFactor = 1.5;
let rampTimer = null;

function showAlert(message, callback, showCancel = false, cancelCallback = null) {
    alertMessage.innerHTML = message;
    customAlert.classList.remove('hidden');

    if (showCancel) {
        alertCancelBtn.classList.remove('hidden');
    } else {
        alertCancelBtn.classList.add('hidden');
    }

    const closeHandler = () => {
        customAlert.classList.add('hidden');
        alertOkBtn.removeEventListener('click', closeHandler);
        alertCancelBtn.removeEventListener('click', cancelHandler);
        if (callback) callback();
    };

    const cancelHandler = () => {
        customAlert.classList.add('hidden');
        alertOkBtn.removeEventListener('click', closeHandler);
        alertCancelBtn.removeEventListener('click', cancelHandler);
        if (cancelCallback) cancelCallback();
    };

    alertOkBtn.addEventListener('click', closeHandler);
    alertCancelBtn.addEventListener('click', cancelHandler);
}

function showConfirm(message, onConfirm, onCancel) {
    showAlert(message, onConfirm, true, onCancel);
}

const colors = ['#00ff88', '#00ccff', '#ff3e3e', '#ffcc00', '#ff00ff', '#ffffff'];

const SEGMENT_RATIO_SETS_3 = [
    [45, 33, 22],
    [44, 34, 22], [44, 33, 23], [44, 32, 24],
    [43, 34, 23], [43, 33, 24], [43, 32, 25],
    [42, 35, 23], [42, 34, 24], [42, 33, 25],
    [41, 34, 25], [41, 33, 26]
];

const SEGMENT_RATIO_SETS = [
    [41, 30, 20, 9], [41, 30, 19, 10],
    [40, 31, 20, 9], [40, 30, 20, 10], [40, 30, 19, 11], [40, 29, 21, 10], [40, 29, 20, 11], [40, 29, 19, 12],
    [39, 31, 20, 10], [39, 30, 21, 10], [39, 30, 20, 11], [39, 30, 19, 12], [39, 29, 21, 11], [39, 29, 20, 12], [39, 29, 19, 13], [39, 28, 22, 11], [39, 28, 21, 12], [39, 28, 20, 13], [39, 28, 19, 14],
    [38, 31, 21, 10], [38, 31, 20, 11], [38, 31, 19, 12], [38, 30, 22, 10], [38, 30, 21, 11], [38, 30, 20, 12], [38, 30, 19, 13], [38, 29, 22, 11], [38, 29, 21, 12], [38, 29, 20, 13], [38, 29, 19, 14], [38, 28, 22, 12], [38, 28, 21, 13], [38, 28, 20, 14], [38, 28, 19, 15],
    [37, 31, 21, 11], [37, 31, 20, 12], [37, 30, 22, 11], [37, 30, 21, 12], [37, 30, 20, 13], [37, 29, 23, 11], [37, 29, 22, 12], [37, 29, 21, 13], [37, 28, 23, 12], [37, 28, 22, 13], [37, 28, 21, 14],
    [36, 30, 22, 12], [36, 30, 21, 13], [36, 30, 20, 14], [36, 29, 23, 12], [36, 29, 22, 13], [36, 28, 22, 14],
    [35, 29, 23, 13], [35, 29, 22, 14], [35, 29, 21, 15], [35, 28, 22, 15],
    [34, 28, 22, 16]
];

const SEGMENT_RATIO_SETS_5 = [
    [38, 29, 20, 11, 2],
    [37, 29, 20, 11, 3], [37, 28, 20, 12, 3], [37, 28, 20, 11, 4], [37, 28, 19, 12, 4], [37, 28, 19, 11, 5],
    [36, 29, 20, 12, 3], [36, 29, 20, 11, 4], [36, 28, 21, 12, 3], [36, 28, 20, 12, 4], [36, 28, 20, 11, 5], [36, 28, 19, 13, 4], [36, 28, 19, 12, 5], [36, 28, 19, 11, 6], [36, 27, 21, 13, 3], [36, 27, 21, 12, 4], [36, 27, 20, 13, 4], [36, 27, 20, 12, 5], [36, 27, 20, 11, 6], [36, 27, 19, 14, 4], [36, 27, 19, 13, 5], [36, 27, 19, 12, 6], [36, 27, 19, 11, 7], [36, 27, 18, 14, 5], [36, 27, 18, 13, 6], [36, 27, 18, 12, 7], [36, 27, 18, 11, 8], [36, 26, 21, 14, 3], [36, 26, 21, 13, 4], [36, 26, 21, 12, 5], [36, 26, 20, 14, 4], [36, 26, 20, 13, 5], [36, 26, 20, 12, 6], [36, 26, 20, 11, 7], [36, 26, 19, 15, 4], [36, 26, 19, 14, 5], [36, 26, 19, 13, 6], [36, 26, 19, 12, 7], [36, 26, 19, 11, 8], [36, 26, 18, 15, 6], [36, 26, 18, 14, 6], [36, 26, 18, 13, 7], [36, 26, 18, 12, 8], [36, 26, 18, 11, 9], [36, 26, 17, 15, 6], [36, 26, 17, 14, 7], [36, 26, 17, 13, 8], [36, 26, 17, 12, 9], [36, 26, 17, 11, 10],
    [35, 29, 21, 12, 3], [35, 29, 20, 12, 4], [35, 29, 20, 11, 5], [35, 28, 21, 13, 3], [35, 28, 21, 12, 4], [35, 28, 20, 13, 4], [35, 28, 20, 12, 5], [35, 28, 20, 11, 6], [35, 28, 19, 13, 5], [35, 28, 19, 12, 6], [35, 28, 19, 11, 7], [35, 27, 22, 13, 3], [35, 27, 21, 13, 4], [35, 27, 21, 12, 5], [35, 27, 20, 14, 4], [35, 27, 20, 13, 5], [35, 27, 20, 12, 6], [35, 27, 19, 14, 5], [35, 27, 19, 13, 6], [35, 27, 19, 12, 7], [35, 26, 22, 14, 3], [35, 26, 21, 14, 4], [35, 26, 21, 13, 5], [35, 26, 20, 15, 4], [35, 26, 20, 14, 5], [35, 26, 20, 13, 6], [35, 26, 19, 15, 5], [35, 26, 19, 14, 6], [35, 26, 19, 13, 7], [35, 26, 18, 15, 6], [35, 26, 18, 14, 7], [35, 26, 18, 13, 8], [35, 25, 22, 15, 3], [35, 25, 21, 15, 4], [35, 25, 21, 14, 5], [35, 25, 20, 16, 4], [35, 25, 20, 15, 5], [35, 25, 20, 14, 6], [35, 25, 19, 16, 5], [35, 25, 19, 15, 6], [35, 25, 19, 14, 7], [35, 25, 18, 16, 6], [35, 25, 18, 15, 7], [35, 25, 18, 14, 8], [35, 25, 17, 16, 7], [35, 25, 17, 15, 8], [35, 25, 17, 14, 9],
    [34, 29, 21, 13, 3], [34, 29, 21, 12, 4], [34, 29, 20, 13, 4], [34, 29, 20, 12, 5], [34, 29, 20, 11, 6], [34, 29, 19, 13, 5], [34, 29, 19, 12, 6], [34, 29, 19, 11, 7], [34, 28, 22, 13, 3], [34, 28, 21, 13, 4], [34, 28, 21, 12, 5], [34, 28, 20, 14, 4], [34, 28, 20, 13, 5], [34, 28, 20, 12, 6], [34, 28, 19, 14, 5], [34, 28, 19, 13, 6], [34, 28, 19, 12, 7], [34, 27, 22, 14, 3], [34, 27, 21, 14, 4], [34, 27, 21, 13, 5], [34, 27, 20, 15, 4], [34, 27, 20, 14, 5], [34, 27, 20, 13, 6], [34, 27, 19, 15, 5], [34, 27, 19, 14, 6], [34, 27, 19, 13, 7], [34, 26, 22, 15, 3], [34, 26, 21, 15, 4], [34, 26, 21, 14, 5], [34, 26, 20, 16, 4], [34, 26, 20, 15, 5], [34, 26, 20, 14, 6], [34, 26, 19, 16, 5], [34, 26, 19, 15, 6], [34, 26, 19, 14, 7], [34, 25, 21, 16, 4], [34, 25, 21, 15, 5], [34, 25, 20, 16, 5], [34, 25, 20, 15, 6], [34, 25, 20, 14, 7], [34, 25, 19, 16, 6], [34, 25, 19, 15, 7], [34, 25, 19, 14, 8], [34, 25, 18, 16, 7], [34, 25, 18, 15, 8], [34, 25, 18, 14, 9], [34, 24, 20, 17, 5], [34, 24, 20, 16, 6], [34, 24, 19, 17, 6], [34, 24, 19, 16, 7], [34, 24, 18, 17, 7], [34, 24, 18, 16, 8], [34, 24, 17, 17, 8], [34, 24, 17, 16, 9],
    [33, 28, 22, 14, 3], [33, 28, 21, 14, 4], [33, 28, 21, 13, 5], [33, 28, 20, 14, 5], [33, 28, 20, 13, 6], [33, 27, 22, 15, 3], [33, 27, 21, 15, 4], [33, 27, 21, 14, 5], [33, 27, 20, 15, 5], [33, 27, 20, 14, 6], [33, 26, 22, 16, 3], [33, 26, 21, 16, 4], [33, 26, 21, 15, 5], [33, 26, 20, 16, 5], [33, 26, 20, 15, 6], [33, 25, 21, 17, 4], [33, 25, 21, 16, 5], [33, 25, 20, 17, 5], [33, 25, 20, 16, 6], [33, 24, 20, 18, 5], [33, 24, 20, 17, 6], [33, 24, 19, 18, 6], [33, 24, 19, 17, 7], [33, 23, 19, 18, 7], [33, 23, 19, 17, 8],
    [32, 27, 22, 16, 3], [32, 27, 21, 16, 4], [32, 26, 22, 17, 3], [32, 26, 21, 17, 4], [32, 25, 21, 18, 4], [32, 25, 20, 18, 5], [32, 24, 20, 19, 5], [32, 24, 19, 19, 6], [32, 23, 19, 20, 6], [32, 23, 18, 20, 7], [32, 22, 18, 21, 7], [32, 22, 17, 21, 8], [32, 21, 17, 22, 8], [32, 21, 16, 22, 9], [32, 20, 16, 23, 9], [32, 20, 15, 23, 10],
    [31, 26, 22, 18, 3], [31, 25, 21, 19, 4], [31, 24, 20, 20, 5], [31, 23, 19, 21, 6], [31, 22, 18, 22, 7],
    [30, 25, 21, 19, 5]
];

const SEGMENT_RATIO_SETS_6 = [
    [31, 25, 20, 14, 8, 2], [31, 25, 19, 14, 8, 3], [31, 25, 19, 13, 9, 3], [31, 25, 19, 13, 8, 4],
    [30, 26, 20, 14, 8, 2], [30, 25, 20, 14, 8, 3], [30, 25, 19, 14, 9, 3], [30, 25, 19, 14, 8, 4], [30, 25, 19, 13, 9, 4], [30, 24, 20, 14, 9, 3], [30, 24, 20, 14, 8, 4], [30, 24, 19, 15, 9, 3], [30, 24, 19, 14, 9, 4], [30, 24, 19, 13, 9, 5], [30, 24, 18, 14, 10, 4], [30, 24, 18, 14, 9, 5],
    [29, 25, 20, 14, 9, 3], [29, 25, 20, 14, 8, 4], [29, 25, 19, 15, 9, 3], [29, 25, 19, 14, 9, 4], [29, 25, 19, 13, 9, 5], [29, 24, 20, 15, 9, 3], [29, 24, 20, 14, 10, 3], [29, 24, 20, 14, 9, 4], [29, 24, 20, 14, 8, 5], [29, 24, 19, 15, 10, 3], [29, 24, 19, 15, 9, 4], [29, 24, 19, 14, 10, 4], [29, 24, 19, 13, 10, 5], [29, 23, 19, 14, 10, 5], [29, 23, 19, 14, 9, 6],
    [28, 24, 20, 15, 9, 4], [28, 24, 20, 14, 9, 5], [28, 24, 19, 14, 10, 5], [28, 23, 19, 15, 10, 5], [28, 23, 19, 14, 10, 6],
    [27, 23, 19, 15, 11, 5], [27, 23, 19, 15, 10, 6]
];

const SEGMENT_RATIO_SETS_7 = [
    [29, 24, 19, 14, 9, 4, 1],
    [28, 24, 19, 14, 9, 5, 1], [28, 23, 19, 14, 10, 5, 1], [28, 23, 19, 14, 9, 6, 1], [28, 23, 19, 14, 9, 5, 2], [28, 23, 18, 15, 10, 5, 1], [28, 23, 18, 14, 10, 6, 1], [28, 23, 18, 14, 10, 5, 2], [28, 23, 18, 14, 9, 6, 2], [28, 23, 18, 13, 10, 6, 2], [28, 23, 18, 13, 9, 6, 3],
    [27, 24, 19, 14, 10, 5, 1], [27, 24, 19, 14, 9, 6, 1], [27, 24, 19, 14, 9, 5, 2], [27, 23, 19, 15, 10, 5, 1], [27, 23, 19, 14, 10, 6, 1], [27, 23, 19, 14, 10, 5, 2], [27, 23, 19, 14, 9, 6, 2], [27, 23, 18, 15, 10, 6, 1], [27, 23, 18, 15, 10, 5, 2], [27, 23, 18, 14, 10, 6, 2], [27, 23, 18, 14, 9, 7, 2], [27, 23, 18, 14, 9, 6, 3], [27, 23, 18, 13, 10, 7, 2], [27, 23, 18, 13, 10, 6, 3], [27, 23, 18, 13, 9, 7, 3], [27, 23, 18, 13, 9, 6, 4], [27, 22, 18, 14, 10, 6, 3], [27, 22, 18, 14, 9, 7, 3], [27, 22, 18, 13, 10, 7, 3], [27, 22, 18, 13, 9, 7, 4], [27, 22, 17, 13, 10, 7, 4],
    [26, 23, 19, 15, 10, 6, 1], [26, 23, 19, 15, 10, 5, 2], [26, 23, 19, 14, 11, 6, 1], [26, 23, 19, 14, 10, 7, 1], [26, 23, 19, 14, 10, 6, 2], [26, 23, 19, 14, 10, 5, 3], [26, 23, 19, 14, 9, 7, 2], [26, 23, 19, 14, 9, 6, 3], [26, 23, 18, 15, 11, 6, 1], [26, 23, 18, 15, 10, 7, 1], [26, 23, 18, 15, 10, 6, 2], [26, 23, 18, 15, 10, 5, 3], [26, 23, 18, 14, 11, 7, 1], [26, 23, 18, 14, 11, 6, 2], [26, 23, 18, 14, 10, 7, 2], [26, 23, 18, 14, 9, 8, 2], [26, 23, 18, 14, 9, 7, 3], [26, 23, 18, 13, 10, 8, 2], [26, 23, 18, 13, 10, 7, 3], [26, 23, 18, 13, 9, 8, 3], [26, 23, 18, 13, 9, 7, 4], [26, 22, 18, 15, 11, 6, 2], [26, 22, 18, 14, 11, 7, 2], [26, 22, 18, 14, 10, 8, 2], [26, 22, 18, 14, 10, 7, 3], [26, 22, 18, 13, 10, 8, 3], [26, 22, 18, 13, 9, 8, 4], [26, 22, 17, 14, 10, 8, 3], [26, 22, 17, 13, 10, 8, 4], [26, 21, 17, 13, 10, 8, 5],
    [25, 22, 19, 15, 11, 6, 2], [25, 22, 19, 14, 11, 7, 2], [25, 22, 19, 14, 10, 8, 2], [25, 22, 19, 14, 10, 7, 3], [25, 22, 19, 14, 9, 8, 3], [25, 22, 19, 14, 9, 7, 4], [25, 22, 18, 15, 11, 7, 1], [25, 22, 18, 15, 11, 6, 2], [25, 22, 18, 15, 10, 8, 1], [25, 22, 18, 15, 10, 7, 2], [25, 22, 18, 15, 10, 6, 3], [25, 22, 18, 14, 11, 8, 1], [25, 22, 18, 14, 11, 7, 2], [25, 22, 18, 14, 10, 8, 2], [25, 22, 18, 14, 9, 9, 2], [25, 22, 18, 14, 9, 8, 3], [25, 22, 18, 13, 10, 9, 2], [25, 22, 18, 13, 10, 8, 3], [25, 22, 18, 13, 9, 9, 3], [25, 22, 18, 13, 9, 8, 4], [25, 21, 18, 14, 11, 8, 3], [25, 21, 18, 13, 10, 9, 3], [25, 21, 18, 13, 9, 9, 4], [25, 21, 17, 13, 10, 9, 5],
    [24, 21, 18, 15, 12, 7, 3], [24, 21, 18, 15, 11, 8, 3], [24, 21, 18, 15, 11, 7, 4], [24, 21, 18, 14, 11, 8, 4], [24, 21, 17, 14, 11, 8, 5]
];

let targetMode = 'player'; // 'player' or 'bet'

let chickenImgProcessed = null;
const chickenImg = new Image();
chickenImg.src = 'screaming_chicken_arrow_v2.png';
chickenImg.onload = () => {
    // PNG already has transparency, so we just use the original image
    chickenImgProcessed = chickenImg;
};
chickenImg.onerror = () => {
    console.error("Failed to load chicken image.");
};

let width, height;
let gameState = 'playing'; // 'playing', 'result'
let distributionMode = 'equal'; // 'equal' or 'diff'
let playerNames = ['Player 1', 'Player 2'];
let shooterNames = []; // 우측 상단 사격 순서 전용 이름 배열
let selectedOptions = new Set(); // Track selected options
let pendingEliminationIndex = -1; // Index to remove after retry

// Target properties
const target = {
    x: 0,
    y: 0,
    radius: 200,
    rotation: 0,
    rotationSpeed: 0.05,
    highlightedIndex: -1, // 강조할 세그먼트 인덱스
    segments: 4, // This will change dynamically
    segmentWeights: [] // Store custom weights here
};

// Handle rotation speed change
rotationSpeedInput.addEventListener('input', () => {
    if (gameState === 'playing') {
        // Map 1-20 slider value to 0.01 - 0.20 range
        target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
    }
});

ratioToggleBtn.addEventListener('click', () => {
    const gameWrapper = document.getElementById('game-wrapper');
    gameWrapper.classList.toggle('ratio-20-9');
    ratioToggleBtn.classList.toggle('active');

    // Trigger resize to adjust canvas
    resize();
});

let isPulling = false;
let isHolding = false;
let isLoaded = true; // New state for arrow visibility in bow
let pullDistance = 0;
let holdTimer = 0;
const maxPull = 120;
const maxHoldTime = 30;

// Arrow properties
const arrows = [];
const arrowLength = 120;
const arrowSpeedBase = 18; // Base speed (considered as "1")
let arrowSpeed = arrowSpeedBase;

// Handle arrow speed change
arrowSpeedMultiplierInput.addEventListener('input', () => {
    arrowSpeed = arrowSpeedBase * parseFloat(arrowSpeedMultiplierInput.value);
});

diffArrowSpeedInput.addEventListener('input', () => {
    // 1-6% of maximum possible speed (Base 18 * Max Multiplier 1.5 = 27)
    const maxPossibleSpeed = arrowSpeedBase * 1.5;
    arrowSpeed = maxPossibleSpeed * (parseFloat(diffArrowSpeedInput.value) / 100);
});

function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    target.x = width * 0.15; // Moved further to the left (was 25%)
    target.y = height * 0.4; // Slightly above center to avoid bottom panel
}

window.addEventListener('resize', resize);
resize();

// --- Name Management ---

let pauseTimer, resumeTimer;

function openOptionSelectionModal() {
    const modal = document.getElementById('option-selection-modal');
    if (modal) {
        modal.classList.remove('hidden');

        // Update Modal Title with 1st Player's Name
        const modalTitle = modal.querySelector('.option-title');
        const firstPlayer = shooterNames[0] || "Player 1";
        if (modalTitle) {
            const remaining = 4 - selectedOptions.size;
            const suffix = remaining === 1 ? 'OPTION' : 'OPTIONS';
            modalTitle.innerText = `${firstPlayer}, choose one of the ${remaining} ${suffix}`;
        }

        // Add selection logic
        const options = modal.querySelectorAll('.option-card');
        const backdrop = modal.querySelector('.option-backdrop');

        // Reset previous class selections (visual only)
        options.forEach(opt => {
            opt.classList.remove('selected');
            // Hide if already selected by previous players
            if (selectedOptions.has(opt.dataset.option)) {
                opt.style.display = 'none';
            } else {
                opt.style.display = 'flex'; // Ensure visible if not selected
            }
        });

        options.forEach(option => {
            option.onclick = () => {
                // Deselect all others
                options.forEach(opt => opt.classList.remove('selected'));
                // Select clicked one
                option.classList.add('selected');

                // Removed immediate addition to selectedOptions to allow switching
                // selectedOptions.add(option.dataset.option);

                // Option 1 Logic: Stop target and clear backdrop
                if (option.dataset.option === '1') {
                    target.rotationSpeed = 0;
                    if (backdrop) backdrop.style.opacity = '0'; // Make backdrop transparent
                    activeOptionSelection = 1; // Enable selection mode
                    currentBoostFactor = 1.5;
                } else if (option.dataset.option === '2') {
                    target.rotationSpeed = 0;
                    if (backdrop) backdrop.style.opacity = '0'; // Make backdrop transparent
                    activeOptionSelection = 2; // Enable selection mode
                    currentBoostFactor = 0.5;
                } else if (option.dataset.option === '3') {
                    // Option 3 Logic: Target Speed 10-30% range, Arrow Speed Fixed

                    // 1. Set Target Speed Range (10% to 30% of max 20 => 2 to 6)
                    // Make sure current value fits
                    rotationSpeedInput.min = 2;
                    rotationSpeedInput.max = 6;
                    rotationSpeedInput.value = 4; // Start at middle of new range
                    target.rotationSpeed = 0.04;
                    rotationSpeedInput.disabled = false; // Enable for adjustment

                    // 2. Fix Arrow Speed to 60% of Middle (0.775 * 0.6 = 0.465)
                    arrowSpeedMultiplierInput.value = 0.465;
                    arrowSpeed = arrowSpeedBase * 0.465;
                    arrowSpeedMultiplierInput.disabled = true;
                    diffArrowSpeedInput.disabled = true;

                    // 3. Mark as selected and Close Modal
                    selectedOptions.add('3');
                    modal.classList.add('hidden');
                    backdrop.style.opacity = '';
                    activeOptionSelection = 0;
                } else {
                    // Option 4 Logic: Arrow Speed Adjustable, Target Speed Fixed Middle

                    // 1. Fix Target Speed to Middle (Value 10 => 0.1)
                    rotationSpeedInput.value = 10;
                    target.rotationSpeed = 0.1;
                    rotationSpeedInput.disabled = true;

                    // 2. Enable Arrow Speed Control
                    arrowSpeedMultiplierInput.min = 0.05;
                    arrowSpeedMultiplierInput.max = 1.5;
                    arrowSpeedMultiplierInput.value = 1.0; // Default to 1.0 (Base Speed)
                    arrowSpeed = arrowSpeedBase * 1.0;
                    arrowSpeedMultiplierInput.disabled = false;
                    diffArrowSpeedInput.disabled = true;

                    // 3. Mark as selected and Close Modal
                    selectedOptions.add('4');
                    modal.classList.add('hidden');
                    if (backdrop) backdrop.style.opacity = '';
                    activeOptionSelection = 0;
                }
            };
        });

        // Backdrop handlers for selection
        if (backdrop) {
            backdrop.onclick = (e) => {
                if (activeOptionSelection === 1 || activeOptionSelection === 2) {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const dx = x - target.x;
                    const dy = y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < target.radius) {
                        // Clicked inside target!
                        let angle = Math.atan2(dy, dx) - target.rotation;
                        angle = angle % (Math.PI * 2);
                        if (angle < 0) angle += Math.PI * 2;

                        let accumulatedAngle = 0;
                        for (let i = 0; i < target.segments; i++) {
                            const segmentSize = (target.segmentWeights[i] / 100) * (Math.PI * 2);
                            if (angle >= accumulatedAngle && angle < accumulatedAngle + segmentSize) {
                                // Found the segment!
                                boostedItemIndex = i % playerNames.length;

                                updatePlayerNames(false);
                                updateNameInputs(); // Sync UI

                                // Mark as selected globally (Confirmation point for Opt 1 & 2)
                                selectedOptions.add(activeOptionSelection.toString());

                                // Close modal
                                modal.classList.add('hidden');
                                backdrop.style.opacity = '';
                                activeOptionSelection = 0;

                                // New Acceleration Logic for Opt 1 & 2
                                // 1. Disable controls
                                rotationSpeedInput.disabled = true;
                                arrowSpeedMultiplierInput.disabled = true;
                                diffArrowSpeedInput.disabled = true;

                                // 2. Start slow and ramp up
                                target.rotationSpeed = 0.005; // Very slow start

                                // 3. Reset UI inputs to "Middle" values for consistnecy
                                rotationSpeedInput.value = 10;
                                arrowSpeedMultiplierInput.value = 0.775; // Middle value (matches resetSpeedsToMiddle)
                                arrowSpeed = arrowSpeedBase * 0.775;

                                let targetSpeed = 0.1; // Target middle speed
                                let rampStep = 0.001;

                                if (rampTimer) clearInterval(rampTimer);
                                rampTimer = setInterval(() => {
                                    if (target.rotationSpeed < targetSpeed) {
                                        target.rotationSpeed += rampStep;
                                    } else {
                                        target.rotationSpeed = targetSpeed;
                                        clearInterval(rampTimer);
                                    }
                                }, 50); // Update every 50ms

                                break;
                            }
                            accumulatedAngle += segmentSize;
                        }
                    }
                }
            };

            backdrop.onmousemove = (e) => {
                if (activeOptionSelection === 1 || activeOptionSelection === 2) {
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const dx = x - target.x;
                    const dy = y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < target.radius) {
                        backdrop.style.cursor = 'pointer';
                    } else {
                        backdrop.style.cursor = 'default';
                    }
                } else {
                    if (backdrop.style.cursor !== 'default') {
                        backdrop.style.cursor = 'default';
                    }
                }
            };
        }

        // Close button logic
        const closeBtn = document.getElementById('option-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                // Always restore state on close
                target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
                const backdrop = modal.querySelector('.option-backdrop');
                if (backdrop) backdrop.style.opacity = '';
                activeOptionSelection = 0;
            };
        }
    }
}


function updateNameInputs(overrideNames = null) {
    const isBetMode = (targetMode === 'bet');
    const itemCount = isBetMode ? (parseInt(betCountInput.value) || 2) : (parseInt(playerCountInput.value) || 2);
    const playerCount = parseInt(playerCountInput.value) || 2;

    // --- Handling Main Container (Items/Players) ---
    let tempNames;
    if (overrideNames) {
        tempNames = overrideNames;
    } else {
        const currentInputs = nameInputsContainer.querySelectorAll('.name-input');
        tempNames = Array.from(currentInputs).map(input => input.value);
    }

    nameInputsContainer.innerHTML = '';
    for (let i = 0; i < itemCount; i++) {
        const group = createInputGroup(
            (isBetMode ? 'I' : 'P') + (i + 1) + ':',
            isBetMode ? `Item ${i + 1}` : `Guest ${i + 1}`,
            tempNames[i] || '',
            colors[i % colors.length],
            () => removePlayer(i),
            (val) => {
                updatePlayerNames(false);
                triggerTargetPause();
            },
            false, // isReadOnlyButton
            (isBetMode && isSelectingBoostItem) ? () => applyBoostToItem(i) : null
        );
        if (isBetMode && isSelectingBoostItem) group.classList.add('selectable-item');
        // Removed boosted-item visual indicator as requested
        nameInputsContainer.appendChild(group);
    }

    // --- Handling Secondary Container (Players in BET mode only) ---
    if (isBetMode) {
        betPlayerInputsContainer.classList.remove('hidden');
        betPlayerInputsContainer.innerHTML = '';

        for (let i = 0; i < playerCount; i++) {
            let labelText = 'P' + (i + 1) + ':';
            let extraClass = '';

            // Only apply rank labels and special styling in DIFF mode (Only in PLAYERS mode)
            if (distributionMode === 'diff' && targetMode === 'player') {
                if (i === 0) { labelText = '1st:'; extraClass = 'rank-1st'; }
                else if (i === 1) { labelText = '2nd:'; extraClass = 'rank-2nd'; }
                else if (i === 2) { labelText = '3rd:'; extraClass = 'rank-3rd'; }
            }

            const group = createInputGroup(
                labelText,
                `Player ${i + 1}`,
                shooterNames[i] || '',
                'rgba(255, 255, 255, 0.1)',
                null, // No delete button for shooter row
                (val) => {
                    shooterNames[i] = val;
                },
                (distributionMode === 'diff' && targetMode === 'player' && i < 3 && hasShuffled) // Only buttons in DIFF mode
            );
            if (extraClass) group.classList.add(extraClass, 'privilege-group');
            betPlayerInputsContainer.appendChild(group);
        }

        // Add Shuffle Button at the end (only if distributionMode is 'diff')
        if (distributionMode === 'diff') {
            const shuffleBtn = document.createElement('div');
            shuffleBtn.className = 'shuffle-btn';
            if (!hasShuffled) {
                shuffleBtn.innerText = 'SHUFFLE ORDER';
                shuffleBtn.onclick = () => {
                    if (shuffleBtn.dataset.shuffling === "true") return;
                    shuffleBtn.dataset.shuffling = "true";
                    shuffleBtn.style.opacity = "0.5";
                    shuffleBtn.style.cursor = "not-allowed";

                    // Reset selected options for new round
                    selectedOptions.clear();

                    for (let j = 0; j < playerCount; j++) {
                        if (!shooterNames[j]) shooterNames[j] = `Player ${j + 1}`;
                    }

                    // Play shuffle sound
                    if (soundShuffle) {
                        soundShuffle.currentTime = 0;
                        soundShuffle.play().catch(() => { });
                    }

                    let steps = 0;
                    const intervalTime = 30;
                    const duration = 1500;
                    const maxSteps = duration / intervalTime;

                    const shuffleInterval = setInterval(() => {
                        shooterNames.sort(() => Math.random() - 0.5);

                        const inputs = betPlayerInputsContainer.querySelectorAll('input.name-input');
                        inputs.forEach((input, idx) => {
                            if (shooterNames[idx]) input.value = shooterNames[idx];
                        });

                        steps++;
                        if (steps >= maxSteps) {
                            clearInterval(shuffleInterval);
                            // Final shuffle
                            shooterNames.sort(() => Math.random() - 0.5);
                            hasShuffled = true;
                            // Re-render to show the "Option Change" button
                            updateNameInputs();
                        }
                    }, intervalTime);
                };
            } else {
                // Shuffled state: Show "PlayerName Option Change" button
                const firstPlayer = shooterNames[0] || "Player 1";
                shuffleBtn.innerText = `${firstPlayer} SELECT OPTION`;
                shuffleBtn.onclick = () => {
                    // Check if all options are used
                    if (selectedOptions.size >= 4) {
                        // Fix Target Speed to Middle
                        rotationSpeedInput.value = 10;
                        target.rotationSpeed = 0.1;
                        rotationSpeedInput.disabled = true;

                        // Fix Arrow Speed to Middle
                        arrowSpeedMultiplierInput.value = 0.775;
                        arrowSpeed = arrowSpeedBase * 0.775;
                        arrowSpeedMultiplierInput.disabled = true;
                        diffArrowSpeedInput.disabled = true;

                        showAlert("No options left. Speed fixed to middle value.");
                        return;
                    }
                    openOptionSelectionModal();
                };
            }
            betPlayerInputsContainer.appendChild(shuffleBtn);
        }
    } else {
        betPlayerInputsContainer.classList.add('hidden');
        betPlayerInputsContainer.innerHTML = '';
    }

    updatePlayerNames(false);
}

function createInputGroup(labelText, placeholder, value, bgColor, deleteCallback, inputCallback, isReadOnlyButton = false, clickableCallback = null) {
    const group = document.createElement('div');
    group.className = 'name-input-group';
    group.style.backgroundColor = bgColor;
    if (bgColor.startsWith('rgba')) group.style.border = '1px solid var(--glass-border)';
    else group.style.border = 'none';

    if (clickableCallback) {
        group.style.cursor = 'pointer';
        group.onclick = clickableCallback;
    }

    const label = document.createElement('label');
    label.innerText = labelText;
    label.style.color = bgColor === 'rgba(255, 255, 255, 0.1)' ? 'white' : 'black';
    label.style.fontWeight = 'bold';
    group.appendChild(label);

    if (isReadOnlyButton) {
        const btn = document.createElement('div');
        btn.className = 'name-input-btn';
        btn.innerText = value || placeholder;
        btn.onclick = () => {
            if (labelText === '1st:') {
                if (isSelectingBoostItem) {
                    isSelectingBoostItem = false;
                    updateNameInputs();
                } else {
                    isSelectingBoostItem = true;
                    showAlert("Select an item to expand its area by 1.5x!");
                    updateNameInputs();
                }
                return;
            }
            let msg = "";
            if (labelText === '2nd:') msg = "2nd Player: Target Speed Control";
            else if (labelText === '3rd:') msg = "3rd Player: Arrow Speed Control";
            showAlert(msg);
        };
        group.appendChild(btn);
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'name-input';
        input.placeholder = placeholder;
        input.value = value;
        input.style.color = label.style.color;
        input.style.fontWeight = 'bold';
        input.addEventListener('input', () => {
            if (inputCallback) inputCallback(input.value.trim());
        });
        group.appendChild(input);
    }

    if (deleteCallback) {
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = deleteCallback;
        group.appendChild(deleteBtn);
    }

    return group;
}

function removePlayer(index) {
    const currentInputs = nameInputsContainer.querySelectorAll('.name-input');
    const names = Array.from(currentInputs).map(input => input.value);

    // 해당 인덱스의 항목만 제거
    names.splice(index, 1);

    // 전체 개수 업데이트 (최소 2명 유지)
    const newCount = Math.max(2, names.length);

    if (targetMode === 'player') {
        playerCountInput.value = newCount;
    } else {
        betCountInput.value = newCount;
    }

    // 수정된 명단(names)을 전달하여 UI 동기화
    updateNameInputs(names);

    // If in DIFF mode, reset speeds to Locked Middle for the next player
    if (distributionMode === 'diff' && targetMode === 'player') {
        // Fix Target Speed to Middle
        rotationSpeedInput.value = 10;
        target.rotationSpeed = 0.1;
        rotationSpeedInput.disabled = true;

        // Fix Arrow Speed to Middle
        arrowSpeedMultiplierInput.value = 0.775;
        arrowSpeed = arrowSpeedBase * 0.775;
        arrowSpeedMultiplierInput.disabled = true;
        diffArrowSpeedInput.disabled = true;
    }

    if (targetMode === 'bet' && distributionMode === 'diff') {
        hasShuffled = false;
        selectedOptions.clear();
        isSelectingBoostItem = false;
        boostedItemIndex = -1;
    }
}

function triggerTargetPause() {
    if (soundTension.paused) {
        soundTension.currentTime = 0;
        soundTension.play().catch(() => { });
    }

    clearTimeout(pauseTimer);
    clearTimeout(resumeTimer);

    pauseTimer = setTimeout(() => {
        if (gameState === 'playing') {
            target.rotationSpeed = 0;
            resumeTimer = setTimeout(() => {
                if (gameState === 'playing') {
                    target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
                }
            }, 1500);
        }
    }, 800);
}

function updatePlayerNames(forceRandomize = false) {
    const inputs = nameInputsContainer.querySelectorAll('.name-input');
    const newCount = inputs.length;
    playerNames = Array.from(inputs).map(input => input.value || input.placeholder);

    // Prioritize BOOST in BET mode
    if (targetMode === 'bet' && boostedItemIndex !== -1 && boostedItemIndex < playerNames.length) {
        target.segments = playerNames.length;
        const weights = new Array(playerNames.length).fill(100);
        weights[boostedItemIndex] = 100 * currentBoostFactor;
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        target.segmentWeights = weights.map(w => (w / totalWeight) * 100);
        return;
    }

    if (distributionMode === 'diff' && targetMode === 'player') {
        const specialCounts = [3, 4, 5, 6, 7];
        if (specialCounts.includes(newCount)) {
            const currentWeightsAreDiff = target.segmentWeights && target.segmentWeights.length === newCount && !target.segmentWeights.every(w => Math.abs(w - (100 / newCount)) < 0.1);

            if (forceRandomize || !currentWeightsAreDiff) {
                let randomSet;
                if (newCount === 3) randomSet = SEGMENT_RATIO_SETS_3[Math.floor(Math.random() * SEGMENT_RATIO_SETS_3.length)];
                else if (newCount === 4) randomSet = SEGMENT_RATIO_SETS[Math.floor(Math.random() * SEGMENT_RATIO_SETS.length)];
                else if (newCount === 5) randomSet = SEGMENT_RATIO_SETS_5[Math.floor(Math.random() * SEGMENT_RATIO_SETS_5.length)];
                else if (newCount === 6) randomSet = SEGMENT_RATIO_SETS_6[Math.floor(Math.random() * SEGMENT_RATIO_SETS_6.length)];
                else if (newCount === 7) randomSet = SEGMENT_RATIO_SETS_7[Math.floor(Math.random() * SEGMENT_RATIO_SETS_7.length)];

                target.segmentWeights = [...randomSet].sort(() => Math.random() - 0.5);
                target.segments = newCount;
            }
        } else {
            target.segments = playerNames.length * 2;
            target.segmentWeights = Array(target.segments).fill(100 / target.segments);
        }
    } else {
        target.segments = playerNames.length * 2;
        target.segmentWeights = Array(target.segments).fill(100 / target.segments);
    }
}

function applyBoostToItem(index) {
    boostedItemIndex = index;
    isSelectingBoostItem = false;

    // Stop rotation to show the effect
    target.rotationSpeed = 0;

    updatePlayerNames(false); // Recalculate weights
    updateNameInputs(); // Refresh labels and styles
}

playerCountInput.addEventListener('change', () => {
    updateNameInputs();
    updateCountDisplay(); // 인원수 변경 시 스피드 상태 실시간 업데이트
});
updateNameInputs(); // Initial setup

// --- Core Game Classes ---

class Arrow {
    constructor() {
        this.x = width - 250 + pullDistance; // Moved left for visibility
        this.y = target.y; // Match target Y
        this.active = true;
        this.hit = false;
        this.falling = false;
        this.paused = false; // New state for bouncing pause
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.8;
        this.attachedAngle = 0;
        this.rotation = -Math.PI / 2; // Facing left
        this.isBounced = false; // New flag for bounce tracking
    }

    update() {
        if (!this.active || this.paused) return;

        if (this.falling) {
            // Apply physics for falling arrow
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += 0.1; // Rotate while falling

            if (this.y > height + 100) {
                this.active = false;
                if (this.isBounced) {
                    isLoaded = true; // Reload bow after arrow falls off-screen
                }
            }
        } else if (this.hit) {
            const currentAngle = target.rotation + this.attachedAngle;
            this.x = target.x + Math.cos(currentAngle) * (target.radius - 25);
            this.y = target.y + Math.sin(currentAngle) * (target.radius - 25);
            this.rotation = currentAngle - Math.PI / 2;
        } else {
            this.x -= arrowSpeed;

            const dx = this.x - target.x;
            const dy = this.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < target.radius) {
                // Determine if it sticks or bounces
                const willStick = Math.random() > 0.2; // Changed bounce chance to 20% (was 30%)

                if (willStick) {
                    this.hit = true;
                    this.attachedAngle = Math.atan2(dy, dx) - target.rotation;
                    handleHit(this.attachedAngle);
                } else {
                    // --- Added Pause Logic ---
                    target.rotationSpeed = 0;
                    this.paused = true;
                    this.hit = false;
                    this.falling = false;
                    this.isBounced = true; // Mark as bounced

                    handleMiss(); // Show "Invalid" UI

                    // Resume after 0.4s (reduced from 0.8s)
                    setTimeout(() => {
                        this.paused = false;
                        this.falling = true;
                        this.vx = Math.random() * 5 + 2;
                        this.vy = -(Math.random() * 8 + 5);
                        target.rotationSpeed = 0.08; // Resume rotation
                    }, 400);
                }
            }

            if (this.x < -100) {
                this.active = false;
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';


        // Draw Chicken Image
        if (chickenImgProcessed) {
            const aspect = chickenImg.width / chickenImg.height;
            const drawHeight = 270; // 2x expansion from 135 (total 6x original)
            const drawWidth = drawHeight * aspect;

            // Rotate clockwise (add Math.PI / 2)
            ctx.rotate(Math.PI / 2);

            ctx.drawImage(chickenImgProcessed, -drawWidth * 0.5, -drawHeight * 0.5, drawWidth, drawHeight);

            // Draw Small Black X at the hit point (mouth/pivot) - Drawn AFTER image to be on top
            if (this.hit) {
                ctx.save();
                ctx.shadowBlur = 0; // No glow for crisp X
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;

                const size = 6; // Half-size (total size 12)
                ctx.beginPath();
                // Draw X
                ctx.moveTo(-size, -size);
                ctx.lineTo(size, size);
                ctx.moveTo(size, -size);
                ctx.lineTo(-size, size);
                ctx.stroke();

                ctx.restore();
            }
        } else {
            // Basic fallback if image not loaded yet
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 40);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function handleHit(relativeAngle) {
    if (gameState !== 'playing') return;

    if (soundHit) {
        setTimeout(() => {
            soundHit.currentTime = 0;
            soundHit.play().catch(() => { });
        }, 200);
    }

    if (soundFlight) {
        soundFlight.pause();
        soundFlight.currentTime = 0;
    }
    if (flightSoundTimer) clearTimeout(flightSoundTimer);
    if (rampTimer) clearInterval(rampTimer);

    target.rotationSpeed = 0;

    let angle = relativeAngle % (Math.PI * 2);
    if (angle < 0) angle += Math.PI * 2;

    let winnerName = "";
    let winnerColor = "#ffffff";
    let winnerIndex = -1;
    let accumulatedAngle = 0;
    for (let i = 0; i < target.segments; i++) {
        const segmentSize = (target.segmentWeights[i] / 100) * (Math.PI * 2);
        if (angle >= accumulatedAngle && angle < accumulatedAngle + segmentSize) {
            winnerIndex = i % playerNames.length;
            winnerName = playerNames[winnerIndex];
            winnerColor = colors[winnerIndex % colors.length];
            break;
        }
        accumulatedAngle += segmentSize;
    }

    // Safety fallback
    if (!winnerName) {
        winnerName = playerNames[0];
        winnerColor = colors[0 % colors.length];
    }

    setTimeout(() => {
        let shooterName = (targetMode === 'bet') ? (shooterNames[0] || "Player 1") : "";
        showResult(winnerName, winnerColor, shooterName);
        if (targetMode === 'bet' && winnerIndex !== -1) {
            pendingEliminationIndex = winnerIndex;
        }
    }, 1000);
}

function removeHitItem(index) {
    const currentInputs = nameInputsContainer.querySelectorAll('.name-input');
    const names = Array.from(currentInputs).map(input => input.value);

    // If only 1 item left, don't remove (minimum game state)
    if (names.length <= 1) return;

    names.splice(index, 1);

    // Adjust boostedItemIndex if it was shifted or removed
    if (boostedItemIndex === index) {
        boostedItemIndex = -1;
    } else if (boostedItemIndex > index) {
        boostedItemIndex--;
    }

    betCountInput.value = names.length;

    // Always shift shooterNames even if empty inputs were used
    // This ensures someone disappears in ordered mode
    shooterNames.shift();
    const currentPCount = parseInt(playerCountInput.value) || 2;
    playerCountInput.value = Math.max(1, currentPCount - 1);

    updateNameInputs(names);
}

function handleMiss() {
    // Play fall sound 0.3s earlier than the message (1000ms - 300ms = 700ms)
    setTimeout(() => {
        if (soundFall) {
            soundFall.currentTime = 0;
            soundFall.play().catch(() => { });
        }
    }, 700);

    // Show temporary "Invalid" message after 1.0s delay (increased from 0.5s)
    setTimeout(() => {

        const div = document.createElement('div');
        div.innerText = 'BOUNCED! (INVALID)';
        div.style.position = 'absolute';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.fontSize = '3rem';
        div.style.fontWeight = 'bold';
        div.style.color = '#ff3e3e';
        div.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';
        div.style.pointerEvents = 'none';
        div.style.zIndex = '1000';
        div.style.animation = 'fadeOut 1.5s forwards';
        document.body.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 1500);
    }, 1000);

    if (soundFlight) {
        soundFlight.pause();
        soundFlight.currentTime = 0;
    }
    if (flightSoundTimer) clearTimeout(flightSoundTimer);

    // Penalty for DIFF mode invalid shot (Only in PLAYERS mode)
    if (distributionMode === 'diff' && targetMode === 'player') {
        rotationSpeedInput.value = 10;
        target.rotationSpeed = 10 / 100;
        rotationSpeedInput.disabled = true;
    }

    // New Request: Reset to middle speed after shot (invalid) for BET mode (Option 3 case)
    if (targetMode === 'bet') {
        rotationSpeedInput.min = 1;
        rotationSpeedInput.max = 20;
        rotationSpeedInput.value = 10;
        target.rotationSpeed = 0.1;
        rotationSpeedInput.value = 10;
        target.rotationSpeed = 0.1;

        if (distributionMode === 'diff') {
            rotationSpeedInput.disabled = true; // Lock for next player in FUN mode
            arrowSpeedMultiplierInput.disabled = true;
        } else {
            rotationSpeedInput.disabled = false; // Enable for BASIC mode
            arrowSpeedMultiplierInput.disabled = false;
        }

        // Also reset arrow speed lock if it was locked by Option 3


        // Also reset arrow speed lock if it was locked by Option 3
        diffArrowSpeedInput.disabled = true;
    }
}

// --- Mode Management ---
modeToggle.addEventListener('change', () => {
    targetMode = modeToggle.checked ? 'bet' : 'player';

    // Reset names and shooter inputs on mode switch
    shooterNames = [];
    hasShuffled = false;
    isSelectingBoostItem = false;
    boostedItemIndex = -1;
    updateNameInputs([]);

    // Update active class on labels for target mode
    document.querySelectorAll('.toggle-label[data-mode]').forEach(lbl => {
        if (lbl.dataset.mode === targetMode) lbl.classList.add('active');
        else lbl.classList.remove('active');
    });

    // If BET/PRIZE mode is active, lock distribution to EQUAL
    const setupPanel = document.getElementById('setup-panel');
    if (targetMode === 'bet') {
        setupPanel.classList.add('expanded');
        betCountGroup.classList.remove('hidden');
        playerCountLabel.innerText = 'PLAYERS:';

        // Allow EQUAL or DIFF in BET/PRIZE mode
        distToggle.disabled = false;

        diffArrowGroup.style.display = 'none';
        resetSpeedsToMiddle();

        // New Logic: If in BET+FUN (DIFF) mode, lock speeds initially
        if (distToggle.checked) {
            rotationSpeedInput.disabled = true;
            arrowSpeedMultiplierInput.disabled = true;
        } else {
            arrowSpeedMultiplierInput.disabled = false;
        }

        // New Request: Sync Player Count to Bet Count and Disable Player Count Input
        playerCountInput.value = betCountInput.value;
        playerCountInput.disabled = true;
    } else {
        setupPanel.classList.remove('expanded');

        // Re-enable Player Count Input for PLAYERS mode
        playerCountInput.disabled = false;
        betCountGroup.classList.add('hidden');
        playerCountLabel.innerText = 'PLAYERS:';

        // Re-enable distribution toggle in PLAYERS mode
        distToggle.disabled = false;
    }

    // Update count display visibility and content
    updateCountDisplay();
});

function triggerDiffAuthorityAlert() {
    // Initially disable all while waiting for alert
    rotationSpeedInput.disabled = true;
    arrowSpeedMultiplierInput.disabled = true;
    diffArrowSpeedInput.disabled = true;
    diffArrowGroup.style.display = 'flex';

    let maxWeight = -1;
    let maxIndex = 0;
    target.segmentWeights.forEach((w, i) => {
        if (w > maxWeight) {
            maxWeight = w;
            maxIndex = i;
        }
    });

    // Set highlight immediately
    target.highlightedIndex = maxIndex;
    customAlert.classList.add('bright-target'); // Make backdrop brighter to see target

    setTimeout(() => {
        const playerName = (targetMode === 'bet') ? (shooterNames[maxIndex % playerCountInput.value] || `Player ${(maxIndex % playerCountInput.value) + 1}`) : playerNames[maxIndex % playerNames.length];
        const playerColor = colors[(maxIndex % playerNames.length) % colors.length];
        const styledName = `<span class="alert-highlight-name" style="color: ${playerColor}">${playerName}</span>`;

        target.rotationSpeed = 0; // Stop rotation for clarity
        showAlert(`${styledName} has the authority to adjust the speed and shoot the arrow.`, () => {
            // Restore rotation speed from slider
            target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
            // Clear highlight and backdrop effect
            target.highlightedIndex = -1;
            customAlert.classList.remove('bright-target');
            // Enable controls after alert
            rotationSpeedInput.disabled = false;
            diffArrowSpeedInput.disabled = false;
            // Existing multiplier stays disabled
            arrowSpeedMultiplierInput.disabled = true;
        });
    }, 1500); // Increased delay to 1.5s as requested
}

function resetSpeedsToMiddle() {
    // TARGET SPEED: Middle of 1-20 is 10
    rotationSpeedInput.value = 10;
    target.rotationSpeed = 0.1;

    // ARROW SPEED: Middle of 0.05-1.5 is 0.775
    arrowSpeedMultiplierInput.value = 0.775;
    arrowSpeed = arrowSpeedBase * 0.775;
}

// --- Distribution Mode Management ---
distToggle.addEventListener('change', () => {
    if (distToggle.checked) {
        // Skip name validation check for BET/PRIZE mode
        if (targetMode === 'player') {
            const inputs = document.querySelectorAll('.name-input');
            const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');

            if (!allFilled) {
                showAlert("Target areas are randomized in FUN mode. Please input guest names.");
                distToggle.checked = false;
                return;
            }

            distToggle.checked = false; // Temporarily revert until confirmed
            showConfirm("Do you want to randomly change the target area?", () => {
                distToggle.checked = true;
                applyDistChange();
            }, () => {
                distToggle.checked = false;
            });
            return;
        }
    }

    applyDistChange();
});

function applyDistChange() {
    distributionMode = distToggle.checked ? 'diff' : 'equal';

    // Update active class on labels
    document.querySelectorAll('.toggle-label').forEach(lbl => {
        if (lbl.dataset.dist === distributionMode) lbl.classList.add('active');
        else if (lbl.dataset.dist) lbl.classList.remove('active');
    });

    // Refresh target segments (Don't force randomize in BET mode)
    updatePlayerNames(targetMode !== 'bet');

    // If switched to DIFF, trigger authority alert (Only in PLAYERS mode)
    if (distributionMode === 'diff') {
        if (targetMode === 'player') {
            triggerDiffAuthorityAlert();
        } else {
            // In BET/PRIZE mode with DIFF (FUN), LOCK speeds to middle initially
            diffArrowGroup.style.display = 'none';
            resetSpeedsToMiddle();
            rotationSpeedInput.disabled = true;
            arrowSpeedMultiplierInput.disabled = true;
            updateCountDisplay();
        }
    } else {
        // Reset to EQUAL mode defaults
        diffArrowGroup.style.display = 'none';
        arrowSpeedMultiplierInput.disabled = false;
        resetSpeedsToMiddle();
        // rotationSpeedInput state handled by updateCountDisplay
        updateCountDisplay();
    }
    updateNameInputs();
}

function updateCountDisplay() {
    countDisplay.innerHTML = ''; // Start by clearing existing content
    countDisplay.classList.add('hidden'); // Always keep it hidden as requested

    // Always enable speed adjustments regardless of mode or count
    // UNLESS in BET + FUN (DIFF) mode where they start locked
    if (targetMode === 'bet' && distributionMode === 'diff') {
        rotationSpeedInput.disabled = true;
        arrowSpeedMultiplierInput.disabled = true;
    } else {
        rotationSpeedInput.disabled = false;
        arrowSpeedMultiplierInput.disabled = false;
    }

    // Refresh current engine values from slider inputs
    target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
    arrowSpeed = arrowSpeedBase * parseFloat(arrowSpeedMultiplierInput.value);

    // Internal logic for modes (if any further state management is needed)
    if (targetMode === 'bet') {
        // Logic to populate shooterNames still exists but UI boxes are not created here anymore
        // This ensures the internal state of shooterNames survives if needed elsewhere
    }
}

betCountInput.addEventListener('change', () => {
    if (targetMode === 'bet') {
        // Sync Player Count to Bet Count
        playerCountInput.value = betCountInput.value;

        if (distributionMode === 'diff') {
            hasShuffled = false;
            selectedOptions.clear();
            isSelectingBoostItem = false;
            boostedItemIndex = -1;
        }
    }
    updateNameInputs();
});
playerCountInput.addEventListener('change', updateNameInputs);

function showResult(winner, color, shooter = "") {
    gameState = 'result';

    if (targetMode === 'player') {
        winLabel.innerText = 'RESULT';
        resultStatus.innerText = winner;
        resultShooter.classList.add('hidden');
    } else {
        winLabel.innerText = 'RESULT';
        resultStatus.innerText = winner; // In bet mode, 'winner' is the prize string
        if (shooter) {
            resultShooter.innerText = "SHOOTER: " + shooter;
            resultShooter.classList.remove('hidden');
        } else {
            resultShooter.classList.add('hidden');
        }
    }

    if (color) {
        resultStatus.style.color = color;
        resultStatus.style.textShadow = `0 0 20px ${color}`;
    } else {
        resultStatus.style.color = ''; // Reset
        resultStatus.style.textShadow = '';
    }

    resultOverlay.classList.remove('hidden');
    uiLayer.classList.add('vivid-blur');

    // Play award music
    if (soundAward) {
        soundAward.currentTime = 0;
        soundAward.play().catch(() => { });
    }
}

function drawTarget() {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(target.rotation);

    let currentAngle = 0;
    for (let i = 0; i < target.segments; i++) {
        const weight = target.segmentWeights[i];
        const segmentSize = (weight / 100) * (Math.PI * 2);

        const nameIdx = i % playerNames.length;
        ctx.fillStyle = colors[nameIdx % colors.length];

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, target.radius, currentAngle, currentAngle + segmentSize);
        ctx.closePath();

        ctx.save();
        if (target.highlightedIndex === i) {
            ctx.shadowBlur = 50;
            ctx.shadowColor = 'white';
            ctx.globalAlpha = 1.0;
        } else {
            ctx.globalAlpha = 0.8;
        }
        ctx.fill();
        ctx.restore();

        // Border / Highlight stroke
        if (target.highlightedIndex === i) {
            // Refined Glow and Path-based Stroke
            ctx.shadowBlur = 60;
            ctx.shadowColor = 'white';

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 5; // Reduced from 10/4 double stroke for better balance
            ctx.stroke();

            ctx.shadowBlur = 0; // Reset shadow
        } else {
            // Brighter borders during highlight phase
            if (target.highlightedIndex !== -1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 2;
            }
            ctx.stroke();
        }

        // Text in segment
        ctx.save();
        ctx.rotate(currentAngle + segmentSize / 2);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.font = 'bold 18px "Noto Sans KR"';
        ctx.textAlign = 'right';
        const displayText = playerNames[nameIdx] || '';
        ctx.fillText(displayText, target.radius * 0.85, 6);
        ctx.restore();

        currentAngle += segmentSize;
    }

    // Outer rings
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Center point
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function shoot() {
    if (gameState !== 'playing') return;
    arrows.push(new Arrow());
    isLoaded = false; // Hide preview arrow when shot
    if (soundShoot.src) {
        soundShoot.currentTime = 0;
        soundShoot.play().catch(() => { });
    }

    // Play flight sound ONLY if arrow speed is very slow (<15% of max)
    const maxPossibleSpeed = arrowSpeedBase * 1.5;
    const isSlow = arrowSpeed < (maxPossibleSpeed * 0.15);

    if (isSlow && soundFlight) {
        if (flightSoundTimer) clearTimeout(flightSoundTimer);
        flightSoundTimer = setTimeout(() => {
            soundFlight.currentTime = 0;
            soundFlight.play().catch(() => { });
        }, 300);
    }
}

function startPull() {
    if (gameState !== 'playing') return;
    isPulling = true;

    if (soundPull.src) {
        soundPull.currentTime = 0;
        soundPull.play().catch(() => { });
    }
}

function release() {
    if (isPulling) {
        // Only shoot if pulled all the way
        if (pullDistance >= maxPull) {
            shoot();
            // Stop tension music when shot
            if (soundTension && !soundTension.paused) {
                soundTension.pause();
                soundTension.volume = 1.0;
            }
        } else {
            // If released halfway, smoothly restore volume (handled in animate loop)
            // No action needed here as animate loop handles volume based on pullDistance
        }

        isPulling = false;
        isHolding = false;
        pullDistance = 0;
        holdTimer = 0;
    }
}

// Input Handlers
// Input Handlers - MODIFIED: Use specific button for starting pull
const fireButton = document.getElementById('fire-btn');

if (fireButton) {
    fireButton.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent text selection
        startPull(e);
    });
    fireButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scroll/zoom on button
        startPull(e);
    });
} else {
    // Fallback for older HTML (though we updated it)
    canvas.addEventListener('mousedown', startPull);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPull(); });
}

// Global Move/Up handlers to track drag once started
window.addEventListener('mouseup', release);
window.addEventListener('touchend', release);

window.addEventListener('touchend', release);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isPulling) startPull();
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') release();
});

retryBtn.addEventListener('click', () => {
    // Stop award music if playing
    if (soundAward) {
        soundAward.pause();
        soundAward.currentTime = 0;
    }

    resultOverlay.classList.add('hidden');
    uiLayer.classList.remove('vivid-blur');

    // Execute pending elimination if it exists
    if (pendingEliminationIndex !== -1) {
        removeHitItem(pendingEliminationIndex);
        pendingEliminationIndex = -1;
    }

    // Restore Defaults (in case Option 3 or others changed them)
    rotationSpeedInput.min = 1;
    rotationSpeedInput.max = 20;
    rotationSpeedInput.disabled = (targetMode === 'bet' && distributionMode === 'diff');

    arrowSpeedMultiplierInput.disabled = (targetMode === 'bet' && distributionMode === 'diff');
    // Restore default range for arrow speed
    arrowSpeedMultiplierInput.min = 0.05;
    arrowSpeedMultiplierInput.max = 1.5;
    diffArrowSpeedInput.disabled = false;

    // Force reset speed values if they were locked/modified by options
    // Let's reset to defaults for safety as per plan
    if (activeOptionSelection !== 0) {
        activeOptionSelection = 0;
    }

    // Explicitly reset speeds to middle on retry (next player/round)
    rotationSpeedInput.value = 10;
    target.rotationSpeed = 0.1;
    arrowSpeedMultiplierInput.value = 0.775;
    arrowSpeed = arrowSpeedBase * 0.775;

    arrows.length = 0;
    isLoaded = true; // Reload arrow on retry
    updatePlayerNames(true); // Pick a new random ratio set for 4 players

    if (soundFlight) {
        soundFlight.pause();
        soundFlight.currentTime = 0;
    }
    if (flightSoundTimer) clearTimeout(flightSoundTimer);

    // If in DIFF mode, trigger authority alert after retry (Only in PLAYERS mode)
    if (distributionMode === 'diff' && targetMode === 'player') {
        triggerDiffAuthorityAlert();
    }

    // Set speed based on current slider value
    target.rotationSpeed = parseFloat(rotationSpeedInput.value) / 100;
    gameState = 'playing';
});

function drawBow(x, y, pull) {
    ctx.save();
    ctx.translate(x, y);

    const pullRatio = pull / maxPull;
    const bowRadius = 200 + pullRatio * 40;
    const angleSpan = 0.3 * Math.PI + pullRatio * 0.1 * Math.PI;
    const startAngle = Math.PI - angleSpan;
    const endAngle = Math.PI + angleSpan;

    const restTipsX = arrowLength;
    const bowCenterX = restTipsX - Math.cos(Math.PI - 0.3 * Math.PI) * 200;

    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(bowCenterX, 0, bowRadius, startAngle, endAngle);
    ctx.stroke();

    // Bow string
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stringTopX = bowCenterX + Math.cos(startAngle) * bowRadius;
    const stringTopY = Math.sin(startAngle) * bowRadius;
    const stringBottomX = bowCenterX + Math.cos(endAngle) * bowRadius;
    const stringBottomY = Math.sin(endAngle) * bowRadius;

    ctx.moveTo(stringTopX, stringTopY);
    if (pull > 2) {
        ctx.lineTo(pull + arrowLength, 0);
    }
    ctx.lineTo(stringBottomX, stringBottomY);
    ctx.stroke();

    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    target.rotation += target.rotationSpeed;
    drawTarget();

    // Update tension music volume based on bow pull
    if (soundTension && !soundTension.paused) {
        const pullRatio = pullDistance / maxPull;
        // Fade out more naturally, becoming silent before full pull
        const targetVol = Math.max(0, 1 - (pullRatio * 1.1));

        // Smoothly transition volume to avoid popping
        const currentVol = soundTension.volume;
        soundTension.volume = currentVol + (targetVol - currentVol) * 0.1;
    }

    if (gameState === 'playing') {
        if (isPulling) {
            if (!isHolding) {
                pullDistance += 1.2; // Increased by 1.2x from 1.0 (Approx 1.67s to full pull)
                if (pullDistance >= maxPull) {
                    pullDistance = maxPull;
                    isHolding = true;
                }
            }
        }

        drawBow(width - 250, target.y, pullDistance);

        // Preview Chicken
        if (isLoaded && chickenImgProcessed) {
            ctx.save();
            ctx.translate(width - 250 + pullDistance, target.y);
            ctx.rotate(-Math.PI / 2); // Initial flight direction

            const aspect = chickenImg.width / chickenImg.height;
            const drawHeight = 270; // 2x expansion from current 135
            const drawWidth = drawHeight * aspect;

            // Rotate clockwise
            ctx.rotate(Math.PI / 2);

            ctx.drawImage(chickenImgProcessed, -drawWidth * 0.5, -drawHeight * 0.5, drawWidth, drawHeight);

            ctx.restore();
        }
    }

    arrows.forEach((arrow, index) => {
        arrow.update();
        arrow.draw();
        if (!arrow.active) arrows.splice(index, 1);
    });

    requestAnimationFrame(animate);
}

animate();
