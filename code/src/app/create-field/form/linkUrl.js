import React, { Component } from 'react'
import { Form, Select, Input } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option
const protocols = ['http://', 'https://']

class LinkUrl extends Component {
  change = (type, value) => {
    const { setFieldsValue } = this.props
    if (type === 'linkUrl') {
      if (value.target.value && value.target.value.indexOf(protocols[0]) > -1) {
        value.target.value = value.target.value && value.target.value.substring(7)
        setFieldsValue && setFieldsValue({ linkProtocol: 'http://' })
      }
      if (value.target.value && value.target.value.indexOf(protocols[1]) > -1) {
        value.target.value = value.target.value && value.target.value.substring(8)
        setFieldsValue && setFieldsValue({ linkProtocol: 'https://' })
      }
    }
    setFieldsValue && setFieldsValue({ [type]: value })
  }

  // handleRule = (callback) => {
  //   const { getFieldValue } = this.props
  //   if (getFieldValue('linkName') && !getFieldValue('linkUrl')) {
  //     callback(i18n('menuModal.tip3', '填写链接名称后，链接地址不能为空'))
  //   } else {
  //     callback()
  //   }
  // }

  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, fieldData } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator('linkProtocol', {
          initialValue: fieldData.linkProtocol
          // rules: [{
          //   validator: (rule, value, callback) => { this.handleRule(callback) }
          // }]
        })(
          <Select
            style={{ width: '100px' }}
            onChange={value => {
              this.change('linkProtocol', value)
            }}
          >
            <Option key={'http://'}>{'http://'}</Option>
            <Option key={'https://'}>{'https://'}</Option>
          </Select>
        )}
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <Input
            placeholder={i18n('menuModal.tip2', '请输入URL')}
            style={{ width: '200px', marginLeft: '10px' }}
            onChange={value => {
              this.change('linkUrl', value)
            }}
          />
        )}
      </FormItem>
    )
  }
}

export default LinkUrl
