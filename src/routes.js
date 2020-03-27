import Home from './pages/Home.vue';
import Chats from './pages/Chats.vue';
import Chat from './pages/Chat.vue';

export default [
  { path: '/', component: Home },
  { path: '/chats', component: Chats },
  { path: '/chats/:type/:id', component: Chat },
];
