<template>
  <div :class="$style.container" v-if="visible">
    <div v-if="currentPage === 'cannot-connect'" :class="$style.sessionError">
      <h2 class="padding-bottom-lg"><i class="fa fa-info-circle"> Close the Other Sessions First. </i></h2>
      <h3 role="button" @click="currentPage = 'choose'">
        <b> <i class="fa fa-chevron-right" /> Or Let Me Try with Another Credentials </b>
      </h3>
    </div>
    <div :class="$style.box" class="padding-lg" v-else-if="currentPage === 'logout'">
      <div class="padding-bottom-lg">
        <h3> Logout. </h3>
      </div>
      <div class="padding-bottom-xl">
        <p> Are you sure you want to exit from app? by doing this all of your chat data and saved credentials will be lost. </p>
      </div>
      <Cell>
        <div class="padding-right-md grow">
          <Button class="size-md" color="default" fullWidth @click.native="visible = false">
            <b> <i class="fa fa-chevron-left" /> No, Take Me Back </b>
          </Button>
        </div>
        <div>
          <Button class="size-md padding-x-lg" color="danger" fullWidth @click.native="logout()" :loading="loading">
            <b> <i class="fa fa-sign-out-alt" /> Yes I'm sure </b>
          </Button>
        </div>
      </Cell>
    </div>
    <div :class="$style.box" class="padding-lg" v-else-if="currentPage === 'choose'">
      <div class="padding-bottom-lg">
        <Button class="size-xxl padding-xl" color="primary" fullWidth @click.native="currentPage = 'pidLogin'">
          <div class="padding-bottom-md"> <b> <i class="fa fa-key" />  Enter by Passprase </b> </div>
          <p> Get Your Unique Direct Link </p>
        </Button>
      </div>
      <div>
        <Button class="size-xxl padding-lg" color="default" fullWidth @click.native="auth('did')" :loading="loading">
          <div class="padding-bottom-md"> <b> <i class="fa fa-arrow-right" /> Skip </b> </div>
          <p> Nobody Will Knows Who You Are </p>
        </Button>
      </div>
    </div>
    <div :class="$style.box" class="padding-lg" v-else-if="currentPage === 'pidLogin'">
      <div class="padding-bottom-xl">
        <a role="button" @click="currentPage = 'choose'"> <b> <i class="fa fa-chevron-left" />  Back </b> </a>
      </div>
      <form @submit.prevent="auth('pid')">
        <div class="padding-bottom-lg">
          <div class="padding-bottom-md">
            <b> <i class="fa fa-fingerprint" /> Passprase </b>
          </div>
          <div class="padding-bottom-md">
            <Input placeholder="Enter your Passprase." required v-model="form.passprase" :disabled="loading"/>
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
            <Input placeholder="Enter your Email or Phone for example." required v-model="form.salt" :disabled="loading"/>
          </div>
          <div>
            <small> <i class="fa fa-info-circle" /> To generate a unguessable PID, It's better that appending a Salt to it. So why not? </small>
          </div>
        </div>
        <div class="padding-bottom-lg">
          <div>
            <label> <input type="checkbox" v-model="form.remember" :disabled="loading"/> Remember These </label>
          </div>
        </div>
        <div>
          <Button class="size-md" color="primary" fullWidth :disabled="loading" :loading="loading">
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
import getFingerprint from '../../utils/fingerprint.js';

export default {
  components: {
    UserTitle,
    Input,
    Button,
    Cell,
  },
  data() {
    return {
      currentPage: 'none',
      loading: false,
      visible: false,
      form: {
        passprase: '',
        salt: '',
        remember: false,
      }
    }
  },
  methods: {
    open() {
      this.visible = true;
      const passprase = localStorage.getItem('passprase');
      const salt = localStorage.getItem('salt');
      if (salt && passprase) {
        this.form.passprase = passprase;
        this.form.salt = salt;
        this.currentPage = 'none';
        this.auth('pid');
      } else {
        this.currentPage = 'choose';
      }
    },
    openLogout() {
      this.visible = true;
      this.currentPage = 'logout';
    },
    auth(type) {
      this.loading = true;
      const sendRequest = (data) => {
        console.log('senging req')
        this.$chatService.login(type, data).then(() => {
          console.log('sened req')
          if (type === 'pid' && this.form.remember) {
            localStorage.setItem('passprase', this.form.passprase);
            localStorage.setItem('salt', this.form.salt);
          }
          this.visible = false;
          this.loading = false;
        }).catch(() => {
          this.loading = false;
          this.currentPage = 'cannot-connect';
        });
      }
      if (type === 'did') {
        getFingerprint().then((fingerprint) => {
          sendRequest(fingerprint);
        });
      } else if (type === 'pid') {
        sendRequest({
          passprase: this.form.passprase,
          salt: this.form.salt,
        });
      }
    },
    logout() {
      localStorage.removeItem('passprase');
      localStorage.removeItem('salt');
      this.$chatService.logout();
      // TODO do something better
      location.reload();
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
      className('sessionError', {
        color: '#fff',
        textAlign: 'center',
        '& > h3': {
          textDecoration: 'underline',
          cursor: 'pointer',
        }
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