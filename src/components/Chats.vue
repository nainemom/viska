<template>
<div :class="$style.container">
  <div :class="$style.chatList">
    <Cell>
      <Button class="padding-x-sm size-lg grow" color="dark" @click.native="connectToRandomUser">
        <div class="padding-x-sm grow" v-if="!loadingRandomChat"> <i class="fa fa-random" />  Talk to a Random User </div>
        <div class="padding-x-sm grow" v-else> <i class="fa fa-spinner fa-pulse" />  Searching... </div>
      </Button>
    </Cell>
    <Cell class="padding-lg">
      <form @submit.prevent="addChat(searchingUser)" :class="$style.searchForm">
        <Input class="size-md" placeholder="Search for Users" v-model="searchUserInput" required @input="scrollToSearchResult()"/>
      </form>
    </Cell>
    
    <Cell v-if="searchingUser" ref="searchResult" class="padding-sm" :class="$style.chatItem" @click.native="addChat(searchingUser)">
      <div class="padding-right-md">
        <UserAvatar :user="searchingUser" :size="48" />
      </div>
      <div class="padding-right-md grow">
        <div>
          <UserName :user="searchingUser" />
        </div>
      </div>
    </Cell>
    <Cell v-else class="padding-sm" :class="[$style.chatItem, isActive(chat) && 'actived']" v-for="(chat, index) in chats" :key="index" @click.native="goToChat(chat)">
      <div class="padding-right-md">
        <UserAvatar :user="chat.user" :size="48" />
      </div>
      <div class="padding-right-md grow">
        <div>
          <UserName :user="chat.user" />
        </div>
        <div v-if="chat.messages.length" class="last-msg">
          <small v-html="chat.messages[chat.messages.length - 1].body" />
        </div>
      </div>
      <div class="padding-x-sm" v-if="chat.badge"><StatusIcon value="badge" /></div>
      <div class="padding-x-sm"><StatusIcon :value="chat.isOnline" /></div>
    </Cell>
  </div>
</div>
</template>

<script>
import ChatListItem from './ChatListItem.vue';
import UserTitle from './UserTitle.vue';
import UserAvatar from './UserAvatar.vue';
import UserName from './UserName.vue';
import Cell from './Cell.vue';
import Input from './Input.vue';
import Button from './Button.vue';
import StatusIcon from './StatusIcon.vue';

export default {
  components: {
    ChatListItem,
    UserTitle,
    Cell,
    Input,
    Button,
    StatusIcon,
    UserName,
    UserAvatar,
  },
  props: {
    activeChat: {
      type: Object,
    },
  },
  data() {
    return {
      loadingRandomChat: false,
      searchUserInput: '',
    }
  },
  computed: {
    chats() {
      return this.$chatService.chats;
    },
    searchingUser() {
      if (!this.searchUserInput) {
        return false;
      }
      const type = 'persist';
      let username = this.searchUserInput.split('@').join('').split('!').join('').split(' ').join('');
      if (username.indexOf('/') !== -1) {
        username = username.substr(username.lastIndexOf('/') + 1);
      }
      username = username.toLowerCase();
      return {
        type,
        username,
      }
    }
  },
  methods: {
    connectToRandomUser() {
      if (this.loadingRandomChat) {
        this.loadingRandomChat = false;
        this.$chatService.cancelConnectToRandomUser();
        return;
      }
      this.loadingRandomChat = true;
      const done = (chat) => {
        this.loadingRandomChat = false;
        this.goToChat(chat);
        this.searchUserInput = '';
      }
      setTimeout(() => {
        this.$chatService.connectToRandomUser().then(done).catch((e) => {
          if (e === 'promise') {
            this.$chatService.$once('connetedToRandomUser', done)
          } else {
            this.loadingRandomChat = false;
            this.$chatService.cancelConnectToRandomUser();
          }
        });
      }, 500);
    },
    isActive(chat) {
      return this.activeChat && chat.user.username === this.activeChat.user.username && chat.user.type === this.activeChat.user.type;
    },
    goToChat(chat) {
      this.$emit('select', chat);
      this.searchUserInput = '';
    },
    addChat(user) {
      this.$emit('add', user);
      this.searchUserInput = '';
    },
    scrollToSearchResult() {
      this.$nextTick(() => {
        this.$refs.searchResult && this.$refs.searchResult.$el.scrollIntoView();
      });
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        // height: '100%',
        overflow: 'visible',
        flexGrow: 1,
      }),
      className('chatList', {
        margin: 0,
        padding: 0,
      }),
      className('chatItem', {
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        cursor: 'pointer',
        lineHeight: 1.3,
        width: '100%',
        '& .last-msg': {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '160px',
          opacity: 0.8,
        },
        '&.actived': {
          // borderLeft: `solid 6px ${this.$root.theme.primaryColor}`,
          // textDecoration: 'underline',
          background: this.$root.theme.primaryColor,
          color: '#fff',
          // fontWeight: 'bold',
          cursor: 'default',
        },
      }),
      className('copyButton', {
        display: 'inline-block',
        padding: '0 16px',
        height: '32px',
        borderRadius: '32px',
        background: this.$root.theme.backgroundColor,
        cursor: 'pointer',
        overflow: 'hidden',
        border: 'none',
        border: `solid 1px ${this.$root.theme.borderColor}`,
      }),
      className('searchForm', {
        '&, & > *': {
          width: '100% !important',
          display: 'block !important',
        }
      }),
    ];
  }
}
</script>