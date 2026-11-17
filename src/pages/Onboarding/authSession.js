const AUTO_LOGIN_KEY = 'kattok.autoLogin';
const EXPIRY_KEY = 'kattok.accessTokenExpiresAt';

export function saveAuthSession(response, remember = false) {
  localStorage.setItem('accessToken', response.accessToken);
  if (remember && Number.isFinite(Date.parse(response.expiresAt))) {
    localStorage.setItem(AUTO_LOGIN_KEY, 'true');
    localStorage.setItem(EXPIRY_KEY, response.expiresAt);
  } else {
    localStorage.removeItem(AUTO_LOGIN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }
}

export function clearAuthSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem(AUTO_LOGIN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function canRestoreAutoLogin() {
  return (
    localStorage.getItem(AUTO_LOGIN_KEY) === 'true' &&
    Boolean(localStorage.getItem('accessToken')) &&
    Date.parse(localStorage.getItem(EXPIRY_KEY)) > Date.now()
  );
}
