import React, { Component } from 'react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import {
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
  TimePicker,
  Tooltip,
  Row,
  Col
} from '@uyun/components'
import FlowStore from '../../store/flowStore'
import moment from 'moment'
const FormItem = Form.Item
const Option = Select.Option
// @inject('flowStore')
@Injectable({ cooperate: 'mobx' })
class TimingTask extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      ruleId: '',
      timeData: [],
      numData: []
    }
  }

  componentDidMount() {
    const timeData = _.filter(this.flowStore.allParam, (param) => param.type === 6)
    const numData = _.filter(this.flowStore.allParam, (param) => param.type === 5)
    this.setState({
      timeData,
      numData
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
    }
  }

  textChange = (e) => {
    const { item } = this.props
    this.props.changeWidth(item.id, e.target.value)
  }

  handleChange = (type, value) => {
    let { timingStrategy } = this.props.item
    if (type === 'executionType') {
      timingStrategy = {
        executionType: value
      }
      this.setAttr('selectVariableVo', {})
      this.setAttr('useVariable', false)
    } else {
      timingStrategy[type] = value
    }
    this.setAttr('timingStrategy', timingStrategy)
  }

  changeUse = (value) => {
    const { item } = this.props
    const { timingStrategy } = item
    timingStrategy.date = ''
    this.setAttr('timingStrategy', timingStrategy)
    this.setAttr('selectVariableVo', {})
    this.setAttr('useVariable', value)
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
  }

  changeVo = (value, type) => {
    const dataSource = type === 'time' ? this.state.timeData : this.state.numData
    const data = _.filter(dataSource, (tmp) => tmp.id === value)
    const tmp = {
      id: data[0].id,
      name: data[0].name,
      code: data[0].code,
      type: data[0].type
    }
    this.setAttr('selectVariableVo', tmp)
  }

  handleChangePase = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { item } = this.props
    const { stageList } = this.flowStore
    const timingStrategy = item.timingStrategy || {}
    const format = 'HH:mm'
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="TimingTask">
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
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">
                {i18n('conf.model.field.card.Time', '时间策略')}
              </span>
            </div>
          </Col>
          <Col span={20}>
            <div style={{ marginBottom: '10px' }}>
              <Select
                value={timingStrategy.executionType}
                onChange={(e) => {
                  this.handleChange('executionType', e)
                }}
                style={{ width: '55%' }}
              >
                <Option value={'0'}>{i18n('conf.model.field.card.time1', '指定时间触发')}</Option>
                <Option value={'1'}>{i18n('conf.model.field.card.time2', '间隔时间触发')}</Option>
              </Select>
              <Checkbox
                className="required-item-name"
                style={{ width: '41%', marginLeft: '4%' }}
                checked={!!item.useVariable}
                onChange={(e) => {
                  this.changeUse(e.target.checked)
                }}
              >
                {i18n('conf.model.field.varibale', '使用变量')}
                <Tooltip
                  placement="topRight"
                  title={i18n('conf.model.timingTask.tip1', '勾选使用变量，将通过变量指定执行时间')}
                >
                  <i className="iconfont icon-jinggao tip1" style={{ marginLeft: '5px' }} />
                </Tooltip>
              </Checkbox>
            </div>
            {+timingStrategy.executionType === 0 && (
              <div>
                <span>{i18n('conf.model.timingTask.zd', '指定')}</span>
                {item.useVariable ? (
                  <Select
                    style={{ margin: '0 8px', width: '103px' }}
                    value={item.selectVariableVo ? item.selectVariableVo.id : ''}
                    onChange={(value) => {
                      this.changeVo(value, 'time')
                    }}
                  >
                    {_.map(this.state.timeData, (tmp) => {
                      return <Option key={tmp.id}>{tmp.name}</Option>
                    })}
                  </Select>
                ) : (
                  <TimePicker
                    value={timingStrategy.date ? moment(timingStrategy.date, format) : undefined}
                    format={format}
                    onChange={(value) => {
                      this.handleChange('date', value.format(format))
                    }}
                    style={{ margin: '0 8px', width: '103px' }}
                  />
                )}
                <span>{i18n('conf.model.timingTask.zx', '执行')}</span>
              </div>
            )}
            {+timingStrategy.executionType === 1 && (
              <div>
                <span>{i18n('conf.model.timingTask.jg', '间隔')}</span>
                {item.useVariable ? (
                  <Select
                    style={{ margin: '0 8px', width: '103px' }}
                    value={item.selectVariableVo ? item.selectVariableVo.id : ''}
                    onChange={(value) => {
                      this.changeVo(value, 'num')
                    }}
                  >
                    {_.map(this.state.numData, (tmp) => {
                      return <Option key={tmp.id}>{tmp.name}</Option>
                    })}
                  </Select>
                ) : (
                  <InputNumber
                    min={1}
                    max={60}
                    value={timingStrategy.timeInterval}
                    onChange={(value) => {
                      this.handleChange('timeInterval', value)
                    }}
                    style={{ margin: '0 8px' }}
                  />
                )}
                <span>{i18n('conf.model.timingTask.fzhzx', '分钟后执行')}</span>
              </div>
            )}
          </Col>
        </Row>
        <div className="TimingTaskTips">
          {i18n(
            'conf.model.timingTask.tip',
            '说明：定时器按照指定的时间策略自动执行流转，流转目标节点如需要指定人员将做自动分配处理'
          )}
        </div>
      </div>
    )
  }
}

const TimingTaskWrap = Form.create()(TimingTask)
export default TimingTaskWrap
