import Home from './pages/Home.vue';
export default [
  { path: '/', component: Home },
  { path: '/chats', component: Home },
  { path: '/chats/:user', component: Home },
  { path: '/*', component: Home },
];
