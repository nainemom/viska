module.exports.forEachSync = (arr, handler) => {
  return new Promise((resolve, reject) => {
    let currentIndex = 0;
    const handleIndex = (index) => {
      if (index >= arr.length) {
        return resolve(arr);
      }
      const ret = handler(arr[index], index);
      currentIndex += 1;
      if (ret instanceof Promise) {
        ret.then(() => {
          return handleIndex(currentIndex);
        }).catch(reject);
      }
      return handleIndex(currentIndex);
    }
    handleIndex(0);
  });
}

module.exports.minifyStr = (str) => {
  if (str.length < 17) {
    return str;
  }
  return `${str.substr(0, 8)}${str.substr(str.length - 8)}`
}


module.exports.numberHash = (str, limit) => {
  let sum = 1;
  for(let i = 0; i < str.length; i++) {
    sum = Math.imul(sum, str.charCodeAt(i));
  }
  const sin = (Math.cos(sum) + 1) / 2; // here is number between 0 to 1
  return Math.floor(sin * limit);
}


module.exports.copyToClipboard = (str) => {
  const input = document.createElement("input");
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.value = str;
  input.select();
  input.setSelectionRange(0, 99999);
  document.execCommand("copy");
  setTimeout(() => {
    input.remove();
  });
  return true;
}