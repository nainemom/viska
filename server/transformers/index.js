import escapeHtml from 'escape-html';

export const userInterest = (input) => escapeHtml(input.trim().toLowerCase());
export const messageBody = (input) => escapeHtml(input.trim());
