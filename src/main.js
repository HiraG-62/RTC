import {
  nowInSec,
  SkyWayAuthToken,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  uuidV4,
  LocalAudioStream,
} from '@skyway-sdk/room';

let appId = "db301fbf-5f0e-445f-9639-ee559c2b2538"
let secret = "fSclk6TSLv2ZB4+4Lo5OXlbW8ni6nY8LC45YaUHxWWU="
document.write('有効')
const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: appId,
      turn: true,
      actions: ['read'],
      channels: [
        {
          id: '*',
          name: '*',
          actions: ['write'],
          members: [
            {
              id: '*',
              name: '*',
              actions: ['write'],
              publication: {
                actions: ['write'],
              },
              subscription: {
                actions: ['write'],
              },
            },
          ],

          sfuBots: [
            {
              actions: ['write'],
              forwardings: [
                {
                  actions: ['write'],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode(secret);

console.error('test')

(async () => {
  const controlArea = document.getElementById('control-area');
  const playerNameInput = document.getElementById('player-name');
  const roomNameInput = document.getElementById('room-name');
  const testButton = document.getElementById('test-btn');
  const remoteMediaArea = document.getElementById('remote-media-area');

  const myId = document.getElementById('my-id');
  const joinButton = document.getElementById('join');


  const ws = new WebSocket('ws://localhost:3000');

  ws.addEventListener('open', function (e) {
    console.log('Socket接続成功');
  });

  ws.addEventListener('message', function (e) {
    let data = JSON.parse(e.data);
    console.log(data.name);
  });

  testButton.onclick = function () {
    newMedia.volume = 1;
  }

  // const audio = await SkyWayStreamFactory.createMicrophoneAudioStream();
  const audio = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: false,
      noiseSuppression: true
    }
  });
  const [audioTrack] = audio.getTracks();
  const stream = new LocalAudioStream(audioTrack);

  joinButton.onclick = async function () {

    if (roomNameInput.value === '') return;

    const context = await SkyWayContext.Create(token);
    const room = await SkyWayRoom.FindOrCreate(context, {
      type: 'sfu',
      name: roomNameInput.value,
    });
    const me = await room.join({ name: playerNameInput.value });

    let data = { "type": "join", "id": me.id, "name": me.name };
    ws.send(JSON.stringify(data));

    myId.textContent = me.id;

    await me.publish(stream);
    //   await me.publish(video);

    const subscribeAndAttach = async function (publication) {
      let pub = publication.publisher;
      if (pub.id === me.id) return;

      const playerControl = document.createElement('div');
      playerControl.className = pub.name + '_control';

      const playerButton = document.createElement('button');
      playerButton.textContent = `${pub.name}`;

      const playerVolume = document.createElement(tagName = 'input');
      playerVolume.type = 'range';

      controlArea.appendChild(playerControl);
      playerControl.appendChild(playerButton);
      playerControl.appendChild(playerVolume);

      const { stream, subscription } = await me.subscribe(publication.id);

      let newMedia;
      switch (stream.track.kind) {
        case 'audio':
          newMedia = document.createElement('audio');
          newMedia.controls = true;
          newMedia.autoplay = true;
          remoteMediaArea.appendChild(newMedia);
          break;
        default:
          return;
      }
      stream.attach(newMedia);

      playerButton.onclick = async function () {
        newMedia.muted = !newMedia.muted;
      }

      playerVolume.addEventListener('change', async function(event) {
        console.log('test')
        const volume = event.target.value;
        newMedia.volume = volume / 100;
      })

      // remoteMediaArea.appendChild(newMedia);
    };

    room.publications.forEach(subscribeAndAttach);
    room.onStreamPublished.add(async (e) => subscribeAndAttach(e.publication));
  };
})();