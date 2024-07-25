import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import Actions from './Actions'
// import GroupsModal from './GroupsModal'
import GroupsModal from './GroupSelectModal'
import Panels from './Panels'
import PermissionStore from './PermissionStore'

@inject('permissionListStore')
@observer
class Permission extends Component {
  constructor(props) {
    super(props)

    this.store = new PermissionStore()
    const { code, isRequired } = props.field
    props.permissionListStore.push({
      isRequired,
      fieldCode: code,
      store: this.store
    })

    this.state = {
      visible: false,
      serviceCode: ''
    }
  }

  // 清空权限自服务数据有问题，比如新建关联工单后点击关联工单，数据仍是主单的
  // componentWillUnmount() {
  //   const { field, permissionListStore } = this.props
  //   permissionListStore.removeStoreByFieldCode(field.code)
  // }

  handleActionClick = (serviceCode, appId) => {
    this.setState({ serviceCode })
    if (serviceCode === '0') {
      this.store.addSelectionGroup(3)
    } else if (serviceCode === '1') {
      this.store.addSelectionGroup(4)
    } else if (serviceCode === '2') {
      this.store.addNewGroup()
    } else {
      this.setState({
        visible: true
      })
    }
  }

  handleGroupsModalClose = () => {
    this.setState({
      serviceCode: '',
      visible: false
    })
  }

  getDisabled = () => {
    const { disabled } = this.props
    const { panels } = toJS(this.store)

    return disabled || panels.some((item) => item.status === 2 || item.status === 3)
  }

  render() {
    const { field, fieldMinCol, secrecy, formLayoutType } = this.props
    const { visible, serviceCode } = this.state
    const { fieldValidateInfo } = this.store
    const { permissionServiceCode, serviceRange, isRequired } = field
    const disabled = this.getDisabled()

    if (secrecy) {
      return (
        <FormItem
          field={field}
          fieldMinCol={fieldMinCol}
          required={isRequired === 1}
          {...fieldValidateInfo}
        >
          <Secrecy />
        </FormItem>
      )
    }

    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        required={isRequired === 1}
        {...fieldValidateInfo}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {!disabled && (
          <Actions
            serviceCodes={permissionServiceCode || []}
            serviceRange={serviceRange || []}
            onClick={this.handleActionClick}
            isRequired={isRequired}
          />
        )}

        <Panels
          store={this.store}
          disabled={disabled}
          serviceRange={serviceRange || []}
          serviceCode={serviceCode}
          isRequired={isRequired}
        />

        <GroupsModal
          store={this.store}
          visible={visible}
          fieldCode={field.code}
          serviceCode={serviceCode}
          serviceRange={serviceRange || []}
          onClose={this.handleGroupsModalClose}
        />
      </FormItem>
    )
  }
}
export default Permission
