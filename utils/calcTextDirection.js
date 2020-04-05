module.exports = (str) => {
  if (!str || !/^[\u0600-\u06FF]+$/.test(str.substr(0, 1))) {
    return 'ltr'
  }
  return 'rtl'
}