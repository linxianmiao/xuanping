import React, { Component } from 'react'
import { Form, Input, Checkbox } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { i18n } from '../utils'
import FieldGroupLazySelect from './fieldGroupLazySelect'

const FormItem = Form.Item

@inject('createFieldStore')
@observer
class Common extends Component {
  static defaultProps = {
    goHome: () => {},
    isEdit: true
  }

  state = {
    loading: false
  }

  componentDidMount() {
    this.props.createFieldStore.getLayouts()
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return
      this.setState({ loading: true })
      const { id } = this.props.fieldData || {}
      let data = _.assign(
        {},
        {
          type: 'relateTicketNum',
          typeDesc: i18n('relate-ticket', '关联工单'),
          id
        },
        values
      )
      data.layoutId = _.get(data, 'layoutInfoVo.key')
      data = _.omit(data, 'layoutInfoVo')

      if (this.props.modelId) {
        data.modelId = this.props.modelId
      }

      const res = await this.props.createFieldStore.onSaveField(data)
      this.setState({ loading: false })
      // 成功以后返回字段列表
      this.props.goHome()
    })
  }

  render() {
    const { formItemLayout, isEdit } = this.props
    const { getFieldDecorator } = this.props.form
    const { name, code, layoutInfoVo, privacy, fieldDesc, id } = this.props.fieldData || {}
    const { loading } = this.state
    const { id: layoutId, name: layoutName } = layoutInfoVo || {}
    return (
      <Form>
        <FormItem {...formItemLayout} label={i18n('field-name', '字段名称')}>
          {getFieldDecorator('name', {
            initialValue: name || undefined,
            rules: [
              {
                type: 'string',
                whitespace: true,
                required: true,
                message: i18n('field-name-placeholder', '请输入字段名称')
              }
            ]
          })(
            <Input placeholder={i18n('field-name-placeholder', '请输入字段名称')} maxLength={32} />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('field-layout', '字段分组')}>
          {getFieldDecorator('layoutInfoVo', {
            initialValue: layoutId ? { key: layoutId, label: layoutName } : undefined,
            rules: [
              {
                required: true,
                message: i18n('field-layout-placeholder', '请选择字段分组')
              }
            ]
          })(<FieldGroupLazySelect labelInValue />)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('field-code', '字段编码')}>
          {getFieldDecorator('code', {
            initialValue: code || undefined,
            rules: [
              {
                type: 'string',
                whitespace: true,
                required: true,
                message: i18n('field-code-placeholder', '请输入字段编码')
              },
              {
                pattern: /^[a-zA-Z]+$/,
                message: i18n('field-code-err1', '字段编码只能是英文')
              }
            ]
          })(<Input maxLength={20} disabled={!!id} />)}
        </FormItem>

        {this.props.children}

        <FormItem {...formItemLayout} label={i18n('privacy', '隐私')}>
          {getFieldDecorator('privacy', {
            initialValue: privacy || undefined
          })(<Checkbox>{i18n('privacy-label', '仅工单经办人员可见')}</Checkbox>)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('field-desc', '字段说明')}>
          {getFieldDecorator('fieldDesc', {
            initialValue: fieldDesc || undefined
          })(<Input.TextArea />)}
        </FormItem>
      </Form>
    )
  }
}

export default Common
