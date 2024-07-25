import React, { Component } from 'react'
import { Form, Modal } from '@uyun/components'
import { Common } from '../index'
import CommonConfig from '../../config/commonConfig'
import CodeEditor from '~/components/codeEditor'
import CustomizeTable from '~/ticket/forms/customizeTable/table'

const FormItem = Form.Item

class Index extends Component {
  state = {
    visible: false,
    config: this.props.fieldData.defaultValue
  }

  handleChangeVisible = () => {
    if (this.state.visible) {
      this.setState({ visible: false, config: {} })
    } else {
      try {
        let data = this.props.form.getFieldValue('defaultValue') || ''
        eval(`(${data})`)
        this.setState({ visible: true, config: data })
      } catch (e) {
        Modal.error({
          title: i18n('ticket-field-curtomizeScript-err-tip', '动态表格无法预览'),
          content: i18n('ticket-field-curtomizeScript-err-tip1', '请检查您的代码')
        })
      }
    }
  }

  handleChangeConfig = (res) => {
    this.setState({ config: res })
  }

  render () {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const { formItemLayout } = this.props
    const { visible, config } = this.state
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: CommonConfig,
      type: 'customizeTable'
    })
    const initialValue = this.props.fieldData.defaultValue
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('model.field.edit.left.customScript', '脚本')}>
          {
            getFieldDecorator('defaultValue', {
              initialValue: initialValue,
              rules: [{
                required: true,
                message: i18n('ticket-field-curtomizeScript-err-tip3', '脚本不能为空')
              }]
            })(
              <CodeEditor
                handleChangeVisible={this.handleChangeVisible}
                title={i18n('model.field.edit.left.customScript', '脚本')}
                extra={
                  <a onClick={this.handleChangeVisible}>{i18n('conf.model.yulan', '预览')}</a>
                }
              />
            )
          }
        </FormItem>
        <Modal
          destroyOnClose
          size="large"
          visible={visible}
          title={i18n('conf.model.yulan', '预览')}
          onCancel={this.handleChangeVisible}
          footer={null}>
          <CustomizeTable
            onChange={this.handleChangeConfig}
            value={config} />
        </Modal>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)
