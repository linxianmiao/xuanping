import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Select, Form, message } from '@uyun/components'
import CIPicker, { ClassPicker } from '@uyun/ec-ci-picker'

const FormItem = Form.Item

@inject('globalStore')
@observer
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
    const { item, value, disabled } = this.props
    const { productNum } = this.props.globalStore
    const content = [
      <ClassPicker
        key="CLASS"
        selectedRow={value || []}
      />
    ]
    const val = _.map(value, v => ({ key: v.id, label: v.name }))

    return (
      <React.Fragment>
        {disabled
          ? <Select
            value={val}
            disabled
            size="small"
            mode="multiple"
            labelInValue
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
          />
          : <CIPicker onChange={this.onChange} content={content}>
            <div onClick={e => {
              if (!productNum.cmdb) {
                e.stopPropagation()
                message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
              }
            }}>
              <Select
                mode="multiple"
                size="small"
                allowClear
                open={false}
                value={this.getValue(value)}
                placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
                onChange={value => { this.props.setFieldsValue({ [item.code]: _.filter(value, item => _.includes(value, item.id)) || [] }) }}
              >
                {_.map(value, item => <Select.Option key={item.id}>{item.name}</Select.Option>)}
              </Select>
            </div>
          </CIPicker>

        }
      </React.Fragment>
    )
  }
}
export default class Resource extends Component {
  render () {
    const { item, formItemLayout, getFieldDecorator, setFieldsValue, defaultValue, disabled, label } = this.props
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <CI item={item} setFieldsValue={setFieldsValue} disabled={disabled} />
        )}
      </FormItem>
    )
  }
}
