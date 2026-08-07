// Runs before the app mounts, in <head>, so there's no flash of the wrong
// theme or a broken deep-link route. Kept as a same-origin external file
// (rather than inline) so the CSP's script-src can be 'self' with no
// 'unsafe-inline' -- an inline script here would otherwise need either
// that (which defeats the point of a script-src) or a content hash that
// silently goes stale the moment this logic is next edited.

// Single Page Apps for GitHub Pages -- https://github.com/rafgraph/spa-github-pages
;(function (l) {
  if (l.search[1] === '/') {
    var decoded = l.search
      .slice(1)
      .split('&')
      .map(function (s) {
        return s.replace(/~and~/g, '&')
      })
      .join('?')
    window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash)
  }
})(window.location)
;(function () {
  try {
    var stored = localStorage.getItem('packetnova-theme')
    var isDark = stored === 'light' ? false : true
    document.documentElement.classList.toggle('dark', isDark)
  } catch (e) {
    document.documentElement.classList.add('dark')
  }
  try {
    var colorblind = localStorage.getItem('packetnova-colorblind') === 'true'
    document.documentElement.classList.toggle('colorblind', colorblind)
  } catch (e) {
    // No stored preference and no way to read one -- leave the default
    // (non-colorblind) palette in place.
  }
})()
