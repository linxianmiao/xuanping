import React, { Component, Children, cloneElement, Fragment } from 'react'
import { Select, Modal, Tag, message, Tooltip } from '@uyun/components'
import ApproveModelTable from './ApproveModelTable'
import { StoreConsumer, ObjectToArray, userPickerValue } from './config'
import UserPickerExtendButton from './userPickerExtendButton'
import classnames from 'classnames'
import styles from './index.module.less'
const Option = Select.Option
export default class ApproveModel extends Component {
  state = {
    visible: false,
    modalValue: {},
    useVariable: false
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.value, prevProps.value)) {
      this.setState({ modalValue: _.cloneDeep(this.props.value) })
    }
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
    if (_.find(modalValue.matrix, (mat) => _.isEmpty(mat.matrixInfoVOS))) {
      message.error(i18n('please.select.matrix.col', '选择矩阵后请选择矩阵列'))
      return false
    }
    this.props.onChange(modalValue, useVariable)
    this.setState({ visible: false })
  }

  onCancel = () => {
    this.setState({ visible: false })
  }

  handleChange = (ids) => {
    const { value } = this.props
    const list = _.filter(value.all, (item) => {
      let key = 'id'
      if (item.type === 'users') {
        key = 'userId'
      } else if (item.type === 'groups') {
        key = 'groupId'
      }
      return _.includes(ids, item[key])
    })
    this.props.onChange({ all: list }, this.state.useVariable)
  }

  onChangeModalValue = (modalValue) => {
    const { modalValue: prevModalValue } = this.state

    const nextModalValue = _.cloneDeep(prevModalValue)
    if (Array.isArray(modalValue)) {
      nextModalValue.all = [...nextModalValue.all, ...modalValue]
    } else {
      nextModalValue.all = [...nextModalValue.all, modalValue]
    }
    // 去重
    const map = new Map()
    for (const item of nextModalValue.all) {
      if (!map.has(item.userId || item.id)) {
        map.set(item.userId || item.id, item)
      }
    }
    nextModalValue.all = [...map.values()]
    this.setState({ modalValue: nextModalValue })
  }

  handleClear = (id = '', type = null) => {
    if (type === 'all') {
      this.setState({ modalValue: userPickerValue })
    } else {
      const { modalValue } = this.state
      const prevModalValue = _.cloneDeep(modalValue)
      prevModalValue.all = _.filter(prevModalValue.all, (item) => (item.userId || item.id) !== id)
      this.setState({
        modalValue: prevModalValue
      })
    }
  }

  onChangeUseVariable = (useVariable) => {
    this.setState({ useVariable })
  }

  render() {
    const { value, selectionType, zIndex, modalTitle } = this.props
    const { visible, modalValue, useVariable } = this.state
    const list = ObjectToArray(value)
    return (
      <Fragment>
        <StoreConsumer>
          {({ props }) => {
            const { placeholder, children, mode, size, extendFunc, disabled, tabs, readOnlyClass } =
              props
            if (mode === 'custom' && children) {
              return Children.map(children, (child) =>
                cloneElement(child, {
                  onClick: () => {
                    if (typeof child.props.onClick === 'function') {
                      child.props.onClick()
                    }
                    this.onDropdownVisibleChange(true)
                  }
                })
              )
            }
            return (
              <div
                className={classnames({
                  [styles.userPickerWrap]: true,
                  [styles.disabled]: disabled
                })}
              >
                {disabled && readOnlyClass !== 'search' ? (
                  _.map(list, (item) => {
                    const matrixInfoVOS = _.map(item.matrixInfoVOS, (vos) => vos.colName).join(',')
                    const name = matrixInfoVOS ? `${item.name} | ${matrixInfoVOS}` : item.name
                    return (
                      <Tag style={{ marginBottom: 8 }} key={item.id}>
                        <Tooltip title={item.departPath}>{name}</Tooltip>
                      </Tag>
                    )
                  })
                ) : (
                  <Select
                    mode="tags"
                    open={false}
                    size={size}
                    allowClear
                    disabled={disabled}
                    placeholder={placeholder || i18n('globe.select', '请选择')}
                    value={_.map(list, (item) => item.id)}
                    onDropdownVisibleChange={this.onDropdownVisibleChange}
                    onChange={this.handleChange}
                  >
                    {_.map(list, (item) => {
                      const matrixInfoVOS = _.map(item.matrixInfoVOS, (vos) => vos.colName).join(
                        ','
                      )
                      const name = matrixInfoVOS ? `${item.name} | ${matrixInfoVOS}` : item.name
                      return (
                        <Option value={item.id} key={item.id}>
                          <Tooltip title={item.departPath}>{name}</Tooltip>
                        </Option>
                      )
                    })}
                  </Select>
                )}
                {!disabled && (
                  <UserPickerExtendButton
                    extendFunc={extendFunc}
                    disabled={disabled}
                    size={size}
                    tabs={tabs}
                    onChange={this.props.onChange}
                    value={this.props.value}
                  />
                )}
              </div>
            )
          }}
        </StoreConsumer>

        <Modal
          wrapClassName={styles.modal}
          title={modalTitle || '人员选择'}
          size="large"
          width={1000}
          zIndex={zIndex}
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
          // destroyOnClose
        >
          <ApproveModelTable
            {...this.props}
            value={modalValue}
            selectionType={selectionType}
            useVariable={useVariable}
            onChange={this.onChangeModalValue}
            onChangeUseVariable={this.onChangeUseVariable}
            handleClear={this.handleClear}
          />
        </Modal>
      </Fragment>
    )
  }
}
