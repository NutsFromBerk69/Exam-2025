// UI Elements
const txtbet = document.querySelector('#bet');
const elwin = document.querySelector('#el-win');
const txtwin = document.querySelector('#win');
const elmoney = document.querySelector('#el-money');
const txtmoney = document.querySelector('#money');
const elgame = document.querySelector('#game-area');
const btnbet = document.querySelector('#btn-bet');
const btnspin = document.querySelector('#btn-spin');
const btnputmn = document.querySelector('#btn-putmoney');

// Variables
let takemoney = 0;
let winmoney = 0;
let money = 0;
let bet = 1;
let betstep = 0;
const betarr = [1, 3, 5, 10, 20, 30, 50, 100, 200, 500, 1000, 5000, 10000, 100000];
const arr = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥭', '🥝'];

// Audio
const audioCash = new Audio('media/cash.mp3');
const audioClick = new Audio('media/click.mp3');
const audioSpin = new Audio('media/spin.mp3');
const audioWin = new Audio('media/win.mp3');
const audioOver = new Audio('media/over.mp3');

// DOM: Columns
const cols = document.querySelectorAll('.column');
const [col1, col2, col3, col4, col5] = cols;

// Add Money
btnputmn.addEventListener('click', () => {
    takemoney = Math.min(takemoney + 1000, 5000);
    elmoney.classList.remove('col-red');
    audioCash.play();
    startGame();
});

// Event Listeners (only added once)
btnspin.addEventListener('click', Spin, false);
btnbet.addEventListener('click', setBet, false);

// Deduct logic
function deductBetAmount(bet) {
    if (winmoney >= bet) {
        winmoney -= bet;
    } else {
        const remainder = bet - winmoney;
        winmoney = 0;
        takemoney -= remainder;
    }
}

// Bet switching
function setBet() {
    audioClick.play();
    betstep = (betstep + 1) % betarr.length;
    bet = betarr[betstep];
    txtbet.innerHTML = bet;
    elmoney.classList.remove('col-red');
}

// Show money and win
function showMoney() {
    money = winmoney + takemoney;
    elwin.style.display = 'none';
    elmoney.style.display = '';
    txtmoney.innerHTML = money;
}

function showWin(w) {
    elmoney.style.display = 'none';
    elwin.style.display = '';
    txtwin.innerHTML = w;
    setTimeout(() => {
        showMoney();
        enableBtns();
    }, 2000);
}

// Disable/Enable buttons
function disableBtns() {
    btnbet.setAttribute('disabled', '1');
    btnspin.setAttribute('disabled', '1');
}

function enableBtns() {
    btnbet.removeAttribute('disabled');
    btnspin.removeAttribute('disabled');
}

// Utility
function getItem(i) {
    return arr[i];
}

function getRandomInt() {
    return Math.floor(Math.random() * arr.length);
}

function addItems(el, n) {
    for (let i = 0; i < n; i++) {
        const ind = getRandomInt();
        const d = document.createElement('div');
        d.setAttribute('data-ind', ind);
        d.innerHTML = `<i>${getItem(ind)}</i>`;
        el.prepend(d);
    }
}

function getColumns() {
    addItems(col1, 10);
    addItems(col2, 20);
    addItems(col3, 30);
    addItems(col4, 40);
    addItems(col5, 50);
}

function getStartItems() {
    for (const c of cols) {
        addItems(c, 3);
    }
}

function checkMoney() {
    money = winmoney + takemoney;
    if (money >= bet) {
        return true;
    } else {
        elmoney.classList.add('col-red');
        audioOver.play();
        return false;
    }
}

// Start Game
function startGame() {
    showMoney();
    getStartItems();
}

// Spin function
function Spin() {
    if (!checkMoney()) return;

    deductBetAmount(bet);
    audioSpin.play();
    showMoney();
    disableBtns();
    getColumns();
    console.log(`Bet: ${bet}, WinMoney: ${winmoney}, TakeMoney: ${takemoney}`);

    let tr = 1;
    for (const c of cols) {
        c.style.transition = `${tr}s ease-out`;
        const n = c.querySelectorAll('div').length;
        const b = (n - 3) * 160;
        c.style.bottom = `-${b}px`;
        tr += 0.5;
    }

    col5.ontransitionend = () => {
        checkWin();
        for (const c of cols) {
            const items = c.querySelectorAll('div');
            items.forEach((item, i) => {
                if (i >= 3) item.remove();
            });
            c.style.transition = '0s';
            c.style.bottom = '0px';
        }
    };
}

// Win checking
function checkWin() {
    const arrLine1 = [], arrLine2 = [], arrLine3 = [];

    for (const c of cols) {
        const items = c.querySelectorAll('div');
        arrLine1.push(Number(items[0].dataset.ind));
        arrLine2.push(Number(items[1].dataset.ind));
        arrLine3.push(Number(items[2].dataset.ind));
    }

    function copiesArr(arr, copies) {
        const map = new Map();
        for (let elem of arr) {
            map.set(elem, (map.get(elem) || 0) + 1);
        }
        return Array.from(map.entries()).filter(([_, count]) => count >= copies)
            .map(([elem, count]) => `${elem}:${count}`);
    }

    function getCountCopies(arr) {
        return arr.length ? Number(arr[0].split(':')[1]) : 0;
    }

    function setBG(arr, row) {
        if (!arr.length) return;
        const [ind, cnt] = arr[0].split(':');
        for (const c of cols) {
            const item = c.querySelectorAll('div')[row];
            if (item.dataset.ind === ind) {
                item.classList.add('bg');
            }
        }
    }

    const arrC1 = copiesArr(arrLine1, 3);
    const arrC2 = copiesArr(arrLine2, 3);
    const arrC3 = copiesArr(arrLine3, 3);

    let stopspin = false;
    let resL1 = 0, resL2 = 0, resL3 = 0;

    if (arrC1.length > 0) {
        stopspin = true;
        const cnt = getCountCopies(arrC1);
        setBG(arrC1, 0);
        if (cnt === 3) resL1 = 2 * bet;
        else if (cnt === 4) resL1 = 5 * bet;
        else if (cnt === 5) resL1 = 1000 * bet;
    }

    if (arrC2.length > 0) {
        stopspin = true;
        const cnt = getCountCopies(arrC2);
        setBG(arrC2, 1);
        if (cnt === 3) resL2 = 10 * bet;
        else if (cnt === 4) resL2 = 100 * bet;
        else if (cnt === 5) resL2 = 1000 * bet;
    }

    if (arrC3.length > 0) {
        stopspin = true;
        const cnt = getCountCopies(arrC3);
        setBG(arrC3, 2);
        if (cnt === 3) resL3 = 2 * bet;
        else if (cnt === 4) resL3 = 5 * bet;
        else if (cnt === 5) resL3 = 1000 * bet;
    }

    if (stopspin) {
        audioWin.play();
        const win = resL1 + resL2 + resL3;
        winmoney += win;
        showWin(win);
    } else {
        enableBtns();
    }
}
