import sound from '../../utils/sound.js';

const ding = sound('/ding.mp3');
const titleText = ' [New Message]';

window.addEventListener('focus', () => {
  document.title = document.title.replace(titleText, '');
});

export default (title, body, tag, playSound, showTitle, onclick) => {
  const show = () => {
    const notification = new Notification(title, {
      // renotify: true,
      body,
      tag,
    });
    notification.onclick = onclick;
  }
  playSound && ding.play();
  
  if (showTitle && !document.title.includes(titleText)) {
    document.title+=titleText;
  }

  if (!('Notification' in window)) {
    return
  } else if (Notification.permission === 'granted') {
    show();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // Whatever the user answers, we make sure we store the information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === "granted") {
        show();
      }
    });
  }
}
