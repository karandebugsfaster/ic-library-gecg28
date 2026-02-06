// src/lib/utils/session.js

const SESSION_KEY = 'ic_library_user';

export function saveUserSession(userData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  }
}

export function getUserSession() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isUserLoggedIn() {
  return getUserSession() !== null;
}