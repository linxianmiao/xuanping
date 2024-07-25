import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Select, Row, Col, Checkbox } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option

@inject('basicInfoStore')
@observer
class ModelTags extends Component {
  render() {
    const { item, getFieldDecorator, defaultValue, modelData } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    return (
      <Row>
        <Col span={12}>
          <FormItem label={item.name} {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue || undefined,
              rules: [
                {
                  required: item.required === 1,
                  message: i18n('pls_select_group', '请选择分组')
                }
              ]
            })(
              <Select
                allowClear
                labelInValue
                mode="tags"
                optionFilterProp="children"
                notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              >
                <Option value="1">{'111'}</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        {
          // 子流程逻辑
          // window.change_switch ? (
          <Col span={6} offset={1}>
            <FormItem>
              {getFieldDecorator('childModel', {
                initialValue: modelData.childModel,
                valuePropName: 'checked'
              })(<Checkbox>{i18n('set_sub_process', '仅作为任务流程')}</Checkbox>)}
            </FormItem>
          </Col>
          // ) : null
        }
      </Row>
    )
  }
}

export default ModelTags
