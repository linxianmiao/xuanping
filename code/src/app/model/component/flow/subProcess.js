import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import PropTypes from 'prop-types'
import LazySelect from '~/components/lazyLoad/lazySelect'
import FlowStore from '../../store/flowStore'
import { Form, Input, Select, Radio, Checkbox, Row, Col, Button, message } from '@uyun/components'
import FieldMappingModal from './component/FieldMappingModal'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

@inject('formSetGridStore', 'fieldListStore', 'flowListStore')
@Injectable({ cooperate: 'mobx' })
@observer
class subProcess extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)
    this.state = {
      modelStartFlowList: [],
      mode: {},
      fieldList: [],
      visible: ''
    }
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  textChange = (e) => {
    const { item } = this.props
    this.props.changeWidth(item.id, e.target.value)
  }

  onChange = (e) => {
    const { dealRules } = this.props.item
    dealRules[0].dynamicReferenceChild = e.target.checked ? 1 : 0
    this.setAttr('dealRules', dealRules)
    this.handleChange('childMode', 1)
    this.setState({ show: false })
  }

  handleChange = async (type, e, record) => {
    const { dealRules } = this.props.item
    let value = e && e.target ? e.target.value : e
    let newType = type
    if (type === 'needSuspend') {
      newType = 'childModel'
      value = {
        id: dealRules[0].childModel.id,
        needSuspend: e && e.target ? e.target.value : e
      }
      dealRules[0].isWriteback = '0'
      dealRules[0].writebackFieldVos = null
    }

    if (type === 'autoCreateTicket') {
      this.setState({ show: e.target.value !== 1 })
      if (e.target.value === 1 && dealRules[0].startFlow) {
        dealRules[0].startFlow = ''
      }
    }
    if (type === 'isWriteback' && +value === 0) {
      dealRules[0].writebackFieldVos = null
    }
    if (type === 'startFlow') {
      const { modelStartFlowList } = this.state
      const startFlow = _.filter(modelStartFlowList, (i) => {
        return i.id === value
      })
      dealRules[0].startNode = startFlow[0].startNode
    }
    if (type === 'childMode' && value === 1) {
      dealRules[0].childModel.needSuspend = 0
      dealRules[0].autoCreateTicket = 0
      dealRules[0].isWriteback = '0'
      dealRules[0].writebackFieldVos = null
      dealRules[0].startFlow = ''
      this.setState({ show: true })
    }
    if (type === 'childMode') {
      dealRules[0].childModel.id = undefined
      this.setState({ mode: {} })
    }
    if (type === 'childModel') {
      dealRules[0].startFlow = ''
      let mode = {}
      let id
      if (dealRules[0].childMode === 1) {
        mode = _.assign(record, { id: record.key, name: record.label })
        dealRules[0].subChartId = e
        id = this.context.modelId
      } else {
        mode = await this.flowStore.getBaseModel(e)
        id = e && e.target ? e.target.value : e
      }
      this.setState({
        mode
      })
      value = {
        id,
        needSuspend: dealRules[0].childModel.needSuspend,
        mode: mode.mode || 0
      }

      if (mode.mode === 1 || dealRules[0].childMode === 1) {
        let modelId = ''
        let chartId = ''
        if (dealRules[0].childMode === 1) {
          modelId = this.context.modelId
          chartId = e
        } else {
          modelId = e
        }
        axios
          .get(API.get_model_start_flow(modelId, chartId || '') + '&pageSize=2147483647')
          .then((res) => {
            let flowList = []
            if (+res !== 200) {
              for (var prop in res) {
                _.map(res[prop], (item) => {
                  item.startNode = prop
                })
                flowList = _.concat(flowList, res[prop])
              }
              this.setState({
                modelStartFlowList: flowList
              })
            }
          })
      }
    }
    // if (type === 'writebackFieldVos') {
    //   value = _.isEmpty(value) ? null :
    // }
    dealRules[0][newType] = value
    this.setAttr('dealRules', dealRules)
  }

  componentWillMount = async () => {
    const { dealRules } = this.props.item
    const id = dealRules[0].childModel.id
    const { data } = this.props.flowListStore
    if (id) {
      let mode = {}
      let modelId = ''
      let chartId = ''
      if (dealRules[0].childMode === 1) {
        mode = _.find(data, (item) => item.id === dealRules[0].subChartId)
        modelId = this.context.modelId
        chartId = dealRules[0].subChartId
      } else {
        mode = await this.flowStore.getBaseModel(id)
        modelId = id
      }

      if (mode.mode === 1 || dealRules[0].childMode === 1) {
        axios
          .get(API.get_model_start_flow(modelId, chartId || '') + '&pageSize=2147483647')
          .then((res) => {
            let flowList = []
            if (+res !== 200) {
              for (var prop in res) {
                _.map(res[prop], (item) => {
                  item.startNode = prop
                })
                flowList = _.concat(flowList, res[prop])
              }
              this.setState({
                modelStartFlowList: flowList
              })
            }
          })
      }
      this.setState({
        mode: mode
      })
      dealRules[0].childModel.mode = mode.mode
      this.setAttr('dealRules', dealRules)
    }
    this.setState({
      show: dealRules[0].autoCreateTicket === 0
    })
  }

  setAttr = (key, value, id) => {
    const { item } = this.props
    this.flowStore.setAttr(id || item.id, key, value, 'nodes')
  }

  componentWillReceiveProps = async (nextProps) => {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })

      const { dealRules } = nextProps.item
      const id = dealRules[0].childModel.id
      const { data } = this.props.flowListStore

      if (id) {
        let mode = {}
        let modelId = ''
        let chartId = ''

        if (dealRules[0].childMode === 1) {
          mode = _.find(data, (item) => item.id === dealRules[0].subChartId)
          modelId = this.context.modelId
          chartId = dealRules[0].subChartId
        } else {
          mode = (await this.flowStore.getBaseModel(id)) || {}
          modelId = id
        }

        if (mode.mode === 1 || dealRules[0].childMode === 1) {
          axios
            .get(API.get_model_start_flow(modelId, chartId || '') + '&pageSize=2147483647')
            .then((res) => {
              let flowList = []
              if (+res !== 200) {
                for (var prop in res) {
                  _.map(res[prop], (item) => {
                    item.startNode = prop
                  })
                  flowList = _.concat(flowList, res[prop])
                }
                this.setState({
                  modelStartFlowList: flowList
                })
              }
            })
        }

        this.setState({ mode })
        dealRules[0].childModel.mode = mode.mode
        // 这里传最新item的id，否则直接切换节点时数据会错乱
        this.setAttr('dealRules', dealRules, nextProps.item.id)
      }

      this.setState({
        show: dealRules[0].autoCreateTicket === 0
      })
    }
  }

  changeVo = (value) => {
    const data = _.filter(this.flowStore.allParam, (tmp) => tmp.id === value)
    const { dealRules } = this.props.item
    const tmp = {
      id: data[0].id,
      name: data[0].name,
      code: data[0].code,
      type: data[0].type
    }
    dealRules[0].selectVariableVo = tmp
    this.setAttr('dealRules', dealRules)
  }

  getList = async (query, callback) => {
    const { childMode } = this.props.item.dealRules[0]
    const { pageSize, pageNo, kw } = query
    if (childMode === 1) {
      const params = {
        pageNum: pageNo,
        pageSize,
        using: 1,
        type: 2,
        modelId: this.context.modelId
      }
      const res = await this.flowStore.getProcessList(params)
      callback(res)
    } else {
      const res = (await this.flowStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
      callback(res)
    }
  }

  getFieldList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res = (await this.props.formSetGridStore.listFieldWithPage({
      pageNo,
      wd: kw,
      pageSize
    })) || { list: [] }
    this.setState({
      fieldList: pageNo === 1 ? res.list : [...this.state.fieldList, ...res.list]
    })
    callback(res.list)
  }

  getParModelId = () => {
    const arr = window.location.href.split('?')[0].split('/')
    const parModelId = arr[arr.length - 1]

    return parModelId
  }

  getPrevTacheId = () => {
    const { item, links } = this.props
    const link = links.find((l) => l.to.id === item.id)

    return link ? link.from.id : ''
  }

  handleChangePase = (e) => {
    const activityStageConfig = {
      stageCode: e.value,
      stageName: e.label
    }
    this.setAttr('activityStageConfig', activityStageConfig)
  }

  handleShowMappingFields = () => {
    const { mode } = this.state

    if (!mode || !mode.id) {
      message.error(i18n('conf.model.proces.SelTtypeOfProcess'))
      return
    }

    if (!this.getPrevTacheId()) {
      message.error(i18n('please.connect.enter.path'))
      return
    }

    this.setState({ visible: 'fieldMapping' })
  }

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { show, mode, modelStartFlowList, visible } = this.state
    const DealRulus = item.dealRules[0]
    const writebackFieldVos = []
    _.map(DealRulus.writebackFieldVos || [], (ite) => {
      ite && writebackFieldVos.push({ label: ite.name, key: ite.id })
    })
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
      <Form>
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
              <span className="required-item-name">
                {i18n('conf.model.proces.subProcessMode', '子流程模式')}
              </span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem>
              <Select
                disabled={!!item.dealRules[0].dynamicReferenceChild}
                value={DealRulus.childMode}
                style={{ width: '100%' }}
                onChange={(e) => {
                  this.handleChange('childMode', e)
                }}
                placeholder={i18n('conf.model.proces.selectSubProcessMode', '请选择子流程模式')}
              >
                <Option value={0}>{i18n('conf.model.proces.moreContinue', '多实例流转')}</Option>
                <Option value={1}>{i18n('conf.model.proces.continue', '单实例流转')}</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        {window.change_switch ? (
          <Row gutter={8}>
            <Col span={19} offset={5}>
              <div className="required-item">
                <Checkbox
                  className="required-item-name"
                  checked={!!item.dealRules[0].dynamicReferenceChild}
                  onChange={this.onChange}
                >
                  {i18n('dynamic_sub_process', '动态引入子流程')}
                </Checkbox>
              </div>
            </Col>
          </Row>
        ) : null}
        {item.dealRules[0].dynamicReferenceChild ? null : (
          <Row gutter={8}>
            <Col span={5} className="left_label">
              <div className="required-item">
                <span className="required-item-icon">*</span>
                <span className="required-item-name">
                  {i18n('conf.model.proces.typeOfProcess', '引用流程类型')}
                </span>
              </div>
            </Col>
            <Col span={19}>
              <FormItem
                validateStatus={!mode.id && isSubmit ? 'error' : 'success'}
                help={
                  !mode.id && isSubmit
                    ? i18n('conf.model.proces.SelTtypeOfProcess', '请选择引用流程类型')
                    : ''
                }
              >
                <LazySelect
                  labelInValue
                  value={
                    DealRulus.childModel && DealRulus.childModel.id && mode.id
                      ? { label: mode.name, key: mode.id }
                      : undefined
                  }
                  onChange={(data) => {
                    this.handleChange('childModel', data.key, data)
                  }}
                  placeholder={i18n('conf.model.proces.SelTtypeOfProcess', '请选择引用流程类型')}
                  getList={this.getList}
                />
              </FormItem>
            </Col>
          </Row>
        )}

        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              {/* <span className="required-item-icon">*</span> */}
              <span className="required-item-name">{i18n('Phase')}</span>
            </div>
          </Col>
          <Col span={19}>
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
        {item.dealRules[0].dynamicReferenceChild ? (
          <Row gutter={8}>
            <Col span={5} className="left_label">
              <div className="required-item">
                <span className="required-item-icon">*</span>
                <span className="required-item-name">
                  {i18n('conf.model.process.select.param', '选择变量')}
                </span>
              </div>
            </Col>
            <Col span={19}>
              <Select
                style={{ width: '100%' }}
                value={
                  item.dealRules[0].selectVariableVo ? item.dealRules[0].selectVariableVo.id : ''
                }
                onChange={(value) => {
                  this.changeVo(value)
                }}
              >
                {_.map(this.flowStore.allParam, (item) => {
                  if (!item.is_builtin && item.type === 4) {
                    return <Option key={item.id}>{item.name}</Option>
                  }
                })}
              </Select>
            </Col>
          </Row>
        ) : null}
        {DealRulus.childMode ? null : (
          <div>
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.proces.modelStatus', '主流程状态')}
                  </span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
                  <RadioGroup
                    value={DealRulus.childModel ? DealRulus.childModel.needSuspend : 0}
                    onChange={(e) => {
                      this.handleChange('needSuspend', e)
                    }}
                    disabled={!!DealRulus.childMode}
                  >
                    <Radio value={0}>{i18n('status_10', '挂起')}</Radio>
                    <Radio value={1}>{i18n('go_on', '继续')}</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-name">
                    {i18n('conf.model.proces.createSubProType', '子流程建单方式')}
                  </span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
                  <RadioGroup
                    value={DealRulus.autoCreateTicket}
                    onChange={(e) => {
                      this.handleChange('autoCreateTicket', e)
                    }}
                    disabled={!!DealRulus.childMode}
                  >
                    <Radio value={0}>{i18n('conf.model.proces.automaticCreate', '自动建单')}</Radio>
                    <Radio value={1}>{i18n('conf.model.proces.manual', '手动建单')}</Radio>
                  </RadioGroup>
                  <Button size="small" onClick={this.handleShowMappingFields}>
                    {i18n('config.mapping.field', '配置映射字段', 'Config Mapping Field')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </div>
        )}
        {!item.dealRules[0].dynamicReferenceChild && (show || item.dealRules[0].childMode === 1) ? (
          <Row gutter={8}>
            <Col span={5} className="left_label">
              <div className="required-item">
                <span className="required-item-icon">*</span>
                <span className="required-item-name">
                  {i18n('conf.model.proces.auto_path', '迁出路径')}
                </span>
              </div>
            </Col>
            <Col span={19}>
              <FormItem
                validateStatus={!DealRulus.startFlow && isSubmit ? 'error' : 'success'}
                help={
                  !DealRulus.startFlow && isSubmit
                    ? i18n('conf.model.proces.Select_path', '请选择迁出路径')
                    : ''
                }
              >
                <Select
                  value={DealRulus.startFlow}
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleChange('startFlow', e)
                  }}
                  placeholder={i18n('conf.model.proces.Select_path', '请选择迁出路径')}
                >
                  {modelStartFlowList.map((model) => {
                    return <Option key={model.id}>{model.name}</Option>
                  })}
                </Select>
              </FormItem>
            </Col>
          </Row>
        ) : null}
        {/* 子流程模式单实例和 子流程模式多实例主流程状态继续的时候是没有回写主流程的 */}
        {DealRulus.childMode ||
        (!DealRulus.childMode &&
          DealRulus.childModel &&
          +DealRulus.childModel.needSuspend === 1) ? null : (
          <Row gutter={8}>
            <Col span={5} className="left_label">
              <div className="required-item">
                <span className="required-item-name">
                  {i18n('conf.model.proces.removeProcess', '回写主流程')}
                </span>
              </div>
            </Col>
            <Col span={19}>
              <FormItem
                help={
                  +DealRulus.isWriteback === 1 && !DealRulus.writebackFieldVos && isSubmit
                    ? i18n('conf.model.proces.selectRemoveParam', '请选择回写字段')
                    : ''
                }
                validateStatus={
                  +DealRulus.isWriteback === 1 && !DealRulus.writebackFieldVos && isSubmit
                    ? 'error'
                    : 'success'
                }
              >
                <RadioGroup
                  value={DealRulus.isWriteback}
                  onChange={(e) => {
                    this.handleChange('isWriteback', e)
                  }}
                >
                  <Radio value={'1'}>{i18n('yes', '是')}</Radio>
                  <Radio value={'0'}>{i18n('no', '否')}</Radio>
                </RadioGroup>
                {+DealRulus.isWriteback === 1 && (
                  <LazySelect
                    mode="multiple"
                    value={writebackFieldVos}
                    onChange={(value, fullValue) => {
                      const ids = _.map(value, (item) => item.key)
                      const list = _.filter(DealRulus.writebackFieldVos, (item) =>
                        _.includes(ids, item.id)
                      )

                      this.handleChange(
                        'writebackFieldVos',
                        _.unionBy([...list, ...fullValue], 'id')
                      )
                    }}
                    getList={this.getFieldList}
                    placeholder={i18n('conf.model.proces.selectRemoveParam', '请选择回写字段')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <FieldMappingModal
          visible={visible === 'fieldMapping'}
          parModelId={this.getParModelId()}
          subModelId={mode.id}
          activityId={this.getPrevTacheId()}
          onClose={() => this.setState({ visible: '' })}
        />
      </Form>
    )
  }
}

const subProcessWrap = Form.create()(subProcess)
export default subProcessWrap
