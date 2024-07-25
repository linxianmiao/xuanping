import React, { Component } from 'react'
import { Collapse } from '@uyun/components'
import Secrecy from '../components/Secrecy'
const Card = Collapse.Card

export default class IframeView extends Component {
  static defaultProps = {
    builtInProps: {
      removeAll() {}
    }
  }

  state = {
    hidden: false
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { field } = nextProps
    return {
      hidden: field.hidden
    }
  }

  componentDidMount() {
    if (this.state.hidden) {
      this.destroyIframe()
    } else {
      this.onloadIframe()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.hidden !== this.state.hidden ||
      this.props.disabled !== prevProps.disabled ||
      this.props.field.iframeSrc !== prevProps.field.iframeSrc
    ) {
      if (this.state.hidden) {
        this.destroyIframe()
      } else {
        this.onloadIframe()
      }
    }
  }

  componentWillUnmount() {
    this.props.builtInProps.removeAll()
  }

  onloadIframe = () => {
    const iframe = document.getElementById(this.props.field.id)
    try {
      const currentUrl = this.getUrl()
      if (iframe.src !== currentUrl) {
        iframe.src = currentUrl
        iframe.contentWindow.location.reload(true)
      }
    } catch (e) {}
  }

  destroyIframe = () => {
    const iframe = document.getElementById(this.props.field.id)
    try {
      iframe.src = 'about:blank'
      iframe.contentWindow.document.write('')
      iframe.contentWindow.document.clear()
    } catch (e) {}
  }

  getUrl = () => {
    const { type, field, disabled } = this.props
    let disabled2 = disabled || field.isRequired === 2
    const { linkUrl, mode, viewEditVo, iframeSrc } = field
    const { viewUrl, editUrl } = viewEditVo || {}
    let url = ''
    // 脚本重新设置的src
    if (iframeSrc) {
      return iframeSrc
    }

    switch (mode) {
      case 0:
        url = linkUrl
        break
      case 1:
        url = type === 'detail' && disabled2 ? viewUrl : editUrl
        break
    }
    return url
  }

  render() {
    const { name, height, id, styleAttribute, linkUrl } = this.props.field || {}
    const { fold } = this.props
    const rest = {
      id,
      height,
      width: '100%',
      frameBorder: 0,
      scrolling: 'yes',
      src: this.getUrl(),
      onLoad: (e) => {
        e.target.setAttribute('isloading', true)
      }
    }
    const secrecy = linkUrl === '***'
    return (
      <div className="froms-group-wrap">
        {secrecy ? (
          <Collapse defaultActiveKey={['1']}>
            <Card key="1" forceRender header={name}>
              <Secrecy />
            </Card>
          </Collapse>
        ) : (
          <>
            {styleAttribute ? (
              <Collapse defaultActiveKey={fold === 0 ? ['1'] : []}>
                <Card key="1" forceRender header={name}>
                  <iframe {...rest} />
                </Card>
              </Collapse>
            ) : (
              <iframe {...rest} />
            )}
          </>
        )}
      </div>
    )
  }
}
