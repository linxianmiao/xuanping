import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Modal, Collapse, Checkbox, Row, Col } from '@uyun/components'
import { filterAddUsers, filterRemoveUsers, findRolesByIds } from '../logic'
import * as R from 'ramda'

const CheckboxGroup = Checkbox.Group

@observer
export default class RemoveRoleModal extends Component {
  state = {
    visible: false
  }

  get store() {
    return this.props.store
  }

  openModal = (group) => {
    this.store.setProps({
      currentGroup: group,
      selectedRoleIds: R.pluck('roleId', filterRemoveUsers(group.relatedRoles))
    })
    this.setState({ visible: true })
  }

  closeModal = () => {
    this.setState({ visible: false }, () => {
      this.store.setProps({
        currentGroup: null,
        selectedRoleIds: []
      })
    })
  }

  handleCheckboxGroupChange = (values) => {
    this.store.setProps({ selectedRoleIds: values })
  }

  submitModal = () => {
    const { currentGroup, selectedRoleIds } = this.store
    const addRoles = filterAddUsers(currentGroup.relatedRoles)
    const selectedRoles = findRolesByIds(currentGroup.roleList, selectedRoleIds)
    currentGroup.relatedRoles = [...addRoles, ...selectedRoles]
    this.closeModal()
  }

  render() {
    const { group } = this.props
    const { visible } = this.state
    const { currentGroup, selectedRoleIds } = this.store
    const roleList = currentGroup ? currentGroup.roleList : []
    const appIds = R.pluck('appId', roleList)
    return (
      <>
        {React.Children.map(this.props.children, (child) =>
          React.cloneElement(child, {
            onClick: () => this.openModal(group)
          })
        )}

        <Modal
          title={i18n('remove-permission-role', '移除角色')}
          visible={visible}
          onCancel={this.closeModal}
          size="large"
          className="permission-role-modal"
          onOk={this.submitModal}
        >
          {roleList.length > 0 && (
            <Collapse defaultActiveKey={appIds}>
              {roleList.map((group) => {
                const { appId, roles, name } = group
                return (
                  <Collapse.Card key={appId} header={name}>
                    <CheckboxGroup
                      style={{ width: '100%' }}
                      onChange={this.handleCheckboxGroupChange}
                      value={toJS(selectedRoleIds)}
                      className="permission-checkbox-group"
                    >
                      <Row>
                        {roles.map((role) => {
                          const { roleId, roleName } = role
                          return (
                            <Col key={roleId} span={6}>
                              <Checkbox value={roleId}>{roleName}</Checkbox>
                            </Col>
                          )
                        })}
                      </Row>
                    </CheckboxGroup>
                  </Collapse.Card>
                )
              })}
            </Collapse>
          )}
        </Modal>
      </>
    )
  }
}
