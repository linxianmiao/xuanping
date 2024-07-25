import React, { Component } from 'react'
import { Form, Input, Checkbox } from '@uyun/components'
import UserPicker from '~/components/userPicker'

class CarbonCopyForm extends Component {
  state = {
    modes: [] // 抄送方式
  }

  componentDidMount() {
    axios.get(API.getActionListByType(3)).then((res) => {
      if (res && res.length > 0) {
        this.setState(
          {
            modes: res
              .filter((item) => item.name)
              .map((item) => ({ label: item.name, value: item.type }))
          },
          () => {
            // 默认选中站内信
            const { modes } = this.state
            const defaultOption = modes.find((item) => item.value === 'sendSys')

            if (defaultOption) {
              this.props.form.setFieldsValue({
                types: [defaultOption.value]
              })
            }
          }
        )
      }
    })
  }

  render() {
    const { messageName, messageStatus } = this.props
    const { getFieldDecorator } = this.props.form
    const { modes } = this.state

    return (
      <Form layout="vertical">
        <Form.Item label={i18n('carbon.copy.person', '抄送人')} required>
          {getFieldDecorator('userAndGroup', {
            initialValue: undefined,
            rules: [
              {
                required: true,
                message: i18n('please.select.cc.person')
              }
            ]
          })(
            <UserPicker
              tabs={[0, 1]}
              showTypes={['groups', 'users']}
              // mode={'approve'}
            />
          )}
        </Form.Item>
        <Form.Item label={i18n('carbon.copy.mode', '抄送方式')} required>
          {getFieldDecorator('types', {
            initialValue: undefined,
            rules: [
              {
                required: true,
                message: i18n('please.select.cc.mode')
              }
            ]
          })(<Checkbox.Group options={modes} />)}
        </Form.Item>
        {messageStatus === 2 ? null : (
          <Form.Item label={messageName || i18n('ticket.detail.opinion', '意见')} required>
            {getFieldDecorator('message', {
              initialValue: undefined,
              rules: [
                {
                  required: +messageStatus === 1,
                  message: i18n('please-input', '请输入')
                }
              ]
            })(<Input.TextArea autosize={{ minRows: 4, maxRows: 4 }} />)}
          </Form.Item>
        )}
      </Form>
    )
  }
}

export default Form.create()(CarbonCopyForm)
