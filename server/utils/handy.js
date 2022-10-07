export const typeOf = (x) => toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

export const findFromMap = (map, searchHandler) => {
  const values = map.values();
  while (map.size) {
    const { value, done } = values.next();
    if (done) {
      return null;
    }
    if (searchHandler(value)) {
      return value;
    }
  }
  return null;
};
