<template>
  <div :class="$style.container" v-if="visible">
    <div :class="$style.box" class="padding-lg" v-if="!authBox">
      <div class="padding-bottom-lg">
        <Button class="size-xxl padding-xl" color="primary" fullWidth @click.native="startAuth">
          <div class="padding-bottom-md"> <b> <i class="fa fa-key" />  Enter by PID </b> </div>
          <p> And Get Your Unique Direct Link </p>
        </Button>
      </div>
      <div>
        <Button class="size-xxl padding-lg" color="default" fullWidth @click.native="skip">
          <div class="padding-bottom-md"> <b> <i class="fa fa-arrow-right" /> Continue as </b> </div>
          <p> <UserTitle :sid="this.$root.sid" :avatarSize="32" /> </p>
        </Button>
      </div>
    </div>
    <div :class="$style.box" class="padding-lg" v-else>
      <div class="padding-bottom-xl">
        <a role="button" @click="open"> <b> <i class="fa fa-chevron-left" />  Back </b> </a>
      </div>
      <form @submit.prevent="auth">
        <div class="padding-bottom-lg">
          <div class="padding-bottom-md">
            <b> <i class="fa fa-fingerprint" /> Passprase </b>
          </div>
          <div class="padding-bottom-md">
            <Input placeholder="Enter your Passprase." required v-model="passprase" :disabled="autoAuth" :type="autoAuth ? 'password' : 'text'"/>
          </div>
          <div>
            <small> <i class="fa fa-info-circle" /> Choose a big and unique string as Passprase will helps you to keep your generated PID safe. </small>
          </div>
        </div>
        <div class="padding-bottom-xl">
          <div class="padding-bottom-md">
            <b> <i class="fa fa-key" /> Salt </b>
          </div>
          <div class="padding-bottom-md">
            <Input placeholder="Enter your Email or Phone for example." required v-model="salt" :disabled="autoAuth" :type="autoAuth ? 'password' : 'text'"/>
          </div>
          <div>
            <small> <i class="fa fa-info-circle" /> To generate a unguessable PID, It's better that appending a Salt to it. So why not? </small>
          </div>
        </div>
        <div class="padding-bottom-lg">
          <div>
            <label> <input type="checkbox" v-model="remember" :disabled="autoAuth"/> Remember These </label>
          </div>
        </div>
        <div>
          <Button class="size-md" color="primary" fullWidth @click.native="startAuth" :disabled="loading" :loading="loading">
            <b> <i class="fa fa-check" />  Generate a PID and Enter </b>
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import UserTitle from './UserTitle.vue';
import Input from './Input.vue';
import Button from './Button.vue';
import Cell from './Cell.vue';

export default {
  components: {
    UserTitle,
    Input,
    Button,
    Cell,
  },
  data() {
    return {
      autoAuth: false,
      loading: false,
      visible: false,
      authBox: false,
      remember: false,
      passprase: '',
      salt: '',
    }
  },
  methods: {
    open() {
      this.authBox = false;
      const savedPassprase = localStorage.getItem('passprase');
      const savedSalt = localStorage.getItem('salt');
      this.visible = true;
      if (savedSalt && savedPassprase) {
        this.autoAuth = true;
        this.salt = savedSalt;
        this.passprase = savedPassprase;
        this.authBox = true;
        this.auth();
      }
    },
    skip() {
      this.visible = false;
    },
    startAuth() {
      this.authBox = true;
    },
    auth() {
      this.loading = true;
      this.$root.server.emit('auth', {
        passprase: this.passprase,
        salt: this.salt,
      }, (err, pid) => {
        if (err) {
          alert('not available right now!');
          this.authBox = true;
          this.visible = true;
          this.loading = false;
        } else {
          this.$root.pid = pid;
          if (this.remember) {
            localStorage.setItem('passprase', this.passprase);
            localStorage.setItem('salt', this.salt);
          }
          const chatsBackup = localStorage.getItem(`${pid}:chats`);
          if (chatsBackup) {
            JSON.parse(chatsBackup).reverse().forEach((chat) => {
              return this.$root.upsertChat(chat.sid, chat.pid, chat.messages);
            });
          }

          setTimeout(() => {
            this.visible = false;
            this.loading = false;
          }, 700);
        }
      });
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
        maxWidth: '420px',
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