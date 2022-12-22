"use strict";

const socket = io();
let musicPlaying = false;
let connected = false;
let keystrokeId = 0;
const processingQueue = [];

const delay = ms => new Promise(res => setTimeout(res, ms));

function onSocketConnect() {
  connected = true;
  document.getElementById('status-connected').style.display = 'inline-block';
  document.getElementById('status-disconnected').style.display = 'none';
  document.getElementById('instructions').style.visibility = 'visible';
  document.getElementById('disconnect-reason').style.visibility = 'hidden';
}

function onSocketDisconnect(reason) {
  connected = false;
  document.getElementById('status-connected').style.display = 'none';
  document.getElementById('status-disconnected').style.display = 'inline-block';
  document.getElementById('disconnect-reason').style.visibility = 'visible';
  document.getElementById('disconnect-reason').innerText = 'Error: ' + reason;
  document.getElementById('instructions').style.visibility = 'hidden';
}

function limitRecentKeys(limit) {
  const recentKeysDiv = document.getElementById('recent-keys');
  while (recentKeysDiv.childElementCount > limit) {
    recentKeysDiv.removeChild(recentKeysDiv.firstChild);
  }
}

function addKeyCard(key, keystrokeId) {
  const card = document.createElement('div');
  card.classList.add('key-card');
  if (key === ' ') {
    card.innerHTML = '&nbsp;';
  } else {
    card.innerText = key;
  }
  card.setAttribute('keystroke-id', keystrokeId);
  document.getElementById('recent-keys').appendChild(card);
  limitRecentKeys(10);
}

function updateKeyStatus(keystrokeId, success) {
  const recentKeysDiv = document.getElementById('recent-keys');
  const cards = recentKeysDiv.children;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (parseInt(card.getAttribute('keystroke-id')) === keystrokeId) {
      if (success) {
        card.classList.add('processed-key-card');
      } else {
        card.classList.add('unsupported-key-card');
      }
      return;
    }
  }
}

function onKeyDown(evt) {
  if (!connected) {
    return;
  }
  if (!evt.metaKey) {
    evt.preventDefault();
    addKeyCard(evt.key, keystrokeId);
    processingQueue.push(keystrokeId);
    keystrokeId++;
  }

  let location = null;
  if (evt.location === 1) {
    location = 'left';
  } else if (evt.location === 2) {
    location = 'right';
  }
  
  socket.emit('keystroke', {
    metaKey: evt.metaKey,
    altKey: evt.altKey,
    shiftKey: evt.shiftKey,
    ctrlKey: evt.ctrlKey,
    key: evt.key,
    keyCode: evt.keyCode,
    location: location,
  });
}

function onDisplayHistoryChanged(evt) {
  document.getElementById('recent-keys').style.visibility = 'visible';
}


function simulateKey(key){
  var code = 0;
  switch (key){
    case 'A':
      console.log('Key A');
      code = 65;
      break;
    case 'W':
      console.log('Key W');
      code = 87;
      break;
    case 'S':
      console.log('Key S');
      code = 83;
      break;
    case 'D':
      console.log('Key D');
      code = 68;
      break;
    case ' ':
      console.log('Key Space');
      code = 32;
      break;

    case 'E':
      console.log('Key E');
      code = 69;
      break;
    case 'F5':
      console.log('Key F5');
      code = 116;
      break;
  }

  var keyboardEvent = document.createEvent('KeyboardEvent');
  var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';

  keyboardEvent[initMethod](
    'keydown', // event type: keydown, keyup, keypress
    true, // bubbles
    true, // cancelable
    window, // view: should be window
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    code, // keyCode: unsigned long - the virtual key code, else 0
    0, // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
  );
  document.dispatchEvent(keyboardEvent);
}

const playMusic = async () => {
  musicPlaying = true;

  var notes = document.getElementById('music-notes').value;

  while(musicPlaying){
    simulateKey('E');

    eval(notes);

    await delay(13000);
    simulateKey('E');
    simulateKey('E');
    simulateKey('E');
    simulateKey('E');
    simulateKey('E');
    await delay(2000);
    console.log("Played!");
  }
};

function stopMusic(){
  console.log("Stopped!");
  musicPlaying = false;
}


document.querySelector('body').addEventListener("keydown", onKeyDown);
document.getElementById('display-history-checkbox').addEventListener("change", onDisplayHistoryChanged);
socket.on('connect', onSocketConnect);
socket.on('disconnect', onSocketDisconnect);
socket.on('keystroke-received', (data) => {
  updateKeyStatus(processingQueue.shift(), data.success);
});