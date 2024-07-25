import React, { Component, Children, cloneElement, Fragment } from 'react'
import { Select, Modal, Tag } from '@uyun/components'
import UserPickerTable from './userPickerTable'
import { ObjectToArray, ArrayToObject, StoreConsumer } from './config'
import UserPickerExtendButton from './userPickerExtendButton'
import classnames from 'classnames'
import styles from './index.module.less'
const Option = Select.Option
export default class UserPickerModal extends Component {
  state = {
    visible: false,
    modalValue: {},
    useVariable: false
  }

  // 点击选择框，初始化modal弹框里的数据
  onDropdownVisibleChange = visible => {
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

  handleChange = ids => {
    const { value } = this.props
    const list = _.filter(ObjectToArray(value), item => _.includes(ids, item.id))
    this.props.onChange(ArrayToObject(list), this.state.useVariable)
  }

  onChangeModalValue = modalValue => {
    const { mutex, selectionType } = this.props
    const { modalValue: prevModalValue } = this.state
    const nextModalValue = _.cloneDeep(modalValue)

    // 不同tab下的选项不能共存时
    if (selectionType === 'checkbox' && mutex) {
      Object.keys(prevModalValue).forEach(type => {
        if (nextModalValue[type].length === prevModalValue[type].length) {
          nextModalValue[type] = []
        }
      })
    }
    this.setState({ modalValue: nextModalValue })
  }

  onChangeUseVariable = useVariable => {
    this.setState({ useVariable })
  }

  render() {
    const { value } = this.props
    const { visible, modalValue, useVariable } = this.state
    const list = ObjectToArray(value)
    return (
      <Fragment>
        <StoreConsumer>
          {
            ({ props }) => {
              const { placeholder, children, mode, size, extendFunc, disabled, tabs } = props
              if (mode === 'custom' && children) {
                return (
                  Children.map(children, child => cloneElement(child, {
                    onClick: () => {
                      if (typeof child.props.onClick === 'function') {
                        child.props.onClick()
                      }
                      this.onDropdownVisibleChange(true)
                    }
                  }))
                )
              }
              return (
                <div className={classnames({
                  [styles.userPickerWrap]: true,
                  [styles.disabled]: disabled
                })}>
                  {
                    <Select
                      mode="tags"
                      open={false}
                      size={size}
                      allowClear
                      disabled={disabled}
                      placeholder={placeholder || i18n('globe.select', '请选择')}
                      value={_.map(list, item => item.id)}
                      onDropdownVisibleChange={this.onDropdownVisibleChange}
                      onChange={this.handleChange}
                    >
                      {_.map(list, item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                    </Select>
                  }
                  <UserPickerExtendButton
                    extendFunc={extendFunc}
                    disabled={disabled}
                    size={size}
                    tabs={tabs}
                    onChange={this.props.onChange}
                    value={this.props.value}
                  />
                </div>
              )
            }
          }
        </StoreConsumer>

        <Modal
          title="人员选择"
          size="large"
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <UserPickerTable
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
