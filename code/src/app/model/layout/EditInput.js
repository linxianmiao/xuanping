import React, { Component } from 'react'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@uyun/icons';
import { Input, Icon } from '@uyun/components'
import styles from './editInput.module.less'

export default class EditInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      prevValue: null,
      value: this.props.defaultValue
    }
  }

  onChange = (e) => {
    this.setState({ value: e.target.value })
  }

  handleEdit = () => {
    this.props.modal.update({
      okButtonProps: { disabled: true }
    })
    this.setState({ editing: true, prevValue: this.state.value })
  }

  onOk = () => {
    this.props.modal.update({
      okButtonProps: { disabled: false }
    })
    this.setState({ editing: false })
  }

  onCancel = () => {
    this.props.modal.update({
      okButtonProps: { disabled: false }
    })
    this.setState({ editing: false, value: this.state.prevValue })
  }

  render() {
    const { editing, value } = this.state
    return editing
      ? <div className={styles.editMode}>
        <Input.TextArea
          value={value}
          onChange={this.onChange}
        />
        <div>
          <CheckOutlined onClick={this.onOk} style={{ marginRight: 5 }} />
          <CloseOutlined onClick={this.onCancel} />
        </div>
      </div>
      : <div className={styles.previewMode}>
        {value}
        <EditOutlined onClick={this.handleEdit} />
      </div>;
  }
}
