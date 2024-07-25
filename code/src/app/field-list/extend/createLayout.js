import React, { Component } from 'react'
import { Modal, Input, Form, message } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const { Item: FormItem, create } = Form

@inject('fieldListExtendStore')
@observer
@create()
class CreateLayout extends Component {
  state = {
    loading: false
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) {
        return false
      }
      this.setState({ loading: true })
      const { item } = this.props
      const { id } = item || {}
      let res
      if (id) {
        res = await this.props.fieldListExtendStore.onUpdateLayout(_.assign({}, { id }, values))
      } else {
        res = await this.props.fieldListExtendStore.onCreateLayout(values)
      }
      this.setState({ loading: false })
      if (+res === 200) {
        const data = id
          ? i18n('ticket.from.update.sucess', '更新成功')
          : i18n('ticket.kb.success', '创建成功')
        message.success(data)
        this.props.onVisibleChange('', null)
        this.props.fieldListExtendStore.getLayouts()
        if (id) {
          this.props.fieldListExtendStore.getFieldList()
        }
      }
    })
  }

  render() {
    const { visible } = this.props
    const { getFieldDecorator } = this.props.form
    const { name } = this.props.item || {}
    const { loading } = this.state
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    return (
      <Modal
        destroyOnClose
        confirmLoading={loading}
        visible={_.includes(['add', 'edit'], visible)}
        title={i18n('new_group', '新建分组')}
        onOk={this.handleOk}
        onCancel={() => {
          this.props.onVisibleChange('', null)
        }}
      >
        <Form>
          <FormItem {...formItemLayout} label={i18n('conf.model.field.card.name', '名称')}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [
                {
                  required: true,
                  message: i18n('input_field_gruop_name', '请输入分组名称')
                },
                {
                  max: 32,
                  message: i18n('input_field_gruop_maxName', '分组名称最大长度32个字符')
                },
                {
                  pattern: /^((?!&|;|$|%|>|<|`|"|\\|!|\|).)*$/,
                  message: i18n('ticket.true.name', '名称不能含有特殊字符')
                }
              ]
            })(
              <Input
                allowClear
                maxLength={32}
                placeholder={i18n('input_field_gruop_name', '请输入分组名称')}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default CreateLayout
