import { inject, I18n } from '@uyun/core'
import React, { Component } from 'react'
import { Form, Input, message } from '@uyun/components'
import { ModellistStore } from './modellist.store'
import ModelSelect from './components/ModelSelect'

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
  @inject(ModellistStore) store

  @inject('api') api

  @inject('i18n') i18n

  modelSelectRef = React.createRef()

  render () {
    // const { getFieldDecorator } = this.props.form
    return (
      // <Form>
      //   {getWidgetFormModle(this.props.formData).map(
      //     ({ FormItem, getFieldDecorator: { name, component, ...options } }) => {
      //       return <Form.Item {...FormItem}>{getFieldDecorator(name, options)(component)}</Form.Item>
      //     }
      //   )}
      // </Form>
      <ModelSelect ref={this.modelSelectRef} />
    )
  }

  onSubmit = ({ close, loading }) => {
    // close 关闭弹框
    // loading(true | false) 确定按钮loading
    if (this.modelSelectRef.current) {
      const modelIds = this.modelSelectRef.current._getSelectedModelIds()

      loading(true)
      this.api.saveSelectedModels(modelIds).then(res => {
        loading(false)
        if (res === '200') {
          message.success(this.i18n('save.success', '保存成功'))
          close()
          this.store.getSelectedModels()
        } else {
          message.error(this.i18n('save.fail', '保存失败'))
        }
      })
    }
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
