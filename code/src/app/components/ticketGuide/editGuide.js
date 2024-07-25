import React from 'react'
import { Form, Checkbox, Alert } from '@uyun/components'
import SimpEditor from '~/components/SimpEditor'

const FormItem = Form.Item
const formItemLayout = {
  wrapperCol: { span: 24 }
}

class EditGuide extends React.Component {
  render() {
    const { form, operateGuide, isOperateGuide, id } = this.props
    const { getFieldDecorator } = form
    return (
      <Form>
        <Alert message={i18n('editGuide.info', '用于指引工单处理人按照一定规则编写和修改表单数据')} type="info" showIcon />
        <FormItem {...formItemLayout}>
          {getFieldDecorator('isOperateGuide', { initialValue: Boolean(isOperateGuide), valuePropName: 'checked' })(
            <Checkbox>{i18n('show-flow-guide-default', '默认显示流程指引')}</Checkbox>
          )}
        </FormItem>
        <FormItem {...formItemLayout}>
          {getFieldDecorator('operateGuide', { initialValue: operateGuide || undefined })(
            <SimpEditor code="editGuide" ticketId={id} />
          )}
        </FormItem>
      </Form>
    )
  }
}

export default Form.create()(EditGuide)
