import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Button, Input, message } from '@uyun/components'
// import CopyToClipboard from 'react-copy-to-clipboard'
import ClipboardJS from 'clipboard'

@observer
class Config extends Component {
  constructor (props) {
    super(props)
    this.clipboard = null
    this.state = {
      isEdit: false,
      origin: window.location.origin + '/sc/portal/',
      suffix: this.props.store.suffix
    }
  }

    onChange = e => {
      this.setState({ suffix: e.target.value })
    }

    onEdit = () => {
      this.setState({
        isEdit: true,
        suffix: this.props.store.suffix
      })
    }

    onSave = () => {
      const { suffix } = this.state
      const reg = /^[a-z]*[a-z]+[a-z]*$/
      if (!suffix.match(reg)) {
        message.warn(i18n('update_suffix_wrong', '只能包含小写字母,至少有一个字母'))
      } else {
        this.props.store.updateUserSuffix({ suffix: suffix }, () => {
          this.setState({ isEdit: false })
        })
      }
    }

    handleCopy = () => {
      message.info(i18n('copied', '已复制到剪贴板'))
    }

    componentDidMount () {
      const _this = this
      this.props.store.getUserSuffix(() => {
        _this.setState({
          isEdit: true
        })
      })
      this.clipboard = new ClipboardJS('.copy-btn')
      this.clipboard.on('success', e => {
        message.info(i18n('copied', '已复制到剪贴板'))
        e.clearSelection()
      })
    }

    componentWillUnmount () {
      this.clipboard.destroy()
    }

    render () {
      const { isEdit, origin } = this.state
      const url = `${origin}${this.props.store.suffix}`
      return (
        <div className="system-config-portal-config">
          <p className="portal-config-tips">
            <i className="iconfont icon-caution" />
            <span>{i18n('portal_config_tips', '配置的对外服务会在服务门户上显示，客户人员可登录进行服务申请')}</span>
          </p>
          { isEdit ? <div className="portal-config-url-detail">
            <h1>{i18n('set_suffix_tips', '您还没有配置专属URL后缀，请先设置')}</h1>
            <div>
              <span className="title">{i18n('portal', '服务门户')}: </span>
              <Input style={{ width: 300 }} value={this.state.suffix} onChange={this.onChange} />
            </div>
            <div className="operation">
              <Button type="primary" onClick={this.onSave}>{i18n('ok', '确 定')}</Button>
            </div>
          </div>
            : <div className="portal-config-url-detail">
              <div>
                <span className="title">{i18n('portal', '服务门户')}: </span>
                <span className="url">{url}</span>
              </div>
              <div className="operation">
                <Button type="primary" onClick={this.onEdit}>{i18n('edit', '编辑')}</Button>
                <Button className="copy-btn" data-clipboard-text={url} type="primary">{i18n('copy_url', '复制链接')}</Button>
              </div>
            </div>
          }
        </div>
      )
    }
}

export default Config
