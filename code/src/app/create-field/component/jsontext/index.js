import React, { Component } from 'react'
import { Form } from '@uyun/components'
import CommonConfig from '~/create-field/config/commonConfig'
import CodeEditor from '~/components/codeEditor'
import Common from '../common'
import { validJson } from '~/ticket/forms/utils/validatorField'

@Form.create({
  onValuesChange: props => { props.onValuesChange && props.onValuesChange() }
})
export default class JSONText extends Component {
  validator = (rule, value, callback) => {
    const { isError, errorMes } = validJson(null, value)

    if (isError) {
      callback(errorMes)
    } else {
      callback()
    }
  }

  render () {
    const { formItemLayout } = this.props
    const { getFieldDecorator } = this.props.form
    const diliver = _.merge(
      {},
      this.props,
      {
        getFieldDecorator,
        config: CommonConfig,
        type: 'jsontext'
      }
    )

    return (
      <Common {...diliver}>
        <Form.Item {...formItemLayout} label={i18n('default_value', '默认值')}>
          {getFieldDecorator('defaultValue', {
            initialValue: this.props.store.fieldData.defaultValue || undefined,
            rules: [{
              validator: this.validator
            }]
          })(
            <CodeEditor
              title="JSON"
            />
          )}
        </Form.Item>
      </Common>
    )
  }
}
