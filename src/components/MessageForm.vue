<template>
<form @submit.prevent="submit" :class="$style.formContainer">
  <div ref="emoticonPanel" :class="$style.emoticonsContainer" v-show="emoticonPanel" tabindex="0" @blur="closeEmoticonPanelOnBlur">
    <img v-for="(emoticon, shortcut) in mapEmoticons" :key="emoticon" :src="'/emoticons/' + emoticon" @click="addEmoti(shortcut)"/>
  </div>
  <div :class="$style.inputContainer">
    <Input ref="input" maxlength="255" :class="$style.input" class="size-md" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event)" @keydown.enter="keydown" required :disabled="disabled" @blur.native="closeEmoticonPanelOnBlur"/>
    <div :class="$style.inputBtns">
      <Button :class="$style.emotIcon" type="button" @click.native="toggleEmoticonPanel" class="padding-x-md padding-left-lg size-md text-xl" color="transparent" :disabled="disabled"> <i class="fa fa-smile-wink" /> </Button>
      <Button :class="$style.sendBtn" type="submit" class="padding-x-md padding-right-lg size-md text-xl" color="transparent" :disabled="disabled || !value"> <i class="fa fa-paper-plane" /> </Button>
    </div>
  </div>
</form>
</template>

<script>
import Cell from './Cell.vue';
import Input from './AutoHeightInput.vue';
import Button from './Button.vue';
import { mapEmoticons } from '../../utils/emoticons.js';

export default {
  components: {
    Cell,
    Input,
    Button,
  },
  props: {
    value: {
      type: String,
    },
    disabled: {
      type: Boolean,
    }
  },
  data() {
    return {
      emoticonPanel: false,
      mapEmoticons,
      closingEmoticonPanelOnBlur: null,
    }
  },
  methods: {
    submit() {
      this.focus();
      this.emoticonPanel = false;
      this.$emit('submit', this.value);
    },
    toggleEmoticonPanel(e, newVal = null) {
      // clearTimeout(this.closingEmoticonPanelOnBlur);
      e && e.preventDefault();
      this.focus();
      this.emoticonPanel = !this.emoticonPanel;
    },
    closeEmoticonPanelOnBlur() {
      setTimeout(() => {
        if (![this.$refs.emoticonPanel, this.$refs.input.$el].includes(document.activeElement)) {
          this.emoticonPanel = false;
        }
      });
    },
    addEmoti(key) {
      const el = this.$refs.input.$el;
      if (el.selectionStart || el.selectionStart == '0') {
        var startPos = el.selectionStart;
        var endPos = el.selectionEnd;
        this.$emit('input', el.value.substring(0, startPos)
            + key
            + el.value.substring(endPos, el.value.length));
      } else {
          this.$emit('input', (el.value + key));
      }

      this.focus();
    },
    focus() {
      // clearTimeout(this.closingEmoticonPanelOnBlur);
      this.$nextTick(() => {
        this.$refs.input.$el.focus();
      });
    },
    keydown(event){
      if(!event.shiftKey){
        event.preventDefault();
        if(this.value && this.value.trim()){
          this.submit()
        }
      }
    }
  },
  style({ className }) {
    return [
      className('emoticonsContainer', {
        position: 'absolute',
        bottom: '90px',
        right: '22px',
        padding: '10px',
        zIndex: 2,
        height: 'auto',
        width: '290px',
        backgroundColor: this.$root.theme.backgroundColor2,
        border: `solid 2px ${this.$root.theme.borderColor}`,
        textAlign: 'center',
        '&:focus': {
          outline: 'none',
        },
        '& img': {
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: 'none',
          padding: '4px',
          border: `solid 2px transparent`,
          '&:hover' : {
            border: `solid 2px ${this.$root.theme.borderColor}`,
          }
        }
      }),
      className('formContainer', {
        position: 'relative',
      }),
      className('inputContainer', {
        position: 'relative',
      }),
      className('inputBtns', {
        position: 'absolute',
        bottom: 0,
        right: 0,
      }),
      className('sendBtn', {
        '& > i': {
          color: this.$root.theme.primaryColor,
        }
      }),
      className('emotIcon', {
        '& > i': {
          color: this.$root.theme.primaryColor,
        }
      }),
      className('input', {
        paddingRight: '80px !important'
      }),
    ];
  },
}
</script>
