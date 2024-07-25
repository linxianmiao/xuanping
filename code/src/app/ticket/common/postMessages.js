/**
 * 给嵌套的iframe控件发送信息
 * formLayoutVos 表单信息
 * type 当前的动作
 * verificationWay 校验方式
 */

// verificationWay 0 表单提交成功在跳转之前给iframe发送一次信息
// verificationWay 1 提交的时候当自己的校验通过以后先不发送请求，给iframe控件发送一个信息，然后开始接收iframe控件返回的信息来判断是否可以提交

import { message } from '@uyun/components'

const postMessages = (formLayoutVos, type, verificationWay) => {
  return new Promise((resolve, reject) => {
    let iframeList = []
    _.forEach(formLayoutVos, formLayout => {
      if (formLayout.type === 'iframe') {
        iframeList.push(formLayout)
      }
      if (formLayout.type === 'group') {
        _.forEach(formLayout.fieldList, field => {
          if (field.type === 'iframe') {
            iframeList.push(field)
          }
        })
      }
      if (formLayout.type === 'tab') {
        _.forEach(formLayout.tabs, tab => {
          _.forEach(tab.fieldList, field => {
            if (field.type === 'iframe') {
              iframeList.push(field)
            }
          })
        })
      }
    })
    if (verificationWay === 0) {
      iframeList = _.filter(iframeList, form => form.verificationWay === 0)
      if (!_.isEmpty(iframeList)) {
        const iframeIdList = _.map(iframeList, form => form.id)
        _.forEach(iframeIdList, id => {
          const Iframe = document.getElementById(id)
          Iframe.contentWindow.postMessage({ source: 'itsm', action: type }, '*')
        })
      }
      resolve()
    } else if (verificationWay === 1) {
      iframeList = _.filter(iframeList, form => form.verificationWay === 1)
      if (!_.isEmpty(iframeList)) {
        let status = 'peinging'
        const iframeIdList = _.map(iframeList, form => form.id)
        const iframeLength = iframeIdList.length // 总共要接收信息的个数
        let i = 0 // 当前接收到成功信息的个数
        _.forEach(iframeIdList, id => {
          const Iframe = document.getElementById(id)
          Iframe.contentWindow.postMessage({ source: 'itsm', action: type }, '*')
        })
        // 处理监听信息，成功或者失败的时候移除监听
        const messageDetail = (res) => {
          const { action, source } = res.data
          if (source) {
            if (action === 'save') {
              i = i + 1
              if (iframeLength === i) {
                window.removeEventListener('message', messageDetail)
                status = 'resolve'
                resolve()
              }
            } else if (action === 'cancel') {
              message.error('iframe控件嵌套内容提交失败')
              status = 'reject'
              window.removeEventListener('message', messageDetail)
              reject(new Error('校验失败'))
            }
          }
        }
        window.addEventListener('message', messageDetail, false)
        setTimeout(() => {
          if (status === 'peinging') {
            message.error('iframe控件嵌套内容提交失败')
            window.removeEventListener('message', messageDetail)
            reject(new Error('校验超时'))
          }
        }, 5 * 1000)
      } else {
        resolve()
      }
    }
  })
}

export default postMessages
