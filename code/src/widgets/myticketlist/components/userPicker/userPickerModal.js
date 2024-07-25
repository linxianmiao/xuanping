import React, { Component, Children, cloneElement, Fragment } from 'react'
import { Select, Modal } from '@uyun/components'
import UserPickerTable from './userPickerTable'
import { ObjectToArray, ArrayToObject } from './config'
import classnames from 'classnames'
import styles from './index.module.less'

const { Option } = Select

export default class UserPickerModal extends Component {
  state = {
    visible: false,
    modalValue: {},
    useVariable: false
  }

  // 点击选择框，初始化modal弹框里的数据
  onDropdownVisibleChange = (visible) => {
    this.setState({
      visible,
      modalValue: _.cloneDeep(this.props.value),
      useVariable: this.props.useVariable
    })
  }

  onOk = () => {
    const { modalValue, useVariable } = this.state
    this.props.onChange(modalValue, useVariable)
    this.setState({ visible: false })
  }

  onCancel = () => {
    this.setState({ visible: false })
  }

  handleChange = (ids) => {
    const { value } = this.props
    const list = _.filter(ObjectToArray(value), (item) => _.includes(ids, item.id))
    this.props.onChange(ArrayToObject(list), list)
  }

  onChangeModalValue = (modalValue) => {
    this.setState({ modalValue })
  }

  onChangeUseVariable = (useVariable) => {
    this.setState({ useVariable })
  }

  render() {
    const { value, disabled, size, placeholder, showTypes } = this.props
    const { visible, modalValue, useVariable } = this.state
    const list = ObjectToArray(value)
    return (
      <Fragment>
        <div
          className={classnames({
            [styles['user-picker-wrap']]: true,
            [styles.disabled]: disabled
          })}
        >
          {
            <Select
              mode="tags"
              open={false}
              size={size}
              allowClear
              disabled={disabled}
              placeholder={placeholder || '请选择'}
              value={_.map(list, (item) => item.id)}
              onDropdownVisibleChange={this.onDropdownVisibleChange}
              onChange={this.handleChange}
              maxTagCount="responsive"
            >
              {_.map(list, (item) => (
                <Option value={item.id} key={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          }
          {/* {!disabled && (
            <UserPickerExtendButton
              extendFunc={extendFunc}
              disabled={disabled}
              size={size}
              tabs={tabs}
              onChange={this.props.onChange}
              value={this.props.value}
            />
          )} */}
        </div>
        <Modal
          title="人员选择"
          width={850}
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
          destroyOnClose
        >
          <UserPickerTable
            showTypes={showTypes}
            value={modalValue}
            useVariable={useVariable}
            onChange={this.onChangeModalValue}
            onChangeUseVariable={this.onChangeUseVariable}
          />
        </Modal>
      </Fragment>
    )
  }
}
