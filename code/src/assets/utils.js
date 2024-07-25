// 加密字符串
import CryptoJS from 'crypto-js'

export function encrypt(word) {
  var str = CryptoJS.enc.Utf8.parse(word)
  var base64 = CryptoJS.enc.Base64.stringify(str)
  return base64
}

// 解密字符串
export function decrypt(word) {
  var words = CryptoJS.enc.Base64.parse(word)
  var parseStr = words.toString(CryptoJS.enc.Utf8)
  return parseStr
}

// 得到Url地址指定参数的数值信息方法封装
// strParamName 参数名称  url=window.location.href
export function getURLParam(strParamName) {
  var strReturn = ''
  var strHref = window.location.href.toLowerCase()
  if (strHref.indexOf('?') > -1) {
    var strQueryString = strHref.substr(strHref.indexOf('?') + 1).toLowerCase()
    var aQueryString = strQueryString.split('&')
    for (var iParam = 0; iParam < aQueryString.length; iParam++) {
      if (aQueryString[iParam].indexOf(strParamName.toLowerCase() + '=') > -1) {
        var aParam = aQueryString[iParam].split('=')
        strReturn = aParam[1]
        break
      }
    }
  }
  return strReturn
}
