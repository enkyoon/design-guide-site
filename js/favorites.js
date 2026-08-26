// 즐겨찾기: 로그인 없이 브라우저 localStorage에만 저장
const FAVORITES_KEY = "designGuideFavorites";

function getFavoriteIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch (e) {
    return new Set();
  }
}

function isFavorite(id) {
  return getFavoriteIds().has(id);
}

function toggleFavorite(id) {
  const set = getFavoriteIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)));
  return set.has(id);
}
