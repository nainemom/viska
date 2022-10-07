import { typeOf } from '../utils/handy';

export const userType = (input) => typeOf(input) === 'string' && ['@', '!'].includes(input);
export const userId = (input) => typeOf(input) === 'string' && ['@', '!'].includes(input[0]) && input.length > 8;
export const userPassphrase = (input) => typeOf(input) === 'string' && input.length >= 3;
export const userSalt = (input) => typeOf(input) === 'string' && input.length >= 3;

export const messageBody = (input) => typeOf(input) === 'string' && input.length < 256;
