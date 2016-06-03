var _cache = {};
module.exports = function templates(id) {
  if (!_cache[id]) {
    var el = document.querySelector('[type="text/template"]#' + id);
    _cache[id] = (el ? el.innerHTML : false) || ('missing template ' + id);
  }
  return _cache[id];
};