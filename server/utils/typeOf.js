export default (x) => toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
