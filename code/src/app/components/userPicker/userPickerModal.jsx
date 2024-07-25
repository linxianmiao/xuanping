import React, { Component, Children, cloneElement, Fragment } from 'react'
import { Select, Modal, Tag, message, Tooltip, Input } from '@uyun/components'
import UserPickerTable from './userPickerTable'
import { StoreConsumer, ObjectKeyToArrayType, ObjectToArray } from './config'
import UserPickerExtendButton from './userPickerExtendButton'
import classnames from 'classnames'
import styles from './index.module.less'
const Option = Select.Option
export default class UserPickerModal extends Component {
  state = {
    visible: false,
    modalValue: {},
    useVariable: false,
    departments: [],
    userInfo: {}
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
    console.log(modalValue, useVariable, '---modalValue, useVariable-1111--')
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
    const { mutex, selectionType } = this.props
    const { modalValue: prevModalValue } = this.state
    const nextModalValue = _.cloneDeep(modalValue)

    // 不同tab下的选项不能共存时
    if (selectionType === 'checkbox' && mutex) {
      Object.keys(prevModalValue).forEach((type) => {
        const typeIndex = ObjectKeyToArrayType(type)
        const nextModalValueWithType = nextModalValue.all.filter((item) => item.type === typeIndex)
        const prevModalValueWithType = prevModalValue.all.filter((item) => item.type === typeIndex)
        if (nextModalValueWithType.length === prevModalValueWithType.length) {
          nextModalValue.all = nextModalValue.all.filter((item) => item.type !== typeIndex)
        }
      })
    }
    // 部门选择单选时，控制不选中子节点
    const clickValue = _.cloneDeep(modalValue)
    if (selectionType == 'radio') {
      if (clickValue?.all.length > 1) {
        clickValue.all = clickValue.all.filter((item, i) => i == 0)
      }
      nextModalValue.all = clickValue.all
    }

    this.setState({ modalValue: nextModalValue })
  }

  onChangeUseVariable = (useVariable) => {
    this.setState({ useVariable })
  }

  queryDepartments = (userId) => {
    if (!userId) return

    axios
      .get(API.queryDepartsByUserId, { params: { uid: userId } })
      .then((res) => this.setState({ departments: res || [] }))
  }
  queryUserInfo = (userId) => {
    if (!userId) return
    axios.post(API.USER_LIST_NO_ORG, { ids: userId }).then((data) => {
      this.setState({ userInfo: (data && data[0]) || {} })
    })
  }
  handleVisibleChange = (visible, value) => {
    if (visible) {
      this.queryDepartments(value)
      this.queryUserInfo(value)
    } else {
      this.setState({ userInfo: {}, departments: [] })
    }
  }

  renderTip = (name) => {
    const { userInfo, departments } = this.state
    const departmentNames = departments.map((item) => item.departPath).join(',')
    const { account, mobilePhone, email } = userInfo
    return (
      <div>
        <div>
          <i className="iconfont icon-user2 iClass" />
          {name}
        </div>
        <div>
          <i className="iconfont icon-idcard iClass" />
          {account}
        </div>
        <div style={{ display: 'flex' }}>
          <i className="iconfont icon-liuchengtu iClass" />
          {departmentNames}
        </div>
        <div>
          <i className="iconfont icon-phone iClass" />
          {mobilePhone}
        </div>
        <div>
          <i className="iconfont icon-mail iClass" />
          {email}
        </div>
      </div>
    )
  }

  render() {
    const { value, selectionType, zIndex, modalTitle, id, isRequired, showTypes } = this.props
    const { visible, modalValue, useVariable } = this.state
    const list = ObjectToArray(value)

    return (
      <Fragment>
        <StoreConsumer>
          {({ props }) => {
            const {
              placeholder,
              children,
              mode,
              size,
              extendFunc,
              disabled,
              tabs,
              readOnlyClass,
              showTip = false
            } = props
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
                  list && list.length > 0 ? (
                    _.map(list, (item) => {
                      const matrixInfoVOS = _.map(item.matrixInfoVOS, (vos) => vos.colName).join(
                        ','
                      )
                      const name = matrixInfoVOS ? `${item.name} | ${matrixInfoVOS}` : item.name
                      return (
                        <Tag style={{ marginBottom: 8 }} key={item.id}>
                          <Tooltip
                            title={showTip ? this.renderTip(name) : item.departPath}
                            onVisibleChange={(visible) =>
                              showTip && this.handleVisibleChange(visible, item.id)
                            }
                          >
                            {name}
                          </Tooltip>
                        </Tag>
                      )
                    })
                  ) : (
                    '--'
                  )
                ) : (
                  <Select
                    mode="tags"
                    open={false}
                    disabled={isRequired === 2}
                    size={size}
                    id={id}
                    allowClear
                    placeholder={
                      isRequired === 2 ? '' : placeholder || i18n('globe.select', '请选择')
                    }
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
                          <Tooltip
                            title={showTip ? this.renderTip(name) : item.departPath}
                            onVisibleChange={(visible) =>
                              showTip && this.handleVisibleChange(visible, item.id)
                            }
                          >
                            {name}
                          </Tooltip>
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
          wrapClassName={classnames(
            styles.modal,
            Array.isArray(showTypes) && showTypes.length === 1 && showTypes[0] === 'variable_custom'
              ? styles.hidden
              : ''
          )}
          // wrapClassName={styles.hiddenModal}
          title={modalTitle || '人员选择'}
          size="large"
          width={1000}
          zIndex={zIndex}
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
          destroyOnClose
        >
          <UserPickerTable
            value={modalValue}
            selectionType={selectionType}
            useVariable={useVariable}
            onChange={this.onChangeModalValue}
            onChangeUseVariable={this.onChangeUseVariable}
          />
        </Modal>
      </Fragment>
    )
  }
}
