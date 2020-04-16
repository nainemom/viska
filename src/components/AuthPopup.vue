<template>
  <div :class="$style.container" v-if="visible">
    <div v-if="currentPage === 'duplicate'" :class="$style.sessionError">
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
        <p> Are you sure you want to exit from app? </p>
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
        <Button class="size-xxl padding-xl" color="primary" fullWidth @click.native="currentPage = 'persistLogin'">
          <div class="padding-bottom-md text-xl"> <b> <i class="fa fa-key" />  Enter to My Account </b> </div>
          <p> Login/Signup </p>
        </Button>
      </div>
      <div>
        <Button class="size-xxl padding-lg" color="default" fullWidth @click.native="auth('temporary')" :loading="loading">
          <div class="padding-bottom-md text-xl"> <b> <i class="fa fa-user-secret" /> Enter Anonymously </b> </div>
          <p> No Information Needed </p>
        </Button>
      </div>
    </div>
    <div :class="$style.box" class="padding-lg" v-else-if="currentPage === 'persistLogin'">
      <div class="padding-bottom-xl">
        <a role="button" @click="currentPage = 'choose'"> <b> <i class="fa fa-chevron-left" />  Back </b> </a>
      </div>
      <div class="padding-bottom-xl">
        <p> This form is using for both login and signup. If you enter a existed username, the system will check for password. otherwise your account will be generate. </p>
      </div>
      <form @submit.prevent="auth('persist')">
        <div class="padding-bottom-lg">
          <div class="padding-bottom-md">
            <b> <i class="fa fa-user" /> Username </b>
          </div>
          <div class="padding-bottom-md">
            <Input placeholder="Enter Your Username." autocomplete="username" required v-model="form.username" :disabled="loading" name="username" pattern="^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$" minlength="3" maxlength="20"/>
          </div>
        </div>
        <div class="padding-bottom-xl">
          <div class="padding-bottom-md">
            <b> <i class="fa fa-fingerprint" /> Password </b>
          </div>
          <div class="padding-bottom-md">
            <Input placeholder="Enter Your Password." autocomplete="current-password" required v-model="form.password" :disabled="loading" name="password" type="password"/>
          </div>
          <div>
            <small> <i class="fa fa-info-circle" /> Keep your password somewhere safe. There is no Reset-Password like feature. </small>
          </div>
        </div>
        <div class="padding-bottom-lg">
          <div>
            <label> <input type="checkbox" v-model="form.remember" :disabled="loading"/> Remember Me </label>
          </div>
        </div>
        <div class="padding-bottom-xl" :class="$style.dangerText" v-if="passError">
          <p> <i class="fa fa-info-circle" /> The entered username is already in system and/or the password is wrong. </p>
        </div>
        <div>
          <Button class="size-md" color="primary" fullWidth :disabled="loading" :loading="loading">
            <b> <i class="fa fa-check" />  Enter </b>
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
      currentPage: 'none',
      loading: false,
      visible: false,
      form: {
        username: '',
        password: '',
        remember: false,
      },
      passError: false,
    }
  },
  methods: {
    open() {
      this.visible = true;
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');
      if (username && password) {
        this.form.username = username;
        this.form.password = password;
        this.currentPage = 'none';
        this.auth('persist');
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
      const sendRequest = (data = {}) => {
        this.$chatService.login({
          type,
          ...data
        }).then(() => {
          if (type === 'persist' && this.form.remember) {
            localStorage.setItem('username', this.form.username);
            localStorage.setItem('password', this.form.password);
          }
          this.visible = false;
          this.loading = false;
        }).catch((e) => {
          this.loading = false;
          if (e === 'wrong-password') {
            this.passError = true;
          } else {
            this.currentPage = 'duplicate';
          }
        });
      }
      if (type === 'temporary') {
        sendRequest();
      } else if (type === 'persist') {
        sendRequest({
          username: this.form.username,
          password: this.form.password,
        });
      }
    },
    logout() {
      this.loading = true;
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      this.$chatService.logout();
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
      className('dangerText', {
        color: '#e00000',
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