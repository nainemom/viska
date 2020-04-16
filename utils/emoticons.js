import escapeHtml from 'escape-html';

export const mapEmoticons = {
  "~x(": "at-wits-end.gif",
  "x(": "angry-or-grumpy.gif",
  ";;)": "batting-eyelashes.gif",
  ">:d<": "big-hug.gif",
  "=\">": "blushing.gif",
  "=((": "broken-heart.gif",
  ":-/": "confused.gif",
  "b-)": "sunglasses-or-cool.gif",
  ":((": "crying.gif",
  "8->": "daydreaming.gif",
  ">:)": "devil.gif",
  ":-$": "do-not-tell-anyone.gif",
  "#-o": "doh!.gif",
  "=p~": "drooling.gif",
  "x_x": "i-do-not-want-to-see.gif",
  ":-*": "kiss.gif",
  ":))": "laughing.gif",
  ":x": "love-struck.gif",
  ":-ss": "nail-biting.gif",
  ":-b": "nerd.gif",
  "[-(": "not-talking.gif",
  ":)]": "on-the-phone.gif",
  "<:-p": "party.gif",
  ">:p": "phbbbbt-or-upset.gif",
  "/:)": "raised-eyebrow.gif",
  "8-|": "rolling-eyes.gif",
  ":-w": "waiting.gif",
  ":-h": "wave.gif",
  "#:-s": "whew.gif",
  ";)": "winking.gif",
  ":-s": "worried.gif",
  "(:|": "yawn.gif",
  ">-)": "alien.gif",
  "b-(": "beat-up.gif",
  ":-@": "chatterbox.gif",
  ":-??": "confused-or-i-don't-know.gif",
  "\\:d/": "dancing.gif",
  ":-l": "frustrated.gif",
  ";))": "giggle-or-hee-hee.gif",
  "%-(": "not-listening.gif",
  ":-\"": "whistling.gif",
  ":(": "sad-or-frown-face.gif",
  "=))": "rolling-on-the-floor-laughing.gif",
  ":&": "sick.gif",
  ":-<": "sigh.gif",
  "|-)": "sleepy.gif",
  ":)": "smile-or-happy-face.gif",
  ":>": "smug.gif",
  ":p": "frustrated-or-sticking-tongue-out.gif",
  ":|": "straight-face.gif",
  ":o": "surprised.gif",
  ":-?": "thinking.gif",
  ":d": "big-grin.gif",
};

const mapEmoticonsKeys = Object.keys(mapEmoticons);


export const translateToImg = (message) => {
  let ret = message || '';
  for (let i = 0; i < mapEmoticonsKeys.length; i++) {
    console.log('check!!!')
    const emoticonKey = mapEmoticonsKeys[i];
    const emoticon = mapEmoticons[emoticonKey];
    const scapedEmoticonKey = escapeHtml(emoticonKey);
    const replaceBy = `<img src="/emoticons/${emoticon}" />`;
    while(ret.includes(scapedEmoticonKey)) {
      ret = ret.replace(scapedEmoticonKey, replaceBy);
    }
  }
  return ret;
}