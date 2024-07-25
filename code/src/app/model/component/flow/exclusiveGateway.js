import React, { Component } from 'react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import PropTypes from 'prop-types'
import { Form, Input, Radio, Collapse, Modal, Row, Col, Select } from '@uyun/components'
import { getNode } from './utils'
import IndexStore from '../../../trigger/store/indexStore'
import FlowStore from '../../store/flowStore'
import TriggerRules from '~/components/triggerRules'
import { checkTriggerConditionValue } from '~/components/common/checkTriggerConditionValue'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Panel = Collapse.Panel
const indexStore = new IndexStore()
@Injectable()
class ExclusiveGateway extends Component {
  @Inject(FlowStore) flowStore

  static defaultProps = {
    store: indexStore
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  state = {
    visible: false,
    isError: false,
    data: this.props.item.conditionRules || [],
    index: 0
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
      this.setState({
        data: nextProps.item.conditionRules || []
      })
    }
  }

  componentDidMount() {
    const { store, item } = this.props
    store.getFieldParams()
    if (item.conditionRules && item.conditionRules.length < 2) {
      this.setAttr('isDefault', 0)
    }
  }

  handleConditionChange = (index, value) => {
    const data = _.cloneDeep(this.state.data) // 解决对象引用的问题
    data[index].complexCondition = value
    this.setState({ data })
  }

  textChange = (e) => {
    this.setAttr('text', e.target.value)
  }

  onChange = (e) => {
    this.setAttr('isDefault', e.target.value)
  }

  handleChange = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
  }

  handleRule = (index) => {
    this.setState({
      visible: true,
      index: index
    })
  }

  handleOk = () => {
    const { data, index } = this.state
    // 校验
    const isCanSubmit = checkTriggerConditionValue(data[index].complexCondition)
    if (isCanSubmit === false) {
      this.setState({ isError: true })
      return false
    }
    this.setAttr('conditionRules', data)
    this.setState({
      visible: false,
      isError: false
    })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      isError: false,
      data: this.props.item.conditionRules || []
    })
  }

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { conditionRules } = item
    const { visible, data, index } = this.state
    const { stageList } = this.flowStore
    const complexCondition =
      data[index] && data[index].complexCondition
        ? data[index].complexCondition
        : {
            when: 'all',
            conditionExpressions: [],
            nestingConditions: []
          }
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="exclusiveGateway" style={{ paddingLeft: '12px' }}>
        <Collapse defaultActiveKey={['1', '3']}>
          <Panel header={i18n('basic_attribute', '基本属性')} key="1">
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">
                    {i18n('conf.model.field.card.name', '名称')}
                  </span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
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
                </FormItem>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">
                    {i18n('conf.model.field.code', '编码')}
                  </span>
                </div>
              </Col>
              <Col span={19}>
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
          </Panel>
          <Panel header={i18n('action_attribute', '动作属性')} key="3">
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">{i18n('out_path_setting', '迁出路径设置')}</div>
              </Col>
              <Col span={19}>
                {_.map(conditionRules, (ite, index) => {
                  const sourceData = this.flowStore.dataSource
                  const node = getNode(ite.id, sourceData) || {}
                  return (
                    <div className="coll-header" key={index} style={{ marginTop: '5px' }}>
                      <div
                        onClick={() => {
                          this.handleRule(index)
                        }}
                        style={{ display: 'inline-block', width: '69%' }}
                      >
                        {node.text}
                      </div>
                      <div style={{ display: 'inline-block', width: '31%' }}>
                        <RadioGroup
                          name="radiogroup"
                          value={item.isDefault}
                          onChange={this.onChange}
                        >
                          <Radio value={index}>
                            {i18n('conf.model.proces.defaultRule', '默认规则')}
                          </Radio>
                        </RadioGroup>
                      </div>
                    </div>
                  )
                })}
              </Col>
            </Row>
            <div />
            <Modal
              title={i18n('out_path_setting', '迁出路径设置')}
              visible={visible}
              destroyOnClose
              size="large"
              onOk={this.handleOk}
              onCancel={this.onCancel}
            >
              <div className="web-trigger-config" style={{ paddingRight: 50 }}>
                <TriggerRules
                  isError={this.state.isError}
                  value={complexCondition}
                  onChange={(value) => {
                    this.handleConditionChange(index, value)
                  }}
                  excludeCodes={['modelId', 'activity', 'status']}
                  modelId={this.context.modelId}
                />
              </div>
            </Modal>
          </Panel>
        </Collapse>
      </div>
    )
  }
}
const ExclusiveGatewayWrap = Form.create()(ExclusiveGateway)
export default ExclusiveGatewayWrap
