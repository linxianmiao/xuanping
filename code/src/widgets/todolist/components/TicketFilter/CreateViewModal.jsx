import React, { Component } from 'react'
import { Modal, Form, Input, Button } from '@uyun/components'
import { inject } from '@uyun/core'

const FormItem = Form.Item
const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 19 } }

@Form.create()
export default class CreateViewModal extends Component {
  @inject('i18n') i18n

  state = {
    visible: false
  }

  close = () => {
    this.setState({ visible: false })
  }

  open = () => {
    const { viewId, viewName } = this.props
    if (viewId) {
      Modal.confirm({
        title: this.i18n('sure-to-update-view', '确定要更新{viewName}视图吗？', { viewName }),
        onOk: () => {
          this.props.onOk({ name: viewName, viewId })
        }
      })
    } else {
      this.setState({ visible: true })
    }
  }

  handleOk = () => {
    this.props.form.validateFields((error, values) => {
      if (error) return
      this.props.onOk(values)
      this.close()
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { visible } = this.state
    return (
      <>
        <Button size="small" type="primary" onClick={this.open}>{this.i18n('globe.save', '保存')}</Button>
        <Modal
          title={this.i18n('save-view', '保存视图')}
          visible={visible}
          onCancel={this.close}
          onOk={this.handleOk}
          destroyOnClose
        >
          <Form>
            <FormItem {...formItemLayout} label={this.i18n('view-name', '视图名称')}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: this.i18n('please-input-view-name', '请输入视图名称'), whitespace: true }]
              })(<Input maxLength={20} />)}
            </FormItem>
          </Form>
        </Modal>
      </>
    )
  }
}
