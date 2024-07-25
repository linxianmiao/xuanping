import React from 'react'
import { Modal, message } from '@uyun/components'

const props = { Modal, message }

// 延时触发函数
const delayFn = (fn, delay) => setTimeout(fn, delay * 1000)
// 提示框
const info = (title, content) => Modal.info({ title, content })

// 获取表单中所有的iframe控件
export function getIframe(formLayoutVos) {
  const iframeList = []
  _.forEach(formLayoutVos, (formLayout) => {
    const { type, fieldList, tabs, hidden } = formLayout
    // 和分组平级的
    if (type === 'iframe') {
      iframeList.push(formLayout)
    }
    // 分组中的
    if (type === 'group' && !hidden) {
      _.forEach(fieldList, (field) => {
        if (field.type === 'iframe') {
          iframeList.push(field)
        }
      })
    }
    // 标签页中的
    if (type === 'tab' && !hidden) {
      _.forEach(tabs, (tab) => {
        if (!tab.hidden) {
          _.forEach(tab.fieldList, (field) => {
            if (field.type === 'iframe') {
              iframeList.push(field)
            }
          })
        }
      })
    }
  })
  // 过滤掉隐藏的iframe
  return _.filter(iframeList, (item) => !item.hidden)
}
/**
 * 对符合条件的iframe控件发送信息，并返回发送信息的函数
 * @param {Array} iframeList   iframe 列表
 * @param {Number} verificationWay   1 提交前 ； 0 提交后
 * @param {Object} data   itsm发送给iframe的信息
 */
const getPostMes = (iframeList, verificationWay, data) => {
  const list = _.filter(iframeList, (iframe) => iframe.verificationWay === verificationWay)
  const idList = _.map(list, (iframe) => iframe.id)
  const { action, flowCode, modelCode } = data

  const postMesList = _.map(idList, (id) => {
    const Iframe = document.getElementById(id)
    return Iframe.contentWindow.postMessage(
      {
        source: 'itsm',
        action, // 动作行为
        iframeId: id,
        extraInformation: {
          flowCode,
          modelCode
        }
      },
      '*'
    )
  })
  return postMesList
}
// 判断iframe控件是否全部都完成了提交
const iframeAll = (list, messageDetail) => {
  return new Promise((resolve, reject) => {
    const length = list.length
    let count = 0

    messageDetail = (res) => {
      const { action, source, callback, iframeId } = res.data
      if (_.isEmpty(source)) {
        return false
      }
      if (action === 'save') {
        count += 1
      }
      if (action === 'cancel') {
        reject({ callback, iframeId })
      }
      if (count === length) {
        resolve()
      }
    }
    window.addEventListener('message', messageDetail, false)
  })
}

// 提交后发送iframe信息
const submitAfter = (iframeList, resolve, reject, data) => {
  // 存疑，目前实现的是提交成功以后发送信息跳转路由之间没有依赖关系，不知以后会不会改成iframe全部完成提交以后才能跳转路由
  const postMesList = getPostMes(iframeList, 0, data)
  resolve()
}

// 提交前发送iframe信息
const submitBefore = async (iframeList, resolve, reject, data) => {
  const postMesList = getPostMes(iframeList, 1, data)
  // iframe返回信息 处理函数
  let messageDetail
  // 如果没有满足iframe控件直接返回成功信息
  if (_.isEmpty(postMesList)) {
    resolve()
    return false
  }
  const list = _.filter(iframeList, (iframe) => iframe.verificationWay === 1)
  let infoMes // iframe控件提交过程中提示信息组件
  // 执行延时函数，iframe多久没有返回信息的时候提示用户iframe正在提交
  const timer = delayFn(() => {
    // infoMes = info(i18n('iframe-modal-tip1', 'iframe控件内容正在提交...'))
    infoMes = info(`${list.map((i) => i.name).join(',')}正在提交...`)
  }, 1)
  try {
    await iframeAll(postMesList, messageDetail)
    resolve()
  } catch (e) {
    console.log('eee', e)
    const iframe = document.getElementById(e.iframeId)
    if (iframe) {
      iframe.scrollIntoView({ block: 'center' })
    }
    const iframeName = e.iframeId ? iframeList.find((d) => d.id === e.iframeId).name : ''
    console.log('提交失败了', e, iframeName)
    const failTip = iframeName ? `${iframeName}提交失败` : i18n('ticket-tip2', '工单内容提交失败')
    info(failTip)
    reject(new Error())
  } finally {
    clearTimeout(timer)
    infoMes && infoMes.destroy()
    window.removeEventListener('message', messageDetail, false)
  }
}

/**
 * 给嵌套的iframe控件发送信息
 * formLayoutVos 表单信息
 * type 当前的动作
 * verificationWay 校验方式
 */

// verificationWay 0 表单提交成功在跳转之前给iframe发送一次信息
// verificationWay 1 提交的时候当自己的校验通过以后先不发送请求，给iframe控件发送一个信息，然后开始接收iframe控件返回的信息来判断是否可以提交
const postMessages = (formLayoutVos, data, verificationWay) => {
  return new Promise((resolve, reject) => {
    const iframeList = getIframe(formLayoutVos)
    if (verificationWay === 0) {
      submitAfter(iframeList, resolve, reject, data)
    } else if (verificationWay === 1) {
      submitBefore(iframeList, resolve, reject, data)
    }
  })
}
export default postMessages
