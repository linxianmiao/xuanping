var checkBrowser = function () {
  var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf('Opera') > -1
  var isIE = -[1]
  if (isOpera) {
    return 'Opera'
  } // 判断是否Opera浏览器
  if (userAgent.indexOf('Firefox') > -1) {
    return 'FF'
  } // 判断是否Firefox浏览器
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome'
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  } // 判断是否Safari浏览器
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    return 'IE'
  } // 判断是否IE浏览器
  if (isIE) {
    return 'IE'
  }
}
function browser () {
  return checkBrowser()
}
function isIE9 () {
  if (checkBrowser() !== 'IE') {
    return false
  }
  var browser = navigator.appName
  var b_version = navigator.appVersion
  var version = b_version.split(';')
  var trim_Version = version[1].replace(/[ ]/g, '')
  return !!(browser === 'Microsoft Internet Explorer' && trim_Version === 'MSIE9.0')
}

export default { browser, isIE9 }
