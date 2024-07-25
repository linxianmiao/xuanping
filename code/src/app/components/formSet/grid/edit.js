import React, { Component } from 'react'
import { Form, Input, Radio } from '@uyun/components'
import ExternalURL from './externalURL'
const FormItem = Form.Item
const TextArea = Input.TextArea
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 }
}

class EditCard extends Component {
  render() {
    const {
      name,
      description,
      externalURL,
      externalForm = 0,
      form,
      disabled,
      existNameList = [],
      formLayoutType = 0
    } = this.props
    const { getFieldDecorator, getFieldValue } = form
    const radioBtnStyle = { width: 137, textAlign: 'center' }
    return (
      <Form className="field-card-edit-form">
        <FormItem {...formItemLayout} label={i18n('conf.model.field.card.name', '名称')}>
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (_.isEmpty(value)) {
                    callback(
                      `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                        'conf.model.field.card.name',
                        '名称'
                      )}`
                    )
                  } else if (name !== value && _.includes(existNameList, value)) {
                    callback(i18n('form.name.repeat.tip', '当前表单名称已存在,请修改'))
                  } else {
                    callback()
                  }
                }
              }
            ]
          })(
            <Input
              maxLength={20}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'conf.model.field.card.name',
                '名称'
              )}`}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('conf.model.field.card.desc', '描述')}>
          {getFieldDecorator('description', {
            initialValue: description
          })(
            <TextArea
              maxLength={50}
              autosize={{ minRows: 2, maxRows: 6 }}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'conf.model.field.card.desc',
                '描述'
              )}`}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('ciModal.type', '类型')}>
          {getFieldDecorator('externalForm', {
            initialValue: externalForm,
            rules: [{ required: true }]
          })(
            <Radio.Group disabled={disabled} buttonStyle="solid">
              <Radio.Button style={radioBtnStyle} value={0}>
                {i18n('conf.model.field.card.local.form', '本地表单')}
              </Radio.Button>
              <Radio.Button style={radioBtnStyle} value={1}>
                {i18n('conf.model.field.card.external.form', '外部表单')}
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {/* {getFieldValue('externalForm') === 0 && (
          <FormItem
            {...formItemLayout}
            label={i18n('conf.model.field.card.layout.type', '布局方式')}
          >
            {getFieldDecorator('formLayoutType', {
              initialValue: formLayoutType,
              rules: [{ required: true }]
            })(
              <Radio.Group buttonStyle="solid">
                <Radio.Button style={radioBtnStyle} value={0}>
                  {i18n('conf.model.field.card.layout.grid', '栅格式')}
                </Radio.Button>
                <Radio.Button style={radioBtnStyle} value={1}>
                  {i18n('conf.model.field.card.layout.table', '表格式')}
                </Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
        )} */}
        {getFieldValue('externalForm') === 1 && (
          <FormItem {...formItemLayout} label={i18n('conf.model.field.card.url', '外部url')}>
            {getFieldDecorator('externalURL', {
              initialValue: externalURL,
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'conf.model.field.card.url',
                    '外部url'
                  )}`
                },
                {
                  pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
                  message: i18n('conf.model.field.card.url.err', '外部url不符合规范')
                }
              ]
            })(<ExternalURL />)}
          </FormItem>
        )}
      </Form>
    )
  }
}

export default Form.create()(EditCard)
