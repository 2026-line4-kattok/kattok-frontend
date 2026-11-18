const AUTO_LOGIN_KEY = 'kattok.autoLogin';
const EXPIRY_KEY = 'kattok.accessTokenExpiresAt';
// 자동 로그인을 끄고 로그인한 경우, 이 탭(브라우저 세션)에서만 로그인 상태로 봅니다.
const TAB_SESSION_KEY = 'kattok.tabSession';

const setTabSession = (active) => {
  try {
    if (active) sessionStorage.setItem(TAB_SESSION_KEY, 'true');
    else sessionStorage.removeItem(TAB_SESSION_KEY);
  } catch {
    // sessionStorage를 쓸 수 없으면 자동 로그인 여부로만 판단합니다.
  }
};

const hasTabSession = () => {
  try {
    return sessionStorage.getItem(TAB_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export function saveAuthSession(response, remember = false) {
  localStorage.setItem('accessToken', response.accessToken);
  setTabSession(true);
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
  setTabSession(false);
}

export function canRestoreAutoLogin() {
  return (
    localStorage.getItem(AUTO_LOGIN_KEY) === 'true' &&
    Boolean(localStorage.getItem('accessToken')) &&
    Date.parse(localStorage.getItem(EXPIRY_KEY)) > Date.now()
  );
}

// 앱 화면(홈·내 카드·검색·마이 등)에 들어갈 수 있는 로그인 상태인지
// 자동 로그인이 유효하거나, 이 탭에서 로그인·회원가입했으면 true입니다.
export function hasActiveSession() {
  if (!localStorage.getItem('accessToken')) return false;
  return canRestoreAutoLogin() || hasTabSession();
}
