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
  document.getElementById('disconnect-reason').style.visibility = 'hidden';
}

function onSocketDisconnect(reason) {
  connected = false;
  document.getElementById('status-connected').style.display = 'none';
  document.getElementById('status-disconnected').style.display = 'inline-block';
  document.getElementById('disconnect-reason').style.visibility = 'visible';
  document.getElementById('disconnect-reason').innerText = 'Error: ' + reason;
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
  
  if (evt.keyCode != 100){
    socket.emit('keystroke', {
      metaKey: evt.metaKey,
      altKey: evt.altKey,
      shiftKey: evt.shiftKey,
      ctrlKey: evt.ctrlKey,
      key: evt.key,
      keyCode: evt.keyCode,
      location: location,
    });
  } else {
    socket.emit('longkeystroke', {
      metaKey: evt.metaKey,
      altKey: evt.altKey,
      shiftKey: evt.shiftKey,
      ctrlKey: evt.ctrlKey,
      key: "E",
      keyCode: 69,
      location: location,
    });
  }
 
}

function onDisplayHistoryChanged(evt) {
  document.getElementById('recent-keys').style.visibility = 'visible';
}



function simulateKey(key){
  var code = 0;
  console.log('Key ' + key);

  switch (key){
    case 'A':
      code = 65;
      break;
    case 'W':
      code = 87;
      break;
    case 'S':
      code = 83;
      break;
    case 'D':
      code = 68;
      break;
    case ' ':
      code = 32;
      break;
    case 'E':
      code = 69;
      break;
    case 'FIN':
      code = 100;
      break;
  }

  document.querySelector('body').dispatchEvent(new KeyboardEvent('keydown', {
      key: key,
      keyCode: code,
      code: "Key" + key.toUpperCase(),
      which: code,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
  }));
}

const playMusic = async () => {
  musicPlaying = true;
  var n = 0;

  while(musicPlaying){
    n++;
    simulateKey('E'); //Start

    var notes_lines = document.getElementById('music-notes').value.split('\n');
    console.log(notes_lines.length);
    
    for (var i = 0; i < notes_lines.length; i++){
      if (!musicPlaying){
        break;
      }
    
      var line_arr = notes_lines[i].split(',');
      var duration = line_arr[0];
      var key = line_arr[1] ? line_arr[1] : " ";
      
      await delay(duration);
      simulateKey(key.toUpperCase());
    }

    await delay(10000);
    simulateKey("FIN");
    await delay(3000);

    console.log("Played: " + n);
  }
};

function stopMusic(){
  console.log("Stopped!");
  musicPlaying = false;
}


document.querySelector('body').addEventListener("keydown", onKeyDown);
socket.on('connect', onSocketConnect);
socket.on('disconnect', onSocketDisconnect);
socket.on('keystroke-received', (data) => {
  updateKeyStatus(processingQueue.shift(), data.success);
});