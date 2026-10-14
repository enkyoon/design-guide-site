// 즐겨찾기: 로그인 없이 브라우저 localStorage에만 저장 (브랜드 slug 목록)
// 한 번 읽어 메모리에 들고 있다가, 바뀔 때만 저장하고 "favorites-change" 이벤트로 알린다.
const FAVORITES_KEY = "designGuideFavorites";

const favoriteIds = (function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch (e) {
    return new Set();
  }
})();

function isFavorite(id) {
  return favoriteIds.has(id);
}

function favoriteCount() {
  return favoriteIds.size;
}

function toggleFavorite(id) {
  if (favoriteIds.has(id)) favoriteIds.delete(id);
  else favoriteIds.add(id);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
  } catch (e) {
    /* 저장할 수 없는 환경(사생활 보호 모드 등)에서는 이번 방문 동안만 유지 */
  }
  document.dispatchEvent(new CustomEvent("favorites-change", { detail: { id, active: favoriteIds.has(id) } }));
  return favoriteIds.has(id);
}
