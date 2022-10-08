export default (src) => {
  const el = document.createElement('audio');
  el.src = src;
  el.setAttribute('preload', 'auto');
  el.setAttribute('controls', 'none');
  el.style.display = 'none';
  document.body.appendChild(el);
  return {
    play: () => el.play(),
    stop: () => el.stop()
  }
}