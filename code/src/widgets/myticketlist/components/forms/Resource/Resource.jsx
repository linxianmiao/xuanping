import React, { Component } from 'react'
import { Select } from '@uyun/components'
import CIPicker, { ClassPicker } from '@uyun/ec-ci-picker'
import { inject } from '@uyun/core'

export default class Resource extends Component {
  @inject('i18n') i18n

  state = {
    visible: false
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  onChange = ([selectedRow, relationSelectedRow, appSelectedRow]) => {
    const { code } = this.props.item
    const selectedList = _.map(selectedRow, (item) => ({
      id: item.id,
      name: item.name,
      className: item.className
    }))
    this.setState({
      visible: false
    })
    this.props.setFieldsValue({ [code]: selectedList })
  }

  getValue = (selectedList) => _.map(selectedList, (item) => item.id)

  render() {
    const { item, value, disabled } = this.props

    const content = [<ClassPicker key="CLASS" selectedRow={value || []} />]
    const val = _.map(value, (v) => ({ key: v.id, label: v.name }))
    return (
      <React.Fragment>
        {disabled ? (
          <Select
            value={val}
            disabled
            size="small"
            mode={'multiple'}
            labelInValue
            placeholder={`请选择${item.name}`}
          />
        ) : (
          <CIPicker onChange={this.onChange} content={content} disabled>
            <Select
              mode="multiple"
              size="small"
              allowClear
              disabled={disabled}
              value={this.getValue(value)}
              placeholder={`请选择${item.name}`}
              onChange={(value) => {
                this.props.setFieldsValue({
                  [item.code]: _.filter(value, (item) => _.includes(value, item.id)) || []
                })
              }}
            >
              {_.map(value, (item) => {
                return <Select.Option key={item.id}>{item.name}</Select.Option>
              })}
            </Select>
          </CIPicker>
        )}
      </React.Fragment>
    )
  }
}
