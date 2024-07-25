import React, { Component } from 'react'
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@uyun/icons'
import { Tag, Input, message } from '@uyun/components'
import classnames from 'classnames'
import axios from 'axios'
import styles from './index.module.less'

export default class Options extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  state = {
    commonOpinions: [], // 内置意见
    customOpinions: [], // 自定义意见
    editing: false, // 是否正在编辑意见
    inputValue: ''
  }

  componentDidMount() {
    this.queryOptions()
  }

  queryOptions = async () => {
    const res = await axios.get('/itsm/api/v2/config/system/query', { params: { type: 'switch' } })
    const list = res.data.data.list || []
    const commonData = list.find((item) => item.code === 'opinions')
    const customData = list.find((item) => item.code === 'customOpinions')

    const commonOpinions = commonData ? commonData.value.list : []
    const customOpinions = customData ? customData.value.list : []

    this.setState({ commonOpinions, customOpinions })
  }

  handleCancelEditing = () => {
    this.setState({ editing: false, inputValue: '' })
  }

  handleSave = async () => {
    const { inputValue } = this.state

    if (!inputValue || inputValue.length === 0 || inputValue.trim().length === 0) {
      message.error('请输入意见')
      return
    }

    const res = await axios.post(`/itsm/api/v2/config/system/saveCustomOpinions`, {
      opinion: inputValue
    })

    if (res) {
      this.handleCancelEditing()
      this.queryOptions()
    }
  }

  handleDelete = async (e, text) => {
    e.preventDefault()
    e.stopPropagation()

    const res = await axios.post(`/itsm/api/v2/config/system/deleteCustomOpinion`, {
      opinion: text
    })

    if (res) {
      this.queryOptions()
    }
  }

  renderOpinions = (opinions, type) => {
    return opinions.map((text, index) => {
      return (
        <Tag
          key={index + ''}
          className={styles.tag}
          onClick={() => this.props.onChange(text)}
          closable={type === 'custom'}
          onClose={(e) => this.handleDelete(e, text)}
        >
          {text}
        </Tag>
      )
    })
  }

  render() {
    const { commonOpinions, customOpinions, editing, inputValue } = this.state
    const disabled = customOpinions.length >= 15
    const btnClassName = classnames(styles.customButton, {
      [styles.disabled]: disabled
    })

    return (
      <div className={styles.wrapper}>
        {this.renderOpinions(commonOpinions, 'common')}
        {this.renderOpinions(customOpinions, 'custom')}

        <div
          className={btnClassName}
          onClick={() => {
            if (!disabled) {
              this.setState({ editing: true })
            }
          }}
        >
          <PlusOutlined />
          &nbsp;
          {'自定义'}
        </div>

        {editing && (
          <div className={styles.inputWrapper}>
            <Input
              style={{ width: 450 }}
              placeholder={'请输入'}
              maxLength={30}
              value={inputValue}
              onChange={(e) => this.setState({ inputValue: e.target.value })}
            />
            <CheckOutlined className={styles.iconCheck} onClick={this.handleSave} />
            <CloseOutlined className={styles.iconClose} onClick={this.handleCancelEditing} />
          </div>
        )}
      </div>
    )
  }
}
