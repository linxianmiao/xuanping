import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Form } from '@uyun/components'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'
const FormItem = Form.Item

@inject('fieldListExtendStore')
@observer
@Form.create()
class MoveField extends Component {
  state = {
    loading: false
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      this.setState({ loading: true })
      const { group } = values
      const { id: fieldId } = this.props.item || {}
      const res = await this.props.fieldListExtendStore.onMove(
        _.assign({}, { fieldId, layoutId: group.key })
      )
      this.setState({ loading: false })
      this.props.onVisibleChange('', null)
      if (+res === 200) {
        this.props.fieldListExtendStore.getFieldList()
      }
    })
  }

  render() {
    const { visible, item } = this.props
    const { getFieldDecorator } = this.props.form
    const { loading } = this.state
    const { layoutInfoVo } = item || {}
    const { id, name } = layoutInfoVo || {}
    return (
      <Modal
        destroyOnClose
        confirmLoading={loading}
        visible={visible === 'move'}
        title={i18n('move_field_to_group', '将资源类型移动至')}
        onOk={this.handleOk}
        onCancel={() => {
          this.props.onVisibleChange('', null)
        }}
      >
        <Form>
          <FormItem>
            {getFieldDecorator('group', {
              initialValue: id ? { key: id, label: name } : undefined,
              rules: [
                {
                  required: true,
                  message: i18n('pls_select_group', '请选择分组')
                }
              ]
            })(<FieldGroupLazySelect labelInValue />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
export default MoveField
