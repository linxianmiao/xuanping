import React, { Component } from 'react'
import * as mobx from 'mobx'
import { inject } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import getUid from '../../../utils/uuid'
import PanelContent from './component/panelContent'

import { Form, Input, Select, Modal, Collapse, Row, Col } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import FlowStore from '../../store/flowStore'
const FormItem = Form.Item
const Option = Select.Option
const Panel = Collapse.Panel
// @inject('flowStore')
@inject('formSetGridStore')
@Injectable({ cooperate: 'mobx' })
class StartNode extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      data: _.cloneDeep(this.props.item.notificationRules || []),
      panelIndex: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
      this.setState({
        data: _.cloneDeep(nextProps.item.notificationRules || [])
      })
    }
  }

  textChange = (e) => {
    this.setAttr('text', e.target.value)
  }

  handleChange = (value) => {
    this.setAttr('formId', value)
  }

  handleChangePase = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  handleOk = () => {
    this.panelContent.validateFieldsAndScroll((errors, value) => {
      if (errors) return false
      const { data, panelIndex } = this.state
      data[panelIndex].name = value.name
      this.setAttr('notificationRules', data)
      this.setState({
        visible: false
      })
    })
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
  }

  triggerChange = (value) => {
    this.setState({
      data: value
    })
  }

  changeVisible = () => {
    const { data } = this.state
    data.push({
      id: getUid(),
      name: '',
      params: [],
      incident: ['start'],
      triggerConditions: {
        when: 'all',
        conditionExpressions: [],
        nestingConditions: []
      }
    })
    this.setState({
      visible: true,
      data,
      panelIndex: data.length - 1
    })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      data: _.cloneDeep(this.props.item.notificationRules || [])
    })
  }

  createTicket = () => {
    this.props.changeVisbleKey('2')
  }

  handleRule = (index) => {
    this.setState({
      panelIndex: index,
      visible: true
    })
  }

  setTriggerData = (index, value, type) => {
    const { data } = this.state
    if (type === 'double') {
      data[index].incident = value.typeValue
      data[index].taskEndIncident = value.classValue
    } else {
      data[index][type] = value
    }
    this.setState({
      data
    })
  }

  delRule = (index, e) => {
    e.stopPropagation()
    const { data } = this.state
    data.splice(index, 1)
    this.setState(
      {
        data
      },
      () => {
        this.setAttr('notificationRules', data)
      }
    )
  }

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { panelIndex, visible, data } = this.state
    const triggerData = data[panelIndex] || {}
    const modelList = mobx.toJS(this.props.formSetGridStore.gridList)
    const isSubmit = mobx.toJS(this.flowStore.isSubmit)
    const stageList = mobx.toJS(this.flowStore.stageList)
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="startNode">
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">
                {i18n('conf.model.field.card.name', '名称')}
              </span>
            </div>
          </Col>
          <Col span={20}>
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
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('quote_form', '引用表单')}</span>
            </div>
          </Col>
          <Col span={20}>
            <div className="from-form">
              <FormItem
                validateStatus={!item.formId && isSubmit ? 'error' : 'success'}
                help={
                  !item.formId && isSubmit ? i18n('ticket.forms.pinputForm', '请选择引用表单') : ''
                }
              >
                <Select value={item.formId} onChange={this.handleChange} style={{ width: '100%' }}>
                  {modelList.map((model) => {
                    return (
                      <Option key={model.id} value={model.id}>
                        {model.name}
                      </Option>
                    )
                  })}
                </Select>
              </FormItem>
              <div className="required-item ticket-from">
                {i18n('conf.model.fields.Noquote_firm', '没有我引用的表单？')}
                <a onClick={this.createTicket}>{i18n('conf.model.fields.new.field', '新建表单')}</a>
              </div>
            </div>
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
                  onChange={this.handleChangePase}
                  style={{ width: '100%' }}
                  placeholder="请选择所属阶段"
                >
                  {stageList.map((stage) => {
                    return (
                      <Option key={stage.stageCode} value={stage.stageCode}>
                        {stage.stageName}
                      </Option>
                    )
                  })}
                </Select>
              </FormItem>
            </div>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={4} className="left_label">
            <div className="required-item" style={{ lineHeight: '28px' }}>
              <span className="required-item-name">{i18n('action_rules', '动作策略')}</span>
            </div>
          </Col>
          <Col span={20}>
            {_.map(data, (rule, index) => {
              return (
                <div
                  className="coll-header"
                  onClick={() => {
                    this.handleRule(index)
                  }}
                  key={index}
                >
                  {rule.name}
                  <i
                    className="iconfont icon-cha fr"
                    onClick={(e) => {
                      this.delRule(index, e)
                    }}
                  />
                </div>
              )
            })}
            <div className="required-content" onClick={this.changeVisible}>
              <PlusOutlined />
              {i18n('add_noti_rules', '添加策略')}
            </div>
          </Col>
        </Row>
        {visible && (
          <Modal
            title={triggerData.name || i18n('add_noti_rules', '添加策略')}
            visible={visible}
            width="777px"
            onOk={this.handleOk}
            onCancel={this.onCancel}
            maskClosable={false}
          >
            <div className="web-trigger-config notification-wrap" id="notification-wrap">
              <PanelContent
                ref={(node) => {
                  this.panelContent = node
                }}
                panelIndex={panelIndex}
                triggerData={triggerData}
                setTriggerData={this.setTriggerData}
                getFieldDecorator={getFieldDecorator}
              />
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

const StartNodeWrap = Form.create()(StartNode)
export default StartNodeWrap
