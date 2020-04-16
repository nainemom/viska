<template>
<form @submit.prevent="submit" :class="$style.formContainer">
  <div :class="$style.emoticonsContainer" v-show="emoticonPanel">
    <img v-for="(emoticon, shortcut) in mapEmoticons" :key="emoticon" :src="'/emoticons/' + emoticon" @click="addEmoti(shortcut)"/>
  </div>
  <div :class="$style.inputContainer">
    <Input ref="input" :class="$style.input" class="size-md" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event)" required :disabled="disabled"/>
    <div :class="$style.inputBtns">
      <Button :class="$style.emotIcon" type="button" @click.native="toggleEmoticonPanel" class="padding-x-md padding-left-lg size-md text-xl" color="transparent" :disabled="disabled"> <i class="fa fa-meh" /> </Button>
      <Button :class="$style.sendBtn" type="submit" class="padding-x-md padding-right-lg size-md text-xl" color="transparent" :disabled="disabled || !value"> <i class="fa fa-paper-plane" /> </Button>
    </div>
  </div>
</form>
</template>

<script>
import Cell from './Cell.vue';
import Input from './Input.vue';
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
    }
  },
  methods: {
    submit() {
      this.focus();
      this.emoticonPanel = false;
      this.$emit('submit', this.value);
    },
    toggleEmoticonPanel(e) {
      e && e.preventDefault();
      this.focus();
      this.emoticonPanel = !this.emoticonPanel;
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
      this.$nextTick(() => {
        this.$refs.input.$el.focus();
      });
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
      }),
      className('formContainer', {
        position: 'relative',
      }),
      className('inputContainer', {
        position: 'relative',
      }),
      className('inputBtns', {
        position: 'absolute',
        top: 0,
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
        paddingRight: '40px !important'
      }),
    ];
  },
}
</script>
