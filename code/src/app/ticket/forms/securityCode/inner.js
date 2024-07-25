import React, { Component } from 'react'
import classnames from 'classnames'
import { Input } from '@uyun/components'

class Pwdinner extends Component {
  state = {
    type: 'password',
    pwd: this.props.value || ''
  }

  componentWillReceiveProps(nP) {
    if (nP.disabled !== this.props.disabled && nP.disabled) {
      this.setState({ type: 'password' })
    }
  }

  handleClick = () => {
    if (this.props.disabled) return
    const value = this.props.value || ''
    this.props.changehasDefault && this.props.changehasDefault()
    this.setState((prveState) => ({
      type: prveState.type === 'password' ? 'text' : 'password',
      pwd: prveState.type === 'password' ? value : prveState.pwd
    }))
  }

  handleChagne = (e) => {
    const { onChange } = this.props
    let value = _.trim(this.props.value) || ''
    const val = _.trim(e.target.value) || ''

    if (val.length > value.length) {
      // 输入时
      const endChar = val.substring(val.length - 1)
      value = value + endChar
    } else {
      // 删除时
      value = value.slice(0, -1)
    }

    this.setState({ pwd: value }, () => {
      onChange && onChange(value)
    })
  }

  // 如果有密码字段默认值的时候，获取焦点的时候清空
  handleFocus = () => {
    if (!this.props.value) {
      this.setState({ pwd: '' })
      this.props.changehasDefault && this.props.changehasDefault()
    }
  }

  render() {
    const { disabled, secrecy, id, value } = this.props
    const { type, pwd } = this.state
    const password =
      type === 'password'
        ? pwd
            .split('')
            .map(() => '*')
            .join('')
        : pwd

    return (
      <div
        className={classnames('new-itsm-create-field-pwd-wrap', {
          'disabled-item': secrecy || disabled
        })}
        id={id}
      >
        {disabled ? (
          <Input.Password
            value={password}
            onChange={this.handleChagne}
            onFocus={this.handleFocus}
            disabled={disabled}
          />
        ) : (
          <Input value={password} onChange={this.handleChagne} onFocus={this.handleFocus} />
        )}

        {disabled ? null : type === 'password' ? (
          <i onClick={this.handleClick} className="icon-yinjianhui iconfont" />
        ) : (
          <i onClick={this.handleClick} className="icon-biyan iconfont" />
        )}
      </div>
    )
  }
}

export default Pwdinner
