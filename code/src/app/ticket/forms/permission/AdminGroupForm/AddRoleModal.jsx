import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import * as R from 'ramda'
import { Modal, Input, Collapse, Checkbox, Row, Col } from '@uyun/components'
import { filterRoleList, findRolesByIds, flatRoleList, validateApp } from '../logic'

const Search = Input.Search
const CheckboxGroup = Checkbox.Group

@observer
export default class AddRoleModal extends Component {
  state = {
    visible: false,
    keyword: ''
  }

  get store() {
    return this.props.store
  }

  openModal = (group) => {
    if (!group.appId) {
      group.appInfo = validateApp(group.appId)
      return
    }

    this.store.setProps({ currentPanel: group })
    this.store.listGroupAddableRole()
    this.setState({ visible: true })
  }

  closeModal = () => {
    this.setState({ visible: false }, () => {
      this.store.setProps({
        currentPanel: null,
        addableRoleList: [],
        selectedRoleIds: []
      })
    })
  }

  submitModal = () => {
    const { selectedRoleIds, currentPanel, addableRoleList } = this.store
    const addableRoleIds = R.pluck('roleId', flatRoleList(addableRoleList))
    const selectedRoles = findRolesByIds(addableRoleList, selectedRoleIds)
    const remainRoles = currentPanel.relatedRoles.filter(
      (role) => !addableRoleIds.includes(role.roleId)
    )
    this.store.currentPanel.relatedRoles = [...selectedRoles, ...remainRoles]
    this.closeModal()
  }

  handleRoleKeywordChange = (e) => {
    this.setState({ keyword: e.target.value })
  }

  handleCheckboxGroupChange = (values) => {
    this.store.setProps({ selectedRoleIds: values })
  }

  render() {
    const { group } = this.props
    const { visible, keyword } = this.state
    const { addableRoleList, selectedRoleIds } = this.store
    const appIds = R.pluck('appId', addableRoleList)
    const filteredList = filterRoleList(addableRoleList, keyword)

    return (
      <>
        {React.Children.map(this.props.children, (child) =>
          React.cloneElement(child, {
            onClick: () => this.openModal(group)
          })
        )}

        <Modal
          title={i18n('add-permission-role', '添加角色')}
          visible={visible}
          onCancel={this.closeModal}
          size="large"
          className="permission-role-modal"
          onOk={this.submitModal}
        >
          <Search
            value={keyword}
            onChange={this.handleRoleKeywordChange}
            className="permission-role-modal-input"
            allowClear
            placeholder={i18n('input-keyword', '请输入关键字')}
          />
          {addableRoleList.length > 0 && (
            <Collapse defaultActiveKey={appIds}>
              {filteredList.map((group) => {
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
