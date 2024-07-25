import React, { Component } from 'react'
import { Form, Input, Select } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import AddDefinition from './addDefinition'
const FormItem = Form.Item
const Option = Select.Option

@inject('basicStore')
@observer
class BasicForm extends Component {
  state = {
    visible: false
  }

  componentDidMount() {
    this.props.basicStore.getModelList()
    this.props.basicStore.getDefinitionList()
  }

  componentDidUpdate(prevProps) {
    const { model } = this.props
    // 编辑sla策略时需要先查询时间字段
    if (model && model !== prevProps.model) {
      this.props.basicStore.queryTimeFields(model)
    }
  }

  componentWillUnmount() {
    // 清空时间字段
    this.props.basicStore.reset()
  }

  // 创建成功以后关闭弹框的同时，请求最新的数据
  handleAddAgreement = (visible, type) => {
    if (!visible && type) {
      this.props.basicStore.getDefinitionList()
    }
    this.setState({ visible })
  }

  handleModelChange = modelId => {
    this.props.basicStore.queryTimeFields(modelId)
    this.props.handleChangeModelId(modelId)
    this.props.resetIncedientRadio()
  }

  // 校验数据
  validateForms = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFieldsAndScroll((errors, values) => {
        if (errors) reject(new Error())
        resolve(values)
      })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { modelList, definitionList } = this.props.basicStore
    const { model, modelName, sla, name, formItemLayout, slaInsert } = this.props
    const { visible } = this.state

    const isSelectedModelNotExist = !!model && !modelList.some(item => item.processId === model)

    return (
      <Form>
        <FormItem {...formItemLayout} label={i18n('conf.model.field.card.name', '名称')}>
          {getFieldDecorator('name', {
            initialValue: name || undefined,
            rules: [
              { required: true, message: i18n('ticket.forms.pinputName', '请输入名称') },
              { whitespace: true, message: i18n('ticket.forms.pinputName', '请输入名称') }
            ]
          })(<Input maxLength="20" placeholder={i18n('ticket.forms.pinputName', '请输入名称')} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('sla_ticket_type', '工单类型')}>
          {getFieldDecorator('model', {
            initialValue: isSelectedModelNotExist ? modelName : model,
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n('sla_ticket_type', '工单类型')}`
              }
            ],
            onChange: this.handleModelChange
          })(
            <Select
              showSearch
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
            >
              {_.map(modelList, item => (
                <Option key={item.processId} value={item.processId}>
                  {item.processName}
                </Option>
              ))}
            </Select>
          )}
          {isSelectedModelNotExist && (
            <span className="sla-policy-edit-item-tip">
              {i18n('sla.model.not.exist.tip', '该模型已禁用或者删除')}
            </span>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('sla-policy-designated-agreement', '指定协议')}>
          {getFieldDecorator('sla', {
            initialValue: sla || undefined,
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'sla-policy-designated-agreement',
                  '指定协议'
                )}`
              }
            ]
          })(
            <Select
              showSearch
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
            >
              {_.map(definitionList, item => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
          {slaInsert && (
            <a className="add-agreement" onClick={this.handleAddAgreement}>
              {i18n('field_value_asset_tip1', '新增')}
            </a>
          )}
        </FormItem>
        <AddDefinition handleAddAgreement={this.handleAddAgreement} visible={visible} />
      </Form>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange(true)
  }
})(BasicForm)
