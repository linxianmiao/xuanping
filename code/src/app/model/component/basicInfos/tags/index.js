import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Row, Col, Checkbox, message } from '@uyun/components'
import LazyTags from './tags'
const FormItem = Form.Item

@inject('basicInfoStore')
@observer
class ModelTags extends Component {
  getList = async (query, callback) => {
    const res = await this.props.modelListStore.queryTags(_.assign({}, query, { type: 'model' }))
    const list = _.map(res, (item) => ({ name: item.name, id: item.name }))
    callback(list)
  }

  onChange = (value) => {
    if (value && value.length > 5) {
      message.warning(i18n('model-add-tags-warn-tip1', '最多添加{number}个标签'), { number: 5 })
      return false
    }
    this.setState({ value })
  }

  onChange1 = (e) => {
    this.props.basicInfoStore.changeChildModel(e.target.checked ? 1 : 0)
    if (e.target.checked) {
      this.props.setFieldsValue({ isShared: 0 })
    }
  }

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
                  message: i18n('pls_select_tags', '请输入标签')
                }
              ]
            })(<LazyTags />)}
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
              })(
                <Checkbox onChange={this.onChange1}>
                  {i18n('set_sub_process', '仅作为任务流程')}
                </Checkbox>
              )}
            </FormItem>
          </Col>
          // ) : null
        }
      </Row>
    )
  }
}

export default ModelTags
