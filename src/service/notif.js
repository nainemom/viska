export default (title, body, icon, tag, onclick) => {
  const show = () => {
    const notification = new Notification(title, {
      // renotify: true,
      body,
      icon,
      tag,
    });
    notification.onclick = onclick;
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
