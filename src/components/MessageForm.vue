<template>
<form @submit.prevent="submit">
  <div :class="$style.inputContainer">
    <Input ref="input" :class="$style.input" class="size-md" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event)" required :disabled="disabled"/>
    <Button v-if="value" :class="$style.sendBtn" class="padding-x-lg size-md text-xl" color="transparent" :disabled="disabled"> <i class="fa fa-paper-plane" /> </Button>
  </div>
</form>
</template>

<script>
import Cell from './Cell.vue';
import Input from './Input.vue';
import Button from './Button.vue';

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
  methods: {
    submit() {
      this.focusOnInput();
      this.$emit('submit', this.value);
    },
    focusOnInput() {
      this.$refs.input.$el.focus();
    }
  },
  style({ className }) {
    return [
      className('inputContainer', {
        position: 'relative',
      }),
      className('sendBtn', {
        position: 'absolute',
        top: 0,
        right: 0,
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
