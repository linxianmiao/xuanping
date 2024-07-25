import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import getUid from '../../../utils/uuid'
import FlowStore from '../../store/flowStore'
import {
  Form,
  Input,
  Select,
  Radio,
  Modal,
  Checkbox,
  Tooltip,
  Row,
  Col,
  message,
  Tabs,
  Title,
  Collapse
} from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import { getUserLength, checkHandlersRangeVo } from './utils'
import NewCountersign from './component/newCountersign'
import NewCountersignWrap from './component/newCountersignWrap'
import PanelContent from './component/panelContent'
import LazySelect from '~/components/lazyLoad/lazySelect'
import TimingMonitor from './component/TimingMonitor'
import OverdueStrategy from './component/OverdueStrategy'
import ListenRule from './component/ListenRule'
import ExceptionStrategy from './component/ExceptionStrategy'
import TacheButtonConfig from './component/TacheButtonConfig'
import TacheButton from './component/TacheButton'

import styles from './index.module.less'
import _ from 'lodash'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option } = Select
const TabPane = Tabs.TabPane
@inject('formSetGridStore', 'basicInfoStore', 'globalStore')
@Injectable({ cooperate: 'mobx' })
@observer
class UserTask extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)

    const {
      item: { defaultStaffVos }
    } = props

    this.state = {
      visible: false,
      data: _.cloneDeep(this.props.item.notificationRules || []),
      panelIndex: 0,
      isSelectDefaultStaff: defaultStaffVos && defaultStaffVos.length > 0,
      currentNodes: []
    }
  }

  componentDidMount() {
    if (!window.node_custom) {
      const { item } = this.props
      const selectNodeNameVo = item.selectNodeNameVo
        ? item.selectNodeNameVo
        : { label: item.text, key: '' }
      this.props.form.setFieldsValue({ name: selectNodeNameVo })
    } else {
      this.props.form.setFieldsValue({ name: this.props.item.text })
    }
    if (this.props.item?.policy === 5) {
      this.getPreorderNode(this.props.item)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      const { item } = nextProps
      if (!window.node_custom) {
        const selectNodeNameVo = item.selectNodeNameVo
          ? item.selectNodeNameVo
          : { label: item.text, key: '' }
        this.props.form.setFieldsValue({ name: selectNodeNameVo, activityCode: item.activityCode })
      } else {
        this.props.form.setFieldsValue({
          name: nextProps.item.text,
          activityCode: item.activityCode
        })
      }
      this.setState({
        data: _.cloneDeep(nextProps.item.notificationRules || []),
        isSelectDefaultStaff:
          nextProps.item.defaultStaffVos && nextProps.item.defaultStaffVos.length > 0
      })
      if (nextProps.item?.policy === 5) {
        this.getPreorderNode(nextProps.item)
      }
    }
  }

  textChange = (type, val) => {
    const { item } = this.props
    const value = val.label ? val.label : val
    this.props.changeWidth(item.id, value)
    type === 'selectNodeNameVo' && this.setAttr('selectNodeNameVo', val)
  }

  handleChange = (type, e) => {
    if (type === 'policy') {
      this.setAttr('forwardActivityList', [])
      if (e === 5) {
        this.getPreorderNode(this.props.item)
      }
    }
    this.setAttr(type, e && e.target ? e.target.value : e)
    if (type === 'counterSign') {
      this.setAttr('policy', '')
      this.setAttr('counterMultiSign', 0)
    }
    if (type === 'needApproval' && e.target.value === 0) {
      this.setAttr('reviewers', [])
    }
    if (type === 'activityStageConfig') {
      const activityStageConfig = {
        stageCode: e.value,
        stageName: e.label
      }
      this.setAttr('activityStageConfig', activityStageConfig)
    }
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
                (_.isEmpty(executeParamPo.value) && _.isEmpty(executeParamPo.staffs)) ||
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

  handleProcessUserChange = (handlersRangeVo) => {
    const { scope, directSelectionVo } = handlersRangeVo
    const userAndGroupList = directSelectionVo ? directSelectionVo.userAndGroupList : []

    // 修改处理人范围的同时，默认处理人也要做对应的改变
    if (scope === 1) {
      this.setState({ isSelectDefaultStaff: false })
      this.setAttr('defaultStaffVos', [])
    } else {
      const prevDefaultStaff = this.props.item.defaultStaffVos || []
      const nextDefaultStaff = prevDefaultStaff.filter((s) =>
        userAndGroupList.some((t) => t.id === s.id)
      )
      this.setAttr('defaultStaffVos', nextDefaultStaff)

      if (_.isEmpty(userAndGroupList)) {
        this.setState({ isSelectDefaultStaff: false })
      }
    }

    this.setAttr('handlersRangeVo', handlersRangeVo)
  }

  handleShieldingList = (value) => {
    this.setAttr('shieldingList', value)
  }

  handleReviewersChange = (value) => {
    this.setAttr('reviewers', value)
  }

  handleChangeMultiSign = (e) => {
    this.setAttr('counterMultiSign', e.target.value)
  }

  // activityFlowId 修改节点中的操作按钮时，如果存在线按钮，需加上线id
  setAttr = (key, value, activityFlowId) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes', activityFlowId)
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

  onChange = (e) => {
    this.setAttr('isSelectShielding', e.target.checked ? 1 : 0)
    if (!e.target.checked) {
      this.setAttr('shieldingList', [])
    }
  }

  changeRelate = (e) => {
    this.setAttr('createRelatedTicket', e.target.checked ? 1 : 0)
  }

  changeMergeTicket = (value, key) => {
    const { mergeTicketVo = {} } = this.props.item
    const nextMergeTicketVo = {
      mergeTicketFlag: 0,
      deleteMergeTicketFlag: 0,
      mergeActionType: 0,
      ...mergeTicketVo,
      [key]: value
    }
    this.setAttr('mergeTicketVo', nextMergeTicketVo)
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

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res = (await this.flowStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
    callback(res)
  }

  // 获取先出路径信息
  getOutLinks = () => {
    const { item } = this.props
    const { links = [] } = this.flowStore.dataSource

    if (!item.outGoings || item.outGoings.length === 0) {
      return []
    }

    const result = []

    item.outGoings.forEach((id) => {
      const link = links.find((item) => item.id === id)
      if (link) {
        result.push(link)
      }
    })

    return result
  }

  // 获取当前节点的前序节点
  getPreorderNode = (item) => {
    const { dataSource } = this.flowStore
    const { nodes, links } = dataSource || {}
    let currentNodes = this.findNodes(nodes, links, item.id, []) || []
    currentNodes =
      // 去掉同步节点以及包容节点
      currentNodes = _.filter(
        currentNodes,
        (v) =>
          v.activitiType === 'UserTask' ||
          v.activitiType === 'StartNoneEvent' ||
          v.activitiType === 'ApprovalTask' ||
          v.activitiType === 'AutomaticDelivery'
      )
    currentNodes = _.filter(currentNodes, (v) => v.id !== item.id)
    this.setState({ currentNodes })
  }

  findNodes = (nodes, links, id, data = []) => {
    try {
      _.forEach(links, (d) => {
        if (d.to?.id === id) {
          const ids = _.map(data, (v) => v?.id)
          if (!ids.includes(d.from?.node?.id)) {
            const list = _.filter(nodes, (v) => v.id === d.from?.node?.id)[0] || d.from?.node
            data.push(list)
          } else {
            return data
          }
          if (d.from?.node.activitiType !== 'StartNoneEvent') {
            this.findNodes(nodes, links, d.from?.id, data)
          }
        }
      })

      return data
    } catch (e) {
      console.log(e)
    }
  }

  getTenants = async (query, callback) => {
    const res = (await axios.get(API.queryAllTenantList, { params: query })) || {}
    const list = res.list || []

    callback(list)
  }

  render() {
    const { item } = this.props
    const { isSubmit, nodeList, dataSource, stageList } = this.flowStore
    const { getFieldDecorator } = this.props.form
    const { panelIndex, visible, data, isSelectDefaultStaff, currentNodes } = this.state
    const triggerData = data[panelIndex] || {}
    const modelList = this.props.formSetGridStore.gridList
    const reviewers = item.reviewers || []
    const relateModels = item.relateModels
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    const isShared = this.props.basicInfoStore.isShared
    const { id: modelId } = this.props.basicInfoStore.modelData
    const { remoteTicket } = this.props.globalStore.configAuthor
    // 哪些按钮无权限
    const hideTypeButtons = []
    // 跨租户改派由全局开关控制
    if (window.crossUnitReassign !== '1') {
      hideTypeButtons.push('cross_unit_reassignment')
    }
    // 远程工单由全局开关控制
    if (!remoteTicket) {
      hideTypeButtons.push('remote_ticket')
    }
    // 协办
    const coOperation = {
      coOrganizerModels: item.coOrganizerModels || [],
      getList: this.getList,
      handleChange: (type, value) => this.handleChange(type, value),
      createCoOrganizer: !!item.createCoOrganizer,
      onChange: (value) => this.setAttr('createCoOrganizer', value)
    }
    const activityStageConfigValue = item.activityStageConfig
      ? {
          key: item.activityStageConfig.stageCode,
          value: item.activityStageConfig.stageCode,
          label: item.activityStageConfig.stageName
        }
      : undefined
    return (
      <div id="userTask">
        <Tabs>
          <TabPane tab={i18n('basic_attribute', '基本属性')} key="1" forceRender>
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">{i18n('name', '名称')}</span>
                </div>
              </Col>
              <Col span={19}>
                {!window.node_custom ? (
                  <FormItem>
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: i18n('conf.model.proces.selectName', '请选择节点名称')
                        }
                      ]
                    })(
                      <Select
                        showSearch
                        labelInValue
                        notFoundContent={i18n('globe.not_find', '无法找到')}
                        style={{ width: '100%' }}
                        onChange={(e) => {
                          this.textChange('selectNodeNameVo', e)
                        }}
                        placeholder={i18n('conf.model.proces.selectName', '请选择节点名称')}
                        optionFilterProp="children"
                        getPopupContainer={() => document.getElementById('userTask')}
                      >
                        {nodeList.map((node) => {
                          return (
                            <Option key={node.id} value={node.id}>
                              {node.name}
                            </Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                ) : (
                  <FormItem>
                    {getFieldDecorator('name', {
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
                    })(
                      <Input
                        onChange={(e) => {
                          this.textChange('name', e.target.value)
                        }}
                      />
                    )}
                  </FormItem>
                )}
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
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">{i18n('approval_type', '审批类型')}</span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
                  <RadioGroup
                    value={item.counterSign}
                    onChange={(e) => {
                      this.handleChange('counterSign', e)
                    }}
                  >
                    <Radio value={0}>{i18n('normal_mode', '标准')}</Radio>
                    <Radio value={1}>{i18n('counter_sign', '会签')}</Radio>
                    <Radio value={2}>{i18n('counterSign', '依次会签')}</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>

            {item.counterSign ? (
              <Row gutter={8}>
                <Col span={5} className="left_label">
                  <div className="required-item">
                    <span className="required-item-name">
                      {i18n('Whether_to_sign_in_multiple_groups', '是否多组会签')}
                    </span>
                  </div>
                </Col>
                <Col span={19}>
                  <FormItem>
                    <RadioGroup value={item.counterMultiSign} onChange={this.handleChangeMultiSign}>
                      <Radio value={1}>{i18n('yes', '是')}</Radio>
                      <Radio value={0}>{i18n('no', '否')}</Radio>
                    </RadioGroup>
                  </FormItem>
                </Col>
              </Row>
            ) : null}

            <Row gutter={8}>
              <Col span={19} offset={5}>
                <div className="required-item">
                  <Checkbox
                    className="required-item-name"
                    checked={item.isCheckedTenant}
                    onChange={(e) => {
                      const checked = e.target.checked
                      this.handleChange('isCheckedTenant', checked)
                      if (!checked) {
                        this.handleChange('cooperateTenant', {})
                      }
                    }}
                  >
                    跨租户协同
                  </Checkbox>
                </div>
              </Col>
            </Row>

            {item.isCheckedTenant ? (
              <Row gutter={8}>
                <Col span={5} className="left_label">
                  <div className="required-item">
                    <span className="required-item-name">
                      {i18n('config.mapping.targetTenant', '目标租户')}
                    </span>
                  </div>
                </Col>
                <Col span={19}>
                  <FormItem
                    validateStatus={
                      (_.isEmpty(item.cooperateTenant) ||
                        (!_.isEmpty(item?.cooperateTenant) &&
                          _.isEmpty(item?.cooperateTenant?.tenantId))) &&
                      isSubmit
                        ? 'error'
                        : 'success'
                    }
                    help={
                      (_.isEmpty(item.cooperateTenant) ||
                        (!_.isEmpty(item?.cooperateTenant) &&
                          _.isEmpty(item?.cooperateTenant?.tenantId))) &&
                      isSubmit
                        ? '请选择目标租户'
                        : ''
                    }
                  >
                    <LazySelect
                      placeholder={'请选择目标租户'}
                      labelInValue={true}
                      value={
                        !_.isEmpty(item.cooperateTenant) &&
                        !_.isEmpty(item.cooperateTenant?.tenantId)
                          ? {
                              label: item.cooperateTenant.tenantName,
                              value: item.cooperateTenant.tenantId
                            }
                          : []
                      }
                      getList={this.getTenants}
                      onChange={(value) => {
                        let data = {}
                        if (!_.isEmpty(value)) {
                          data = {
                            tenantId: value.value,
                            tenantName: value.label
                          }
                        }
                        this.handleChange('cooperateTenant', data)
                      }}
                    />
                  </FormItem>
                </Col>
              </Row>
            ) : null}

            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">{i18n('handler_range', '处理人范围')}</span>
                </div>
              </Col>
              <Col span={19}>
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
                    isShared={isShared}
                    isShowUserVariable
                    handlersRangeVo={item.handlersRangeVo}
                    handleUserChange={this.handleProcessUserChange}
                    cooperateTenant={item.cooperateTenant}
                  />
                </FormItem>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={19} offset={5}>
                <div className="required-item">
                  <Checkbox
                    className="required-item-name"
                    // 无处理人范围 或 按规则选择处理人范围 时 禁用
                    disabled={
                      !item.handlersRangeVo ||
                      item.handlersRangeVo.scope === 1 ||
                      _.isEmpty(
                        item.handlersRangeVo.directSelectionVo
                          ? item.handlersRangeVo.directSelectionVo.userAndGroupList
                          : []
                      )
                    }
                    checked={isSelectDefaultStaff}
                    onChange={(e) => {
                      const checked = e.target.checked
                      this.setState({ isSelectDefaultStaff: checked }, () => {
                        if (!checked) {
                          this.setAttr('defaultStaffVos', [])
                        }
                      })
                    }}
                  >
                    指定默认处理人
                  </Checkbox>
                </div>
                {isSelectDefaultStaff && (
                  <FormItem>
                    <Select
                      placeholder={i18n('globe.select', '请选择')}
                      mode="multiple"
                      allowClear
                      value={_.map(item.defaultStaffVos, (t) => t.id)}
                      onChange={(value, options) => {
                        this.setAttr(
                          'defaultStaffVos',
                          options.map((o) => ({
                            id: o.key,
                            name: o.props.children,
                            type: o.props.type
                          }))
                        )
                      }}
                    >
                      {_.map(
                        _.get(item, 'handlersRangeVo.directSelectionVo.userAndGroupList'),
                        (option) => {
                          // 指定默认处理人只支持用户、用户组、变量
                          if ([0, 1, 5].includes(option.type)) {
                            return (
                              <Option key={option.id} type={option.type}>
                                {option.name}
                              </Option>
                            )
                          }
                        }
                      )}
                    </Select>
                  </FormItem>
                )}
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={19} offset={5}>
                <div className="required-item">
                  <Checkbox
                    className="required-item-name"
                    checked={!!item.isSelectShielding}
                    onChange={this.onChange}
                  >
                    {i18n('disHandler_range', '设置屏蔽人员')}
                  </Checkbox>
                </div>
                {item.isSelectShielding ? (
                  <FormItem
                    className={
                      getUserLength(item.shieldingList) < 1 && isSubmit ? 'users-tips' : ''
                    }
                    validateStatus={
                      getUserLength(item.shieldingList) < 1 && isSubmit ? 'error' : 'success'
                    }
                    help={
                      getUserLength(item.shieldingList) < 1 && isSubmit
                        ? i18n('ticket.create.select_Nohandler', '请选择屏蔽人员')
                        : ''
                    }
                  >
                    <NewCountersign
                      values={item.shieldingList}
                      handleUserChange={this.handleShieldingList}
                      isShared={isShared}
                    />{' '}
                  </FormItem>
                ) : null}
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">{i18n('allocation', '分配方式')}</span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem
                  validateStatus={!item.policy && isSubmit ? 'error' : 'success'}
                  help={
                    !item.policy && isSubmit
                      ? i18n('ticket.forms.pinputAllot', '请选择分配方式')
                      : ''
                  }
                >
                  <Select
                    getPopupContainer={() => document.getElementById('userTask')}
                    value={item.policy}
                    onChange={(e) => {
                      this.handleChange('policy', e)
                    }}
                    style={{ width: '100%' }}
                  >
                    <Option value={1}>{i18n('allot1', '由上一处理人指定')}</Option>
                    <Option value={2}>{i18n('allot2', '由创建人指定')}</Option>
                    {'' + item.counterSign === '0' ? (
                      <Option value={3}>{i18n('allot3', '主动认领')}</Option>
                    ) : (
                      []
                    )}
                    <Option value={4}>{i18n('allot4', '自动分配')}</Option>
                    <Option value={5}>{i18n('allot5', '由前序环节指定')}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            {item.policy === 5 && (
              <Row gutter={8} style={{ marginBottom: '16px' }}>
                <Col span={5} className="left_label">
                  <div className="required-item">
                    <span className="required-item-icon">*</span>
                    <span className="required-item-name">{i18n('pref.link', '前序环节')}</span>
                  </div>
                </Col>
                <Col span={19}>
                  <FormItem
                    validateStatus={
                      _.isEmpty(item?.forwardActivityList) && isSubmit ? 'error' : 'success'
                    }
                    help={
                      _.isEmpty(item?.forwardActivityList) && isSubmit
                        ? i18n('ticket.forms.pref.link', '请选择前序环节')
                        : ''
                    }
                  >
                    <Select
                      getPopupContainer={() => document.getElementById('userTask')}
                      value={item.forwardActivityList && item.forwardActivityList[0]?.id}
                      onChange={(value, option) => {
                        this.handleChange('forwardActivityList', [
                          {
                            id: value,
                            name: option.children,
                            code: option.key
                          }
                        ])
                      }}
                      style={{ width: '100%' }}
                    >
                      {_.map(currentNodes, (item) => {
                        return (
                          <Option value={item.id} key={item.activityCode}>
                            {item.text || item.name}
                          </Option>
                        )
                      })}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            )}
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
                      !item.formId && isSubmit
                        ? i18n('ticket.forms.pinputForm', '请选择引用表单')
                        : ''
                    }
                  >
                    <Select
                      value={item.formId}
                      style={{ width: '100%' }}
                      onChange={(e) => {
                        this.handleChange('formId', e)
                      }}
                      getPopupContainer={() => document.getElementById('userTask')}
                    >
                      {_.map(modelList, (model) => {
                        return (
                          <Option key={model.id} value={model.id}>
                            {model.name}
                          </Option>
                        )
                      })}
                    </Select>
                  </FormItem>
                  <div className="ticket-from required-item">
                    {i18n('conf.model.fields.Noquote_firm', '没有我引用的表单？')}
                    <a onClick={this.createTicket}>
                      {i18n('conf.model.fields.new.field', '新建表单')}
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
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
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">{i18n('review', '审阅')}</span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
                  <RadioGroup
                    value={item.needApproval}
                    onChange={(e) => {
                      this.handleChange('needApproval', e)
                    }}
                  >
                    <Radio value={1}>{i18n('yes', '是')}</Radio>
                    <Radio value={0}>{i18n('no', '否')}</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
            {item.needApproval ? (
              <Row gutter={8}>
                <Col span={5} className="left_label">
                  <div className="required-item">
                    <span className="required-item-icon">*</span>
                    <span className="required-item-name">
                      {i18n('conf.model.proces.reviewer', '审阅人范围')}
                    </span>
                  </div>
                </Col>
                <Col span={19}>
                  <FormItem
                    className={getUserLength(reviewers) < 1 && isSubmit ? 'users-tips' : ''}
                    validateStatus={getUserLength(reviewers) < 1 && isSubmit ? 'error' : 'success'}
                    help={
                      getUserLength(reviewers) < 1 && isSubmit
                        ? i18n('ticket.create.select_handler', '请选择处理人')
                        : ''
                    }
                  >
                    <NewCountersign
                      values={item.reviewers}
                      handleUserChange={this.handleReviewersChange}
                      isShared={isShared}
                    />{' '}
                  </FormItem>
                </Col>
              </Row>
            ) : null}
          </TabPane>
          <TabPane tab="操作控制" key="2" forceRender>
            <Row>
              <TacheButton
                dataSource={dataSource}
                tacheInfo={item}
                hideTypeButtons={hideTypeButtons}
                onChange={(value, activityFlowId) =>
                  this.setAttr('tacheButton', value, activityFlowId)
                }
                coOperation={coOperation}
              />
            </Row>
            <Row>
              <Collapse>
                <Collapse.Card header="工单设置" key={0}>
                  <Row gutter={8}>
                    <Col span={5} className="left_label">
                      <div className="required-item">
                        <span className="required-item-name">
                          {i18n('conf.model.proces.relate', '关联工单设置')}
                        </span>
                      </div>
                    </Col>
                    <Col span={19}>
                      <FormItem>
                        <LazySelect
                          mode="multiple"
                          value={relateModels || []}
                          onChange={(value) => {
                            this.handleChange('relateModels', value)
                          }}
                          placeholder={i18n('pl_select_modal', '请选择模型')}
                          getList={this.getList}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col span={19} offset={5}>
                      <div className="required-item">
                        <Checkbox
                          className="required-item-name"
                          checked={!!item.createRelatedTicket}
                          onChange={this.changeRelate}
                        >
                          {i18n('createRelateTicket', '支持新建关联工单')}
                        </Checkbox>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col span={5} className="left_label">
                      <div className="required-item">
                        <span className="required-item-name">
                          {i18n('conf.model.proces.mergeTicket', '合并工单设置')}
                        </span>
                      </div>
                    </Col>
                    <Col span={19}>
                      <FormItem>
                        <Checkbox
                          className="required-item-name"
                          checked={!!(item.mergeTicketVo || {}).mergeTicketFlag}
                          onChange={(e) =>
                            this.changeMergeTicket(e.target.checked ? 1 : 0, 'mergeTicketFlag')
                          }
                        >
                          {i18n('createMergeTicket1', '支持合并工单')}
                        </Checkbox>
                        <Checkbox
                          className="required-item-name"
                          checked={!!(item.mergeTicketVo || {}).deleteMergeTicketFlag}
                          onChange={(e) =>
                            this.changeMergeTicket(
                              e.target.checked ? 1 : 0,
                              'deleteMergeTicketFlag'
                            )
                          }
                        >
                          {i18n('deleteMergeTicket1', '支持删除合并工单')}
                        </Checkbox>
                        <br />
                        <Checkbox
                          checked={!!(item.mergeTicketVo || {}).mergeActionType}
                          onChange={(e) =>
                            this.changeMergeTicket(e.target.checked ? 1 : 0, 'mergeActionType')
                          }
                        >
                          主单完成触发脚本
                        </Checkbox>
                      </FormItem>
                    </Col>
                  </Row>
                </Collapse.Card>
              </Collapse>
            </Row>
            {/* 处理时长设置 */}
            <Row>
              <Collapse defaultActiveKey={[0]}>
                <Collapse.Card header="处理时长设置" key={0}>
                  <Row gutter={8}>
                    {/* <Col span={5} className="left_label">
                      <div className="required-item">
                        <span className="required-item-name">处理时长设置</span>
                      </div>
                    </Col> */}
                    <Col span={24}>
                      <TimingMonitor
                        isSubmit={isSubmit}
                        modelId={modelId}
                        value={item.olaMonitorVos}
                        onChange={(value) => this.setAttr('olaMonitorVos', value)}
                      />
                    </Col>
                  </Row>
                </Collapse.Card>
              </Collapse>
            </Row>
          </TabPane>
          <TabPane tab={i18n('action_rules', '动作策略')} key="3" forceRender>
            <Title>触发策略</Title>
            <Row gutter={8} className={styles.partContent}>
              <Col span={4} className="left_label">
                <div className="required-item" style={{ lineHeight: '28px' }}>
                  <span className="required-item-name">策略</span>
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
            <Title>逾期策略</Title>
            <Row gutter={8} className={styles.partContent}>
              <Col span={4} className="left_label">
                <div className="required-item" style={{ lineHeight: '28px' }}>
                  <span className="required-item-name">策略</span>
                </div>
              </Col>
              <Col span={20}>
                <OverdueStrategy
                  isSubmit={isSubmit}
                  links={this.getOutLinks()}
                  olaMonitors={item.olaMonitorVos}
                  value={item.olaStrategyList || []}
                  onChange={(value) => this.setAttr('olaStrategyList', value)}
                />
              </Col>
            </Row>
            <Title>监听策略</Title>
            <Row gutter={8} className={styles.partContent}>
              <Col span={4} className="left_label">
                <div className="required-item" style={{ lineHeight: '28px' }}>
                  <span className="required-item-name">策略</span>
                </div>
              </Col>
              <Col span={20}>
                <ListenRule
                  modelId={modelId}
                  value={item.listenerRules || []}
                  onChange={(value) => this.setAttr('listenerRules', value)}
                />
              </Col>
            </Row>
            <Title>异常处理策略</Title>
            <div className={styles.partContent}>
              <p>该节点找不到处理人时:</p>
              <ExceptionStrategy
                isSubmit={isSubmit}
                value={item.exceptionStrategyVo || {}}
                onChange={(value) => this.setAttr('exceptionStrategyVo', value)}
              />
            </div>

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
                    modelId={modelId}
                    panelIndex={panelIndex}
                    triggerData={triggerData}
                    setTriggerData={this.setTriggerData}
                    getFieldDecorator={getFieldDecorator}
                  />
                </div>
              </Modal>
            )}
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

const UserTaskNodeWrap = Form.create()(UserTask)
export default UserTaskNodeWrap
