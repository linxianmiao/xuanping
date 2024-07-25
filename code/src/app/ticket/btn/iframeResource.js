import React, { Component } from 'react'
import { getIframe } from '~/ticket/forms/utils/communication'

export default function iframeResource (WrappedComponent) {
  return class extends Component {
    state = {
      visible: true
    }

    componentDidMount() {
      this.handleAllIframeOnLoad()
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.forms.ticketId !== this.props.forms.ticketId) {
        this.handleAllIframeOnLoad()
      }
    }

    addEventListenerIframeOnload = id => new Promise((resolve, reject) => {
      var iframe = document.getElementById(id)
      if (iframe.getAttribute('isloading')) {
        resolve()
      }
      iframe.onload = resolve
    })

    handleAllIframeOnLoad = () => {
      setTimeout(() => {
        const { formLayoutVos } = this.props.forms
        const iframes = getIframe(formLayoutVos)
        // 获取当前提交前的iframe
        const ids = _.chain(iframes).filter(item => item.verificationWay === 1 && !item.hidden).map(item => this.addEventListenerIframeOnload(item.id)).value()
        if (_.isEmpty(ids)) {
          return false
        }
        // iframe加载完成以后展示按钮
        this.setState({ visible: false })
        Promise.all(ids).then(res => {
          this.setState({ visible: true })
        })
      })
    }

    render() {
      return this.state.visible ? <WrappedComponent {...this.props} /> : null
    }
  }
}