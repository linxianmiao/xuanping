import React, { Component } from 'react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { Form, Input, Row, Col, Radio, Select } from '@uyun/components'
import FlowStore from '../../store/flowStore'
const FormItem = Form.Item
const { Option } = Select
const RadioGroup = Radio.Group

@Injectable()
class ParallelGateway extends Component {
  @Inject(FlowStore) flowStore

  textChange = (e) => {
    this.setAttr('text', e.target.value)
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
  }

  handleChange = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
    }
  }

  changeDynamicSign = (e) => {
    this.setAttr('canDynamicSign', e.target.value)
    this.setAttr('variableCode', undefined)
  }

  changeVariableCode = (value) => {
    this.setAttr('variableCode', value)
  }

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { isSubmit, stageList } = this.flowStore

    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="pG">
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('name', '名称')}</span>
            </div>
          </Col>
          <Col span={20}>
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator('name', {
                initialValue: item.text,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: i18n('ticket.forms.pinputName', '请输入名称')
                  },
                  {
                    max: 50,
                    message: i18n('ticket.forms.NodeNameLength', '节点名称最长50个字符')
                  },
                  {
                    pattern: /^((?!&|;|$|%|>|<|`|"|\\|!|\|).)*$/,
                    message: i18n('ticket.true.name', '名称不能含有特殊字符')
                  }
                ]
              })(<Input onChange={this.textChange} />)}
              <span className="ticket-from required-item" style={{ marginLeft: '10px' }}>
                (
                {item.parallelGateType === 'end'
                  ? i18n('conf.model.proces.parallelStart', '这是一个同步结束节点')
                  : i18n('conf.model.proces.parallelEnd', '这是一个同步开始节点')}
                )
              </span>
            </FormItem>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('conf.model.field.code', '编码')}</span>
            </div>
          </Col>
          <Col span={20}>
            <FormItem {...formItemLayout}>
              {getFieldDecorator('activityCode', {
                initialValue: item.activityCode,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: i18n('ticket.forms.inputParamCode', '请输入编码')
                  },
                  {
                    min: 2,
                    message: i18n('ticket.forms.NodeCodeMinLength', '编码最少2个字符')
                  },
                  {
                    max: 20,
                    message: i18n('ticket.forms.NodeCodeLength', '编码最长20个字符')
                  },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: i18n('field_create_code_error1', '编码只能为英文数字下划线')
                  }
                ]
              })(
                <Input
                  onChange={(e) => {
                    this.setAttr('activityCode', e.target.value)
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              {/* <span className="required-item-icon">*</span> */}
              <span className="required-item-name">{i18n('Phase')}</span>
            </div>
          </Col>
          <Col span={20}>
            <div className="from-form">
              <FormItem>
                <Select
                  labelInValue
                  value={activityStageConfigValue}
                  onChange={(e) => this.handleChange(e)}
                  style={{ width: '100%' }}
                  placeholder="请选择所属阶段"
                >
                  {stageList.map((stage) => {
                    return (
                      <Select.Option key={stage.stageCode} value={stage.stageCode}>
                        {stage.stageName}
                      </Select.Option>
                    )
                  })}
                </Select>
              </FormItem>
            </div>
          </Col>
        </Row>
        {this.props.item.parallelGateType === 'start' ? (
          <React.Fragment>
            <Row gutter={8}>
              <Col span={4} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.field.dnode', '动态节点')}
                  </span>
                </div>
              </Col>
              <Col span={20}>
                <FormItem {...formItemLayout}>
                  <RadioGroup value={item.canDynamicSign ? 1 : 0} onChange={this.changeDynamicSign}>
                    <Radio value={1}>{i18n('yes', '是')}</Radio>
                    <Radio value={0}>{i18n('no', '否')}</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
            {item.canDynamicSign ? (
              <Row gutter={8}>
                <Col span={4} className="left_label">
                  <div className="required-item">
                    <span className="required-item-icon">*</span>
                    <span className="required-item-name">
                      {i18n('conf.model.field.dataSource', '数据来源')}
                    </span>
                  </div>
                </Col>
                <Col span={20}>
                  <FormItem
                    {...formItemLayout}
                    validateStatus={!item.variableCode && isSubmit ? 'error' : 'success'}
                    help={
                      !item.variableCode && isSubmit
                        ? i18n('conf.model.proces.selectParam', '请选择变量')
                        : ''
                    }
                  >
                    {
                      <Select
                        showSearch
                        value={item.variableCode}
                        notFoundContent={i18n('globe.not_find', '无法找到')}
                        style={{ width: '100%' }}
                        onChange={this.changeVariableCode}
                        placeholder={i18n('conf.model.proces.selectParam', '请选择变量')}
                        optionFilterProp="children"
                        getPopupContainer={() => document.getElementById('pG')}
                      >
                        {this.flowStore.allParam.map((param) => {
                          if (param.type === 7) {
                            return (
                              <Option key={param.id} value={param.id}>
                                {param.name}
                              </Option>
                            )
                          }
                        })}
                      </Select>
                    }
                  </FormItem>
                </Col>
              </Row>
            ) : null}
          </React.Fragment>
        ) : null}
      </div>
    )
  }
}

const ParallelGatewayWrap = Form.create()(ParallelGateway)
export default ParallelGatewayWrap
