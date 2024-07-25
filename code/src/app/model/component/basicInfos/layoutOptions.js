import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Row, Col, Checkbox } from '@uyun/components'
import ModelGroupSelect from '~/components/modelGroupSelect'
const FormItem = Form.Item

@inject('modelListStore', 'basicInfoStore')
@observer
class LayoutOptions extends Component {
  onChange = (e) => {
    this.props.basicInfoStore.changeChildModel(e.target.checked ? 1 : 0)
    if (e.target.checked) {
      this.props.setFieldsValue({ isShared: 0 })
    }
  }

  render() {
    const { item, getFieldDecorator, layoutInfoVo, modelData } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    return (
      <Row>
        <Col span={12}>
          <FormItem label={item.name} {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: layoutInfoVo || undefined,
              rules: [
                {
                  required: item.required === 1,
                  message: i18n('pls_select_group', '请选择分组')
                }
              ]
            })(<ModelGroupSelect labelInValue />)}
          </FormItem>
        </Col>
        {/* {window.change_switch ? ( */}
        <Col span={6} offset={1}>
          <FormItem>
            {getFieldDecorator('childModel', {
              initialValue: modelData.childModel,
              valuePropName: 'checked'
            })(
              <Checkbox onChange={this.onChange}>
                {i18n('set_sub_process', '仅作为任务流程')}
              </Checkbox>
            )}
          </FormItem>
        </Col>
        {/* ) : null} */}
      </Row>
    )
  }
}

export default LayoutOptions
