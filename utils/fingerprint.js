import { getPromise as getFingerprint } from 'fingerprintjs2';

export default () => {
  return new Promise((resolve, reject) => {
    const timeout = 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : action => setTimeout(action, 500)
    timeout(() => {
      getFingerprint({
        excludes: { language: true, userAgent: true, enumerateDevices: true }
      }).then((data) => {
        resolve(data);
      }).catch(reject)
    })
  })
}
