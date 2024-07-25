import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Input, Form, Button } from '@uyun/components'
@Form.create()
@inject('entrustStore')
@observer
export default class EntrustCheckModal extends Component {
  state = {
    loading: false
  }

  check = value => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) return false
      const { desc } = values
      const { checkModalDetail } = this.props
      this.setState({ loading: true })
      await this.props.entrustStore.entrustCheck({ id: checkModalDetail.id, auditComments: desc, auditStatus: value })
      this.setState({ loading: false })
      this.props.getList()
      this.props.handleCheckModalDetail()
    })
  }

  render() {
    const { checkModalDetail, handleCheckModalDetail } = this.props
    const { getFieldDecorator } = this.props.form
    const { loading } = this.state
    return (
      <Modal
        title="委托审核"
        destroyOnClose
        confirmLoading={loading}
        visible={Boolean(checkModalDetail)}
        onCancel={() => { handleCheckModalDetail() }}
        onOk={this.onOk}
        footer={
          <React.Fragment>
            <Button type="primary" onClick={() => { this.check(1) }}>通过 </Button>
            <Button type="primary" onClick={() => { this.check(2) }}>不通过</Button>
            <Button onClick={() => { handleCheckModalDetail() }}>取消</Button>
          </React.Fragment>
        }
      >
        <Form>
          <Form.Item label="意见">
            {getFieldDecorator('desc', {
              rules: [{ required: false, message: 'Please input your username!' }]
            })(
              <Input.TextArea
                placeholder="请输入意见"
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
