const trim = str => { // 删除左右两端的空格
  return str.replace(/(^\s*)|(\s*$)/g, '');
}
const ltrim = str => { // 删除左边的空格
  return str.replace(/(^\s*)/g, '');
}
const rtrim = str => { // 删除右边的空格
  return str.replace(/(\s*$)/g, '');
}

export default {
  trim,
  ltrim,
  rtrim
}
