<template>
  <div :class="$style.container" v-if="visible">
    <div :class="$style.box" v-if="!authBox">
      <div role="button" :class="$style.button" class="primary" @click="startAuth">
        <div> <b> <i class="fa fa-key" />  Enter by PID </b> </div>
        <p> And Get Your Unique Direct Link </p>
      </div>
      <div role="button" :class="$style.button" @click="skip">
        <div> <b> <i class="fa fa-arrow-right" /> Continue as </b> </div>
        <p> <UserTitle :sid="this.$root.sid" :avatarSize="32" /> </p>
      </div>
    </div>
    <div :class="$style.box" v-else>
      <div>
        <div>
          <label> Enter Passprase </label>
        </div>
        <div>
          <Input placeholder="Enter your Passprase."/>
        </div>
        <p> Choose a big and unique string as your Passprase to keep your generated POD safe. </p>
      </div>
      <div>
        <div>
          <label> Salt </label>
        </div>
        <div>
          <Input placeholder="Enter your Email or Phone for example."/>
        </div>
        <p> To generating a unguessable PID, It's better to append a Salt string to it. So why not? </p>
      </div>
      <div role="button" :class="$style.button" class="primary" @click="startAuth">
        <b> <i class="fa fa-check" />  Generate a PID and Enter </b>
      </div>
    </div>
  </div>
</template>

<script>
import UserTitle from './UserTitle.vue';
import Input from './Input.vue';

export default {
  components: {
    UserTitle,
    Input,
  },
  data() {
    return {
      visible: false,
      authBox: false,
    }
  },
  methods: {
    open() {
      this.authBox = false;
      this.visible = true;
    },
    skip() {
      this.visible = false;
    },
    startAuth() {
      this.authBox = true;
    }
  },
  style({ className }) {
    return [
      className('container', {
        position: 'fixed',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)'
      }),
      className('box', {
        maxWidth: '380px',
        width: '100%',
        background: this.$root.theme.backgroundColor,
        borderRadius: '8px',
        border: `solid 1px ${this.$root.theme.borderColor}`,
        boxShadow: `0 12px 12px ${this.$root.theme.shadowColor}`,
      }),
      className('button', {
        padding: '8px',
        borderRadius: '8px',
        border: `solid 1px ${this.$root.theme.borderColor}`,
        background: this.$root.theme.backgroundColor,
        textAlign: 'center',
        padding: '16px',
        cursor: 'pointer',
        margin: '16px',
        '&.primary': {
          background: this.$root.theme.primaryColor,
          color: '#fff',
          border: 'none',
        }
      })
    ]
  }
}
</script>