import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import moment from 'moment'
import {
  Form,
  Input,
  Checkbox,
  Select,
  Row,
  Col,
  Radio,
  DatePicker,
  Modal,
  message,
  Tooltip
} from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import Related from './component/related'
import getUid from '../../../utils/uuid'
import { checkHandlersRangeVo } from './utils'

import PanelContent from './component/panelContent'
import NewCountersignWrap from './component/newCountersignWrap'
import FlowStore from '../../store/flowStore'
import UserPicker from '~/components/userPicker'
import UserPicker1 from '@uyun/ec-user-picker'
const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const { RangePicker } = DatePicker
@inject('formSetGridStore', 'basicInfoStore')
@Injectable({ cooperate: 'mobx' })
@observer
class AutoTask extends Component {
  @Inject(FlowStore) flowStore

  state = {
    autoList: [],
    visible: false,
    data: _.cloneDeep(this.props.item.notificationRules || []),
    panelIndex: 0
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ name: this.props.item.text })
    this.flowStore.getSingleUserList()
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
    const { item } = this.props
    this.props.changeWidth(item.id, e.target.value)
  }

  handleChange = (type, value) => {
    const { dealRules } = this.props.item
    dealRules[0].needWaitWhenExecuteException = _.isNumber(
      this.props.item.dealRules[0]?.needWaitWhenExecuteException
    )
      ? this.props.item.dealRules[0]?.needWaitWhenExecuteException
      : 1
    if (
      type === 'executor' ||
      type === 'executorType' ||
      type === 'executionStrategy' ||
      type === 'sensitiveAuthor' ||
      type === 'needWaitWhenExecuteException' ||
      type === 'waitConfirm'
    ) {
      dealRules[0][type] = value
      if (type === 'executionStrategy') {
        dealRules[0].executionTime = { selectType: 'value' }
      }
      if (type === 'executorType') {
        dealRules[0].executor = {}
      }
      this.setAttr('dealRules', dealRules)
    } else if (type === 'execAuthType') {
      // 执行授权类型
      dealRules[0].execAuthVo = { id: value.key, name: value.label }
      this.setAttr('dealRules', dealRules)
    } else if (type === 'execAuthStaffs') {
      // 执行授权选人
      dealRules[0].execAuthVo.execAuthStaffs = value
      this.setAttr('dealRules', dealRules)
    } else if (type === 'activityStageConfig') {
      const activityStageConfig = {
        stageCode: value.value,
        stageName: value.label
      }
      this.setAttr('activityStageConfig', activityStageConfig)
    } else {
      this.setAttr(type, value)
    }
  }

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
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

  handleOk = () => {
    this.panelContent.validateFieldsAndScroll((errors, value) => {
      if (errors) return false
      const { data, panelIndex } = this.state
      let tmp = _.isEmpty(data)
      _.map(data, (rule) => {
        if (rule.params.length < 1) {
          tmp = true
          return
        }
        _.map(rule.params, (param) => {
          if (_.isEmpty(param.executeParamPos)) {
            tmp = true
            return
          }
          _.map(param.executeParamPos, (executeParamPo) => {
            // type为6，7的时候不必填（6."第三方类的全路径名"，7."第三方jar包"）
            if ([6, 7].indexOf(executeParamPo.type) === -1) {
              if (
                _.isEmpty(executeParamPo.value) ||
                (param.type === 'configTicket' && !executeParamPo.code)
              ) {
                tmp = true
              }
            }
          })
        })
      })
      if (tmp) {
        message.error(i18n('add_noti_rules_tips', '请完善动作'))
        return false
      }
      data[panelIndex].name = value.name
      this.setAttr('notificationRules', data)
      this.setState({
        visible: false
      })
    })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      data: _.cloneDeep(this.props.item.notificationRules || [])
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

  handleRule = (index) => {
    this.setState({
      panelIndex: index,
      visible: true
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

  handleTimeChange = (type, value) => {
    const { dealRules } = this.props.item
    let executionTime = dealRules[0].executionTime || { selectType: 'value' }
    switch (type) {
      case 'selectType':
        executionTime = { selectType: value }
        break
      case 'execTime':
        executionTime.execTime = value ? moment(value).format('x') : undefined
        break
      case 'deadTime':
        executionTime.execTime = value ? moment(value[0]).format('x') : undefined
        executionTime.deadTime = value ? moment(value[1]).format('x') : undefined
        break
      case 'execTimeField':
        executionTime.execTimeFieldCode = value.key
        executionTime.execTimeFieldName = value.label
        break
      case 'deadTimeField':
        executionTime.deadTimeFieldCode = value.key
        executionTime.deadTimeFieldName = value.label
        break
      default:
        executionTime[type] = value
        break
    }
    dealRules[0].executionTime = executionTime
    this.setAttr('dealRules', dealRules)
  }

  createTicket = () => {
    this.props.changeVisbleKey('2')
  }

  render() {
    const { item, modelId } = this.props
    // 自动执行：执行时间为单个时间，必填 ---- 没有范围时间
    // 手动执行：执行时间为范围，2个时间都必填  ----没有单个时间
    const { sensitiveAndexecAuth, singleUserFields, isSubmit, stageList } = this.flowStore
    const sensitive = (sensitiveAndexecAuth[item.id] || {}).sensitive
    const execAuth = (sensitiveAndexecAuth[item.id] || {}).execAuth
    const { getFieldDecorator } = this.props.form
    const active = {
      item: [],
      data: undefined,
      type: 'flow'
    }
    const { panelIndex, visible, data } = this.state

    const triggerData = data[panelIndex] || {}
    const modelList = this.props.formSetGridStore.gridList || []
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const { executionTime, execAuthVo } = item.dealRules[0]
    const selectType = executionTime.selectType
    const execTimeField = executionTime.execTimeFieldCode
      ? { label: executionTime.execTimeFieldName, key: executionTime.execTimeFieldCode }
      : undefined
    const deadTimeField = executionTime.deadTimeFieldCode
      ? { label: executionTime.deadTimeFieldName, key: executionTime.deadTimeFieldCode }
      : undefined
    const sensitiveAuthor = _.concat(
      item.dealRules[0].sensitiveAuthor.users,
      item.dealRules[0].sensitiveAuthor.groups
    )
    const executor =
      !item?.dealRules[0]?.executor || Object.keys(item?.dealRules[0]?.executor)?.length == 0
        ? undefined
        : item?.dealRules[0]?.executor

    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined

    const initSensitiveAuthor =
      !_.isEmpty(sensitiveAuthor) &&
      _.compact(
        _.map(sensitiveAuthor, (item) => {
          if (item?.type === 1) item.type = 'users'
          if (item?.type === 0) item.type = 'groups'
          return item
        })
      )
    return (
      <div id="autoTask">
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
        {item.dealRules[0].autoType === 2 ? null : (
          <Row gutter={8}>
            <Col span={4} className="left_label">
              <div className="required-item">
                <span className="required-item-icon">*</span>
                <span className="required-item-name">{i18n('handler_range', '处理人范围')}</span>
              </div>
            </Col>
            <Col span={20}>
              <FormItem
                className={
                  checkHandlersRangeVo(item.handlersRangeVo) && isSubmit ? 'users-tips' : ''
                }
                validateStatus={
                  checkHandlersRangeVo(item.handlersRangeVo) && isSubmit ? 'error' : 'success'
                }
                help={
                  checkHandlersRangeVo(item.handlersRangeVo) && isSubmit
                    ? i18n('ticket.create.select_handler', '请选择处理人')
                    : ''
                }
              >
                <NewCountersignWrap
                  isShared={this.props.basicInfoStore.isShared}
                  isShowUserVariable
                  handlersRangeVo={item.handlersRangeVo}
                  handleUserChange={(value) => this.setAttr('handlersRangeVo', value)}
                />
              </FormItem>
            </Col>
          </Row>
        )}
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
                <Select
                  value={item.formId}
                  onChange={(e) => {
                    this.handleChange('formId', e)
                  }}
                  style={{ width: '100%' }}
                  getPopupContainer={() => document.getElementById('autoTask')}
                >
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
                  onChange={(e) => this.handleChange('activityStageConfig', e)}
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
              <span className="required-item-name">{i18n('conf.model.proces.task', '任务')}</span>
            </div>
          </Col>
          <Col span={20}>
            <FormItem
              validateStatus={
                !item.dealRules[0].autoCode &&
                !item.dealRules[0].autoId &&
                item.dealRules[0].autoType !== 2 &&
                isSubmit
                  ? 'error'
                  : 'success'
              }
              help={
                !item.dealRules[0].autoCode &&
                !item.dealRules[0].autoId &&
                item.dealRules[0].autoType !== 2 &&
                isSubmit
                  ? i18n('conf.model.proces.taskParam', '请选择任务及填写参数信息')
                  : ''
              }
            >
              <Related
                id={item.id}
                active={active}
                store={this.flowStore}
                defaultValue={item.dealRules}
                getData={(value) => {
                  this.handleChange('dealRules', value)
                }}
                modelId={modelId}
              />
            </FormItem>
          </Col>
        </Row>
        {item.dealRules[0].autoType === 2 && (
          <Row gutter={8}>
            <Col span={4} className="left_label">
              <span>{i18n('waiting_confirm', '等待确认')}</span>
            </Col>
            <Col span={20}>
              <div className="from-form">
                <FormItem>
                  <RadioGroup
                    value={
                      item.dealRules[0].waitConfirm === undefined
                        ? 0
                        : item.dealRules[0].waitConfirm
                    }
                    onChange={(e) => {
                      this.handleChange('waitConfirm', e.target.value)
                    }}
                  >
                    <RadioButton value={1}>{i18n('yes', '是')}</RadioButton>
                    <RadioButton value={0}>{i18n('no', '否')}</RadioButton>
                  </RadioGroup>
                </FormItem>
              </div>
            </Col>
          </Row>
        )}
        {item.dealRules[0].autoType !== 2 && (
          <React.Fragment>
            <Row gutter={8} style={{ marginBottom: '16px' }}>
              <Col span={4} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.proces.settingPlot', '执行策略')}
                  </span>
                </div>
              </Col>
              <Col span={20}>
                <RadioGroup
                  buttonStyle="solid"
                  value={item.dealRules[0].executionStrategy}
                  onChange={(e) => {
                    this.handleChange('executionStrategy', e.target.value)
                  }}
                >
                  <RadioButton value={0}>{i18n('autoOperation', '自动执行')}</RadioButton>
                  <RadioButton value={1}>{i18n('manualExecution', '手动执行')}</RadioButton>
                </RadioGroup>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={4} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.proces.settingTime', '执行时间')}
                  </span>
                </div>
              </Col>
              <Col span={20}>
                <FormItem>
                  <Select
                    className="auto_param_content_fl"
                    value={selectType}
                    onChange={(value) => {
                      this.handleTimeChange('selectType', value)
                    }}
                    getPopupContainer={() => document.getElementById('autoTask')}
                  >
                    <Option value="value">{i18n('conf.model.process.timeList', '时间列表')}</Option>
                    <Option value="field">
                      {i18n('conf.model.process.timeField', '时间字段')}
                    </Option>
                  </Select>
                  <div className="auto_param_content_fr">
                    {selectType === 'value' ? (
                      +item.dealRules[0].executionStrategy === 1 ? (
                        <RangePicker
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD HH:mm"
                          showTime={{ format: 'HH:mm' }}
                          value={
                            executionTime.deadTime
                              ? [
                                  moment(Number(executionTime.execTime)),
                                  moment(Number(executionTime.deadTime))
                                ]
                              : undefined
                          }
                          placeholder={[
                            i18n('start.time', '开始时间'),
                            i18n('end.time', '结束时间')
                          ]}
                          onChange={(value) => {
                            this.handleTimeChange('deadTime', value)
                          }}
                        />
                      ) : (
                        <DatePicker
                          showTime={{ format: 'HH:mm' }}
                          format="YYYY-MM-DD HH:mm"
                          placeholder={`${i18n('globe.select', '请选择')}${i18n('time', '时间')}`}
                          value={
                            executionTime.execTime
                              ? moment(Number(executionTime.execTime))
                              : undefined
                          }
                          onChange={(value) => {
                            this.handleTimeChange('execTime', value)
                          }}
                        />
                      )
                    ) : selectType === 'field' ? (
                      <React.Fragment>
                        <Select
                          style={{ width: '48%' }}
                          dropdownMatchSelectWidth={false}
                          getPopupContainer={() => document.getElementById('autoTask')}
                          placeholder={
                            +item.dealRules[0].executionStrategy === 1
                              ? i18n('conf.model.process.selectStartField', '请选择开始时间字段')
                              : i18n('conf.model.process.selectStartField', '请选择时间字段')
                          }
                          value={execTimeField}
                          labelInValue
                          onChange={(value) => {
                            this.handleTimeChange('execTimeField', value)
                          }}
                        >
                          {_.map(this.flowStore.timeFields, (time) => {
                            return (
                              <Option value={time.code} key={time.code}>
                                {time.name}
                              </Option>
                            )
                          })}
                        </Select>
                        {+item.dealRules[0].executionStrategy === 1 ? (
                          <Select
                            dropdownMatchSelectWidth={false}
                            getPopupContainer={() => document.getElementById('autoTask')}
                            placeholder={i18n(
                              'conf.model.process.selectEndField',
                              '请选择结束时间字段'
                            )}
                            style={{ width: '48%', marginLeft: '4%' }}
                            value={deadTimeField}
                            labelInValue
                            onChange={(value) => {
                              this.handleTimeChange('deadTimeField', value)
                            }}
                          >
                            {_.map(this.flowStore.timeFields, (time) => {
                              return (
                                <Option value={time.code} key={time.code}>
                                  {time.name}
                                </Option>
                              )
                            })}
                          </Select>
                        ) : null}
                      </React.Fragment>
                    ) : null}
                  </div>
                </FormItem>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={4} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.proces.settingUser', '执行人')}
                  </span>
                </div>
              </Col>
              <Col span={20}>
                <FormItem className="auto_param_content_user">
                  <Select
                    className="auto_param_content_fl1"
                    value={item.dealRules[0].executorType || 0}
                    onChange={(value) => {
                      this.handleChange('executorType', value)
                    }}
                    getPopupContainer={() => document.getElementById('autoTask')}
                  >
                    <Option value={0}>
                      {i18n('conf.model.process.directSelection', '直接选择')}
                    </Option>
                    <Option value={1}>
                      {i18n('conf.model.process.fieldVariable', '字段变量')}
                    </Option>
                  </Select>
                  <div className="auto_param_content_fr1">
                    {item.dealRules[0].executorType ? (
                      <Select
                        style={{ verticalAlign: '-5px' }}
                        value={executor}
                        labelInValue
                        placeholder={i18n('conf.model.process.selectUserField', '请选择人员字段')}
                        onChange={(value) => {
                          this.handleChange('executor', value)
                        }}
                        getPopupContainer={() => document.getElementById('autoTask')}
                      >
                        {_.map(singleUserFields, (userField) => {
                          return (
                            <Option value={userField.code} key={userField.code}>
                              {userField.name}
                            </Option>
                          )
                        })}
                      </Select>
                    ) : (
                      <UserPicker
                        onChange={(value) => {
                          this.handleChange('executor', value)
                        }}
                        value={executor}
                        selectionType="radio"
                        tabs={[1]}
                        showTypes={['users']}
                      />
                    )}
                  </div>
                </FormItem>
              </Col>
            </Row>

            {sensitive && (
              <Row gutter={8}>
                <Col span={4} className="left_label">
                  <div className="required-item">
                    <span className="required-item-icon">*</span>
                    <span className="required-item-name">
                      {i18n('conf.model.proces.sensitiveAuthorization', '敏感授权')}
                    </span>
                  </div>
                </Col>
                <Col span={20}>
                  <FormItem
                    validateStatus={_.isEmpty(sensitiveAuthor) && isSubmit ? 'error' : 'success'}
                    help={
                      _.isEmpty(sensitiveAuthor) && isSubmit
                        ? i18n('conf.model.proces.sensitiveAuthor', '请选择敏感授权人员')
                        : ''
                    }
                  >
                    <UserPicker1
                      productName="automation"
                      mode="select"
                      value={
                        _.isEmpty(item.dealRules[0].sensitiveAuthor)
                          ? { all: [], users: [], groups: [] }
                          : { ...item.dealRules[0].sensitiveAuthor, all: initSensitiveAuthor }
                      }
                      onChange={(value) => {
                        const data = _.cloneDeep(value)
                        data.users = _.filter(value?.all, (item) => item.type === 'users') || []
                        data.users = _.map(data.users, (item) => {
                          return {
                            ...item,
                            type: 1
                          }
                        })
                        data.groups = _.filter(value?.all, (item) => item.type === 'groups') || []
                        data.groups = _.map(data.groups, (item) => {
                          return {
                            ...item,
                            type: 0
                          }
                        })
                        this.handleChange('sensitiveAuthor', data)
                      }}
                    />
                  </FormItem>
                </Col>
              </Row>
            )}
            {!_.isEmpty(execAuth) && (
              <Row gutter={8}>
                <Col span={4} className="left_label">
                  <div className="required-item">
                    <span className="required-item-name">
                      {i18n('conf.model.proces.executiveAuthorization', '执行授权')}
                    </span>
                  </div>
                </Col>
                <Col span={20}>
                  <FormItem className="auto_param_content_user">
                    <Select
                      className="auto_param_content_fl1"
                      value={
                        execAuthVo ? { key: execAuthVo.id, label: execAuthVo.name } : undefined
                      }
                      labelInValue
                      onChange={(value) => {
                        this.handleChange('execAuthType', value)
                      }}
                      getPopupContainer={() => document.getElementById('autoTask')}
                    >
                      {_.map(execAuth, (auth) => (
                        <Option value={auth.id} key={auth.id}>
                          {auth.name}
                        </Option>
                      ))}
                    </Select>
                    {execAuthVo && execAuthVo.id !== 'none' && (
                      <div className="auto_param_content_fr1">
                        <UserPicker
                          onChange={(value) => {
                            this.handleChange('execAuthStaffs', value)
                          }}
                          value={
                            item.dealRules[0].execAuthVo &&
                            item.dealRules[0].execAuthVo.execAuthStaffs
                              ? item.dealRules[0].execAuthVo.execAuthStaffs
                              : []
                          }
                          selectionType="radio"
                          tabs={[1, 0]}
                          showTypes={['groups', 'users']}
                        />
                      </div>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row gutter={8}>
              <Col span={4} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">
                    {i18n('conf.model.proces.setting', '执行设置')}
                  </span>
                </div>
              </Col>
              <Col span={20}>
                <FormItem
                  validateStatus={
                    item.executeType &&
                    (!_.isNumber(item.dealRules[0]?.needWaitWhenExecuteException) ||
                      (_.isNumber(item.dealRules[0]?.needWaitWhenExecuteException) &&
                        !!item.dealRules[0]?.needWaitWhenExecuteException)) &&
                    isSubmit
                      ? 'error'
                      : 'success'
                  }
                  help={
                    item.executeType &&
                    (!_.isNumber(item.dealRules[0]?.needWaitWhenExecuteException) ||
                      (_.isNumber(item.dealRules[0]?.needWaitWhenExecuteException) &&
                        !!item.dealRules[0]?.needWaitWhenExecuteException)) &&
                    isSubmit
                      ? i18n('ticket.forms.execute.setting', '请选择执行设置')
                      : ''
                  }
                >
                  <div style={{ display: 'inline-block', margin: '7px 0 23px 0' }}>
                    <Checkbox
                      checked={item.executeType === 0}
                      onChange={(e) => {
                        this.handleChange('executeType', e.target.checked ? 0 : 1)
                      }}
                    >
                      {i18n('conf.model.proces.wait', '等待结果')}
                    </Checkbox>
                    <Tooltip
                      title={i18n(
                        'conf.model.proces.tips',
                        '当需要等待编排执行后的结果时请选择等待结果，否则不考虑执行结果，任务自动流转'
                      )}
                    >
                      <i
                        className="icon-jinggao iconfont"
                        style={{ marginLeft: '3px', verticalAlign: '-2px' }}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ display: 'inline-block', margin: '7px 0 23px 20px' }}>
                    <Checkbox
                      checked={item.dealRules[0].needWaitWhenExecuteException === 0}
                      onChange={(e) => {
                        this.handleChange('needWaitWhenExecuteException', e.target.checked ? 0 : 1)
                      }}
                    >
                      {i18n('conf.model.proces.errWait', '异常等待')}
                    </Checkbox>
                    <Tooltip
                      title={i18n(
                        'conf.model.proces.tips11',
                        '执行异常时需人工处理请勾选，否则不考虑执行异常，任务自动流转'
                      )}
                    >
                      <i
                        className="icon-jinggao iconfont"
                        style={{ marginLeft: '3px', verticalAlign: '-2px' }}
                      />
                    </Tooltip>
                  </div>
                </FormItem>
                {/* <div className="required-item" style={{ width: '355px' }}>
                  <i className="iconfont icon-tishi" style={{ marginRight: '5px' }} />
                  <span className="required-item-name">{i18n('conf.model.proces.tips', '当需要等待编排执行后的结果时请选择等待结果，否则不考虑执行结果，任务自动流转')}</span>
                </div> */}
              </Col>
            </Row>
          </React.Fragment>
        )}
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

const AutoTaskNodeWrap = Form.create()(AutoTask)
export default AutoTaskNodeWrap
