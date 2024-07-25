import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Tag } from '@uyun/components'
import UserPicker from '~/components/userPicker'
export default class CounterSign extends Component {
  static defaultProps = {
    handleUserChange: () => {}
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  onChange = (data, useVariable) => {
    this.props.handleUserChange(data, useVariable)
  }

  handleClose = (e, id) => {
    const { values, useVariable } = this.props
    e.stopPropagation()
    this.props.handleUserChange(
      _.filter(values, (item) => item.id !== id),
      useVariable
    )
  }

  render() {
    const {
      values,
      useVariable,
      tabs,
      isShared,
      cooperateTenant = {},
      showTypes = undefined,
      modalTitle = ''
    } = this.props

    return (
      <UserPicker
        extendQuery={{
          modelId: this.context.modelId,
          isShared,
          tenantId: cooperateTenant?.tenantId
        }}
        mode="custom"
        tabs={tabs || [0, 1, 2, 3, 4, 5]}
        showTypes={
          showTypes || [
            'users',
            'groups',
            'departs_custom',
            'roles_custom',
            'duty_custom',
            'variable_custom'
          ]
        }
        value={values}
        useVariable={useVariable}
        onChange={this.onChange}
        modalTitle={modalTitle}
      >
        <div>
          {_.map(values, (value) => (
            <Tag
              style={{ marginBottom: '8px' }}
              onClose={(e) => {
                this.handleClose(e, value.id)
              }}
              closable
              key={value.id}
            >
              {value.name}
            </Tag>
          ))}
        </div>
        <Button type="dashed" size="small" style={{ width: '100%' }}>
          {i18n('add', '添加')}
        </Button>
      </UserPicker>
    )
  }
}
