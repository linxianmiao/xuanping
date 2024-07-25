import React, { Component } from 'react'
import { Select, Form } from '@uyun/components'
import CIPicker, { ClassPicker } from '@uyun/ec-ci-picker'

const FormItem = Form.Item

class CI extends Component {
  state = {
    visible: false
  }

  handleCancel =() => {
    this.setState({ visible: false })
  }

  onChange = ([selectedRow, relationSelectedRow, appSelectedRow]) => {
    const { code } = this.props.item
    const selectedList = _.map(selectedRow, item => ({
      id: item.id,
      name: item.name,
      className: item.className
    }))
    this.setState({
      visible: false
    })
    this.props.setFieldsValue({ [code]: selectedList })
  }

  getValue = selectedList => _.map(selectedList, item => item.id)

  render () {
    const { item, value } = this.props

    const content = [
      <ClassPicker
        key="CLASS"
        selectedRow={value || []}
      />
    ]
    return (
      <CIPicker onChange={this.onChange} content={content}>
        <Select
          mode="multiple"
          size="small"
          allowClear
          value={this.getValue(value)}
          placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
          onChange={value => {
            this.props.setFieldsValue({ [item.code]: _.filter(value, item => _.includes(value, item.id)) || [] })
          }}
        >
          {_.map(value, item => {
            return (
              <Select.Option key={item.id}>
                {item.name}
              </Select.Option>
            )
          })}
        </Select>

      </CIPicker>
    )
  }
}
export default class Resource extends Component {
  render () {
    const { item, formItemLayout, getFieldDecorator, setFieldsValue, defaultValue } = this.props

    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <CI item={item} setFieldsValue={setFieldsValue} />
        )}
      </FormItem>
    )
  }
}
