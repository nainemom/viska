<template>
<form @submit.prevent="submit" :class="$style.container">
  <Input :class="$style.messageInput" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event.target.value)" required :disabled="disabled"/>
  <button :class="$style.submitButton" type="submit" :disabled="disabled"> <i class="fa fa-paper-plane" /> </button>
</form>
</template>

<script>
import Input from './Input.vue';

export default {
  components: {
    Input,
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
      this.$emit('submit', this.value);
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        display: 'flex',
        flexDirection: 'row',
      }),
      className('messageInput', {
        flexGrow: 1,
        marginRight: '8px',
        borderRadius: '8px',
      }),
      className('submitButton', {
        borderRadius: '24px',
        background: this.$root.theme.primaryColor,
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        width: '48px',
        height: '48px',
        '&[disabled]': {
          cursor: 'not-allowed',
        },
      }),
    ];
  }
}
</script>