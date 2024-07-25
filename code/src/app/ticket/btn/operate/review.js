import React, { Component } from 'react'
import { Input, Form } from '@uyun/components'
const { TextArea } = Input
const FormItem = Form.Item

class ReviewModal extends Component {
    _render = () => {
      const { btnInfo } = this.props
      const { getFieldDecorator } = this.props.form
      const { messageStatus } = btnInfo
      return (<div className="review-input" style={{ marginLeft: 30, marginRight: 30 }}>
        <Form className="double-line" layout="vertical">
          {
            messageStatus === 2
            ? null
            :  <FormItem>
                {getFieldDecorator('suggestion', {
                  rules: [{
                    min: 0,
                    max: 2000,
                    message: i18n('ticket.most_200', '最多2000字')
                  }, {
                    required: +messageStatus === 1,
                    message: i18n('please-input', '请输入')
                  }]
                })(<TextArea autosize={{ minRows: 4, maxRows: 4 }} />) }
              </FormItem>
          }
        </Form>
      </div>)
    }

    render () {
      return this.props.visible && this._render()
    }
}

export default Form.create()(ReviewModal)
