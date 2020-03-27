import Welcome from './pages/Welcome.vue';
import Home from './pages/Home.vue';
export default [
  { path: '/', component: Welcome },
  { path: '/chats', component: Home },
  { path: '/chats/:type/:id', component: Home },
];
