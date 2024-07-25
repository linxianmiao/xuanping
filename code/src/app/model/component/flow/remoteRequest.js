import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { store as runtimeStore } from '@uyun/runtime-react'
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
  Tooltip,
  Button
} from '@uyun/components'
import { checkHandlersRangeVo } from './utils'
import LazySelect from '~/components/lazyLoad/lazySelect'
import NewCountersignWrap from './component/newCountersignWrap'
import FlowStore from '../../store/flowStore'
import FieldMapping from '~/Remote/FieldMapping'
import _ from 'lodash'

const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const { RangePicker } = DatePicker

@inject('formSetGridStore', 'basicInfoStore')
@Injectable({ cooperate: 'mobx' })
@observer
class RemoteRequest extends Component {
  @Inject(FlowStore) flowStore

  state = {
    autoList: [],
    visible: '',
    panelIndex: 0,
    targetSystem: [],
    targetModel: []
  }

  componentDidMount() {
    this.props.form.setFieldsValue({ name: this.props.item.text })
    this.getSystemDetail()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.setState({ targetSystem: [], targetModel: [] }, () => {
        this.getSystemDetail()
      })
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
    }
  }

  // 请求目标系统的详细信息
  getSystemDetail = async () => {
    const { activityCrossVo } = this.props.item
    if (_.isEmpty(this.state.targetSystem) && !_.isEmpty(activityCrossVo?.targetSystemName)) {
      const res =
        (await this.flowStore.remoteDockingList({
          pageNum: 1,
          kw: activityCrossVo?.targetSystemName,
          pageSize: 9999
        })) || []
      const data =
        _.filter(_.cloneDeep(res), (item) => item?.id === activityCrossVo?.targetSystemId) || []
      this.setState({ targetSystem: data }, async () => {
        if (
          _.isEmpty(this.state.targetModel) &&
          !_.isEmpty(this.state.targetSystem) &&
          !_.isEmpty(activityCrossVo?.targetModelName)
        ) {
          const { targetSystem } = this.state
          const params = {
            remoteIp: targetSystem[0]?.accessAddress,
            remoteApikey: targetSystem[0]?.apiKey,
            remoteAppkey: targetSystem[0]?.appkey,
            pageNo: 1,
            pageSize: 9999,
            kw: activityCrossVo?.targetModelName
          }
          const res = (await this.flowStore.queryRemoteModelList(params)) || []
          const data =
            _.filter(_.cloneDeep(res), (item) => item?.id === activityCrossVo?.targetModel) || []
          this.setState({ targetModel: data })
        }
      })
    }
  }

  textChange = (e) => {
    const { item } = this.props
    this.props.changeWidth(item.id, e.target.value)
  }

  handleChange = (type, value) => {
    const { activityCrossVo } = this.props.item
    const ActivityCrossVo = activityCrossVo || {}
    if (
      type === 'targetSystem' ||
      type === 'targetModel' ||
      type === 'backfill' ||
      type === 'targetActivity'
    ) {
      if (type === 'targetSystem') {
        ActivityCrossVo.targetSystemId = value[0]?.id
        ActivityCrossVo.targetSystemName = value[0]?.systemName
      } else if (type === 'targetModel') {
        ActivityCrossVo.targetModel = value[0]?.id
        ActivityCrossVo.targetModelName = value[0]?.name
      } else if (type === 'targetActivity') {
        ActivityCrossVo.targetActivity = value[0]?.id
        ActivityCrossVo.targetActivityName = value[0]?.name
      } else if (type === 'backfill') {
        ActivityCrossVo.backfill = value
      }
      this.setAttr('activityCrossVo', ActivityCrossVo)
    } else {
      this.setAttr(type, value)
    }
  }

  setAttr = (key, value, id) => {
    const { item } = this.props
    this.flowStore.setAttr(id || item.id, key, value, 'nodes')
  }

  getParModelId = () => {
    const arr = window.location.href.split('?')[0].split('/')
    const parModelId = arr[arr.length - 1]

    return parModelId
  }

  createTicket = () => {
    this.props.changeVisbleKey('2')
  }

  // 目标系统
  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res = (await this.flowStore.remoteDockingList({ pageNum: pageNo, kw, pageSize })) || []
    let data = res
    data = _.map(data, (item) => {
      item.name = item.systemName
      return item
    })
    callback(data)
  }

  // 目标模型
  queryRemoteModelList = async (query, callback) => {
    const { targetSystem } = this.state
    if (_.isEmpty(targetSystem)) {
      message.error(i18n('conf.model.select.target.system', '请选择目标系统'))
      callback([])
      return
    }
    const { pageSize, pageNo, kw } = query
    const params = {
      remoteIp: targetSystem[0]?.accessAddress,
      remoteApikey: targetSystem[0]?.apiKey,
      remoteAppkey: targetSystem[0]?.appkey,
      pageNo,
      pageSize,
      kw
    }
    const res = (await this.flowStore.queryRemoteModelList(params)) || []
    callback(res)
  }

  // 目标模型确认环节
  queryRemoteActivityList = async (query, callback) => {
    const { activityCrossVo } = this.props.item
    const { targetSystem } = this.state
    if (_.isEmpty(targetSystem) || _.isEmpty(activityCrossVo?.targetModel)) {
      message.error(
        _.isEmpty(targetSystem)
          ? i18n('conf.model.select.target.system', '请选择目标系统')
          : i18n('conf.model.select.target.model', '请选择目标模型')
      )
      callback([])
      return
    }
    const params = {
      remoteIp: targetSystem[0]?.accessAddress,
      remoteApikey: targetSystem[0]?.apiKey,
      remoteAppkey: targetSystem[0]?.appkey,
      modelId: activityCrossVo?.targetModel
    }
    const res = (await this.flowStore.queryRemoteActivityList(params)) || []
    callback(res)
  }

  handleChangePase = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  render() {
    const { item, form } = this.props
    const ActivityCrossVo = item?.activityCrossVo || {}
    const { visible, targetModel, targetSystem } = this.state
    const { isSubmit, stageList } = this.flowStore
    const { getFieldDecorator } = this.props.form
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const modelList = this.props.formSetGridStore.gridList || []
    const { tenantId } = runtimeStore.getState().user || {}
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="remoteRequest">
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
              <span className="required-item-name">{i18n('conf.model.field.code', '编码')}</span>
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
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('quote_form', '引用表单')}</span>
            </div>
          </Col>
          <Col span={19}>
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
                  getPopupContainer={() => document.getElementById('remoteRequest')}
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
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('handler_range', '处理人范围')}</span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem
              className={checkHandlersRangeVo(item.handlersRangeVo) && isSubmit ? 'users-tips' : ''}
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

        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">
                {i18n('conf.model.target.system', '目标系统')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem
              validateStatus={
                !ActivityCrossVo?.targetSystemId && !ActivityCrossVo?.targetSystemName && isSubmit
                  ? 'error'
                  : 'success'
              }
              help={
                !ActivityCrossVo?.targetSystemId && !ActivityCrossVo?.targetSystemName && isSubmit
                  ? i18n('conf.model.select.target.system', '请选择目标系统')
                  : ''
              }
            >
              <LazySelect
                labelInValue
                value={
                  ActivityCrossVo &&
                  ActivityCrossVo?.targetSystemName &&
                  ActivityCrossVo?.targetSystemId
                    ? {
                        label: ActivityCrossVo.targetSystemName,
                        key: ActivityCrossVo.targetSystemId
                      }
                    : undefined
                }
                onChange={async (value, fullValue) => {
                  this.setState({ targetSystem: fullValue })
                  await this.handleChange('targetSystem', fullValue)
                  await this.handleChange('targetModel', [])
                  await this.handleChange('targetActivity', [])
                  this.setState({ targetModel: [] })
                }}
                placeholder={i18n('conf.model.select.target.system', '请选择目标系统')}
                getList={this.getList}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">
                {i18n('conf.model.target.model', '目标模型')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem
              validateStatus={
                !ActivityCrossVo?.targetModel && !ActivityCrossVo?.targetModelName && isSubmit
                  ? 'error'
                  : 'success'
              }
              help={
                !ActivityCrossVo?.targetModel && !ActivityCrossVo?.targetModelName && isSubmit
                  ? i18n('conf.model.select.target.model', '请选择目标模型')
                  : ''
              }
            >
              <LazySelect
                labelInValue
                value={
                  ActivityCrossVo &&
                  ActivityCrossVo?.targetModel &&
                  ActivityCrossVo?.targetModelName
                    ? {
                        label: ActivityCrossVo.targetModelName,
                        key: ActivityCrossVo.targetModel
                      }
                    : undefined
                }
                onChange={async (value, fullValue) => {
                  this.setState({ targetModel: fullValue })
                  await this.handleChange('targetModel', fullValue)
                  await this.handleChange('targetActivity', [])
                }}
                placeholder={i18n('conf.model.select.target.model', '请选择目标模型')}
                getList={this.queryRemoteModelList}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-name">
                {i18n('conf.model.create.field.mapping', '创建字段映射')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FieldMapping
              type={3}
              parNodeId={tenantId}
              subNodeId={targetModel[0]?.tenantId}
              parModelId={this.getParModelId()}
              subModelId={ActivityCrossVo?.targetModel}
              onModelMiss={() => {
                if (!ActivityCrossVo?.targetModel) {
                  message.error(i18n('conf.model.select.target.model', '请选择目标模型'))
                }
              }}
              source={'RemoteRequest'}
              remoteIp={targetSystem[0]?.accessAddress}
              apikey={targetSystem[0]?.apiKey}
              appkey={targetSystem[0]?.appkey}
            />
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-name">
                {i18n('conf.model.confirm.process', '目标确认环节')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem>
              <LazySelect
                labelInValue
                value={
                  ActivityCrossVo &&
                  ActivityCrossVo?.targetActivity &&
                  ActivityCrossVo?.targetActivityName
                    ? {
                        label: ActivityCrossVo.targetActivityName,
                        key: ActivityCrossVo.targetActivity
                      }
                    : undefined
                }
                onChange={(value, fullValue) => {
                  this.handleChange('targetActivity', fullValue)
                }}
                placeholder={i18n('conf.model.select.confirm.process', '请选择目标确认环节')}
                getList={this.queryRemoteActivityList}
                filterWithoutQuery
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">
                {i18n('conf.model.write.back', '是否回填')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem>
              <RadioGroup
                value={item.activityCrossVo?.backfill}
                onChange={(e) => {
                  this.handleChange('backfill', e.target.value)
                }}
              >
                <Radio value>{i18n('yes', '是')}</Radio>
                <Radio value={false}>{i18n('no', '否')}</Radio>
              </RadioGroup>
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
                  onChange={(e) => this.handleChangePase(e)}
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
        {item.activityCrossVo?.backfill && (
          <Row gutter={8}>
            <Col span={5} className="left_label">
              <div className="required-item">
                <span className="required-item-name">
                  {i18n('conf.model.write.back.field.mapping', '回填字段映射')}
                </span>
              </div>
            </Col>
            <Col span={19}>
              <FieldMapping
                type={4}
                parNodeId={targetModel[0]?.tenantId}
                subNodeId={tenantId}
                parModelId={ActivityCrossVo?.targetModel}
                subModelId={this.getParModelId()}
                onModelMiss={() => {
                  if (!ActivityCrossVo?.targetModel) {
                    message.error(i18n('conf.model.select.target.model', '请选择目标模型'))
                  }
                }}
                source={'RemoteRequest'}
                remoteIp={targetSystem[0]?.accessAddress}
                apikey={targetSystem[0]?.apiKey}
                appkey={targetSystem[0]?.appkey}
              />
            </Col>
          </Row>
        )}
      </div>
    )
  }
}

const AutoTaskNodeWrap = Form.create()(RemoteRequest)
export default AutoTaskNodeWrap
