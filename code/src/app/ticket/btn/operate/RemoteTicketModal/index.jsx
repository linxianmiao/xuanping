import React, { Component } from 'react'
import { Modal, Form, Select } from '@uyun/components'
import Editor from '../../../mention/MentionWithOption'

const FormItem = Form.Item
const { Option } = Select

class EditWrapper extends Component {
  render() {
    const { value, onChange } = this.props

    return <Editor val={value} handleChange={onChange} />
  }
}

@Form.create()
export default class RemoteTicketModal extends Component {
  static defaultProps = {
    nodeList: [],
    confirmLoading: false,
    visible: false,
    onOk: () => {},
    onCancel: () => {},
    btnInfo: {}
  }

  handleOk = () => {
    this.props.form.validateFields((error, values) => {
      if (error) return
      this.props.onOk(values)
    })
  }

  render() {
    const { visible, nodeList, confirmLoading, onCancel, btnInfo } = this.props
    const { getFieldDecorator } = this.props.form
    const { modalTitle, messageName, messageStatus } = btnInfo

    return (
      <Modal
        title={modalTitle || '远程工单'}
        destroyOnClose
        confirmLoading={confirmLoading}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <Form>
          <FormItem label="远程节点">
            {getFieldDecorator('targetNodeId', {
              rules: [
                {
                  required: true,
                  message: '请选择远程节点'
                }
              ]
            })(
              <Select placeholder="请选择远程节点">
                {nodeList.map((item) => (
                  <Option key={item.nodeId}>{item.nodeName}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          {messageStatus === 2 ? null : (
            <FormItem label={messageName || i18n('ticket.detail.opinion', '意见')}>
              {getFieldDecorator('message', {
                initialValue: undefined,
                rules: [
                  {
                    min: 0,
                    max: 2000,
                    message: i18n('ticket.most_200', '最多2000字')
                  },
                  {
                    required: +messageStatus === 1,
                    message: i18n('please-input', '请输入')
                  }
                ],
                getValueFromEvent: function (data) {
                  return data
                }
              })(<EditWrapper />)}
            </FormItem>
          )}
        </Form>
      </Modal>
    )
  }
}
