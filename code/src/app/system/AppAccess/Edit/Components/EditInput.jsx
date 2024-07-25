import React, { Component } from 'react'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@uyun/icons';
import { Input, Icon } from '@uyun/components'
import styles from './index.module.less'

export default class EditInput extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
      editing: false
    }
  }

  handleEditOpen = () => {
    const { value } = this.props
    this.setState({ editing: true, value }, () => {
      this.props.onChange(value)
    })
  }

  handleEditOk = () => {
    this.setState({ editing: false }, () => {
      this.props.onChange(this.state.value)
    })
  }

  handleEditCancel = () => {
    const { value } = this.props
    this.setState({
      value,
      editing: false
    }, () => {
      this.props.onChange(value)
    })
  }

  renderEditing = () => {
    return <>
      <Input
        style={{ width: 'calc(100% - 56px)' }}
        placeholder={i18n('please-input', '请输入')}
        value={this.state.value}
        onChange={e => this.setState({ value: e.target.value })}
      />
      <CheckOutlined onClick={this.handleEditOk} />
      <CloseOutlined onClick={this.handleEditCancel} />
    </>;
  }

  renderReading = () => {
    const { value } = this.props

    return <>
      <span>{value}</span>
      <EditOutlined onClick={this.handleEditOpen} />
    </>;
  }

  render() {
    const { editing } = this.state

    return (
      <div className={styles.editInput}>
        {
          editing ? this.renderEditing() : this.renderReading()
        }
      </div>
    )
  }
}
