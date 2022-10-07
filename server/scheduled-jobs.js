import { cleanPendingMessages } from './controllers/server';

const CLEANER_TIMER_PERIOD = 3600000;

export default () => setInterval(() => {
  cleanPendingMessages();
}, CLEANER_TIMER_PERIOD);
