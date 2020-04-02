<template>
<form @submit.prevent="submit">
  <!-- <div v-if="$root.pid" class="padding-x-md padding-bottom-md">
    <small> <i class="fa fa-info-circle" /> Your PID will not send to the recipient. </small>
  </div> TODO: append it when flex issue resolves -->
  <Cell class="padding-x-sm">
    <div class="padding-x-sm grow">
      <Input ref="input" class="size-md" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event)" required :disabled="disabled"/>
    </div>
    <div class="padding-x-sm">
      <Button class="padding-x-lg size-md text-xl" color="default" :disabled="disabled"> <i class="fa fa-paper-plane"  :class="$style.sendIcon" /> </Button>
    </div>
  </Cell>
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
      this.$refs.input.$el.focus();
      this.$emit('submit', this.value);
    },
  },
  style({ className }) {
    return [
      className('sendIcon', {
        color: this.$root.theme.primaryColor,
      }),
    ];
  },
}
</script>