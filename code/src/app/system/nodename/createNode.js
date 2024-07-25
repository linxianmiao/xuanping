import React from 'react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item
const { TextArea } = Input
class CreateNode extends React.Component {
    handleCheckSingleRowText = (item, rule, value, callback) => {
      const codeReg = /^[a-zA-Z]+$/
      const myReg = /^([\u4e00-\u9fa5a-zA-Z0-9 ]+)$/
      if (!_.trim(value) && item.required) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
      } else {
        if (item.code === 'name' && (!myReg.test(value))) {
          callback(i18n('field_create_name_error', '不能包含特殊字符'))
        }
        if (item.code === 'code' && (!codeReg.test(value))) {
          callback(i18n('field_create_code_error', '编码只能为英文'))
        }
        if (rule.max && value.length > rule.max) {
          callback(`${i18n('ticket.forms.beyond', '不能超出')}${rule.max}${i18n('ticket.forms.character', '字符')}`)
        } else if (rule.min && value.length < rule.min) {
          callback(`${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n('ticket.forms.character', '字符')}`)
        } else {
          callback()
        }
      }
    }

    checkCode = (rule, value, callback) => {
      const regExp = /[^A-Za-z]/g
      if (regExp.test(value)) {
        callback(i18n('field_create_code_error', '编码只能为英文'))
      }
      callback()
    }

    render() {
      const { editData = {} } = this.props
      const { getFieldDecorator } = this.props.form
      const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } }
      return (
        <Form>
          <FormItem {...formItemLayout} label={i18n('node_name', '节点名称')}>
            {
              getFieldDecorator('name', {
                initialValue: editData.name || '',
                rules: [{
                  required: true,
                  whitespace: true,
                  message: i18n('ticket.forms.pinputName', '请输入名称')
                }, {
                  max: 50,
                  message: i18n('ticket.forms.NodeNameLength', '节点名称最长50个字符')
                }, {
                  pattern: /^((?!&|;|$|%|>|<|`|"|\\|!|\|).)*$/,
                  message: i18n('ticket.true.name', '名称不能含有特殊字符')
                }]
              })(
                <Input type="text" />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('field_code', '编码')}>
            {
              getFieldDecorator('code', {
                initialValue: editData.code || '',
                rules: [
                  { required: true, message: i18n('ticket.forms.inputParamCode', '请输入编码') },
                  { max: 20, message: i18n('param_create_code', '变量编码长度在6~20字符') },
                  { min: 6, message: i18n('param_create_code', '变量编码长度在6~20字符') },
                  {
                    pattern: /^[a-zA-Z]+$/,
                    message: i18n('field_create_code_error', '编码只能为英文')
                  }
                ]
              })(
                <Input type="text" disabled={Boolean(editData.id)} />
              )
            }
          </FormItem>
          <FormItem {...formItemLayout} label={i18n('listSel.input_tips3', '描述')}>
            {getFieldDecorator('description', {
              rules: [{ max: 50, message: i18n('param_create_descr_50', '描述最大长度为50') }],
              initialValue: editData.description || ''
            })(
              <TextArea rows={3} placeholder={i18n('ticket.forms.pinput', '请输入') + i18n('listSel.input_tips3', '描述')} />
            )}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('id', {
              initialValue: editData.id || ''
            })(
              <div />
            )}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('version', {
              initialValue: editData.version || null
            })(
              <div />
            )}
          </FormItem>
        </Form>
      );
    }
}
const CreateNodeWrap = Form.create()(CreateNode)
export default CreateNodeWrap
