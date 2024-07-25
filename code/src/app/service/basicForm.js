import React, { Component } from 'react'
import { Form } from '@uyun/components'
const FormItem = Form.Item
class BasicForm extends Component {
  render () {
    const { formItemLayout, serviceData } = this.props
    const { name = '', time_policy = {}, resp_person = '', tel_num = '', description = '' } = serviceData
    return (
      <Form>
        <FormItem {...formItemLayout} label={'名称'}>{name}</FormItem>
        <FormItem {...formItemLayout} label={'服务时间'}>{_.get(time_policy, 'name')}</FormItem>
        <FormItem {...formItemLayout} label={'责任人'}>{resp_person}</FormItem>
        <FormItem {...formItemLayout} label={'联系方式'}>{tel_num}</FormItem>
        <FormItem {...formItemLayout} label={'服务描述'}>{description}</FormItem>
      </Form>
    )
  }
}
export default BasicForm
