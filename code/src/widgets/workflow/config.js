import { inject, I18n } from '@uyun/core'
import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import { WorkflowStore } from './workflow.store'

// 业务部件表单配置
// 这个组件必须是 @Form.create() 包装的组件

const getWidgetFormModle = values => [
  {
    FormItem: {
      label: 'Note',
      labelCol: { span: 5 },
      wrapperCol: { span: 12 }
    },
    getFieldDecorator: {
      name: 'note',
      initialValue: values['note'],
      rules: [{ required: true, message: <I18n.Text name="note" /> }],
      component: <Input />
    }
  }
]

@Form.create()
export default class Config extends Component {
  @inject(WorkflowStore) store

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <Form>
        {getWidgetFormModle(this.props.formData).map(
          ({ FormItem, getFieldDecorator: { name, component, ...options } }) => {
            return <Form.Item {...FormItem}>{getFieldDecorator(name, options)(component)}</Form.Item>
          }
        )}
      </Form>
    )
  }

  onSubmit = ({ close, loading }) => {
    // close 关闭弹框
    // loading(true | false) 确定按钮loading
    this.props.form.validateFields((err, values) => !err && this.store.setWidgetConfig(values))
  }

  componentDidMount () {
    // 点击业务部件弹框中 `确定` 按钮执行 `this.onSubmit` 方法
    this.props.onSubmitNext(this.onSubmit)
    this.props.onCancelNext(() => {
      // 点击业务部件弹框中 `×` 按钮执行
      // 返回 false 表示关闭，true 表示不允许关闭，支持返回一个Promise对象
      return false
    })
  }
}
