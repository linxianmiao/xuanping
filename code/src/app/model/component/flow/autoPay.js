import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { PlusOutlined } from '@uyun/icons'
import FlowStore from '../../store/flowStore'
import { Form, Input, Select, Radio, Modal, Checkbox, Tooltip, Row, Col } from '@uyun/components'
import { getUserLength, checkHandlersRangeVo } from './utils'
import NewCountersign from './component/newCountersign'
import NewCountersignWrap from './component/newCountersignWrap'
import LazySelect from '~/components/lazyLoad/lazySelect'
import PanelContent from './component/panelContent'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option, OptGroup } = Select
@inject('formSetGridStore', 'fieldListStore')
@Injectable({ cooperate: 'mobx' })
@observer
class AutoPay extends Component {
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
    if (this.props.item?.policy === 5) {
      this.getPreorderNode(this.props.item)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item.id !== nextProps.item.id) {
      this.props.form.setFieldsValue({
        name: nextProps.item.text,
        activityCode: nextProps.item.activityCode
      })
      this.setState({
        data: nextProps.item.notificationRules || [],
        isSelectDefaultStaff:
          nextProps.item.defaultStaffVos && nextProps.item.defaultStaffVos.length > 0
      })
      if (nextProps.item?.policy === 5) {
        this.getPreorderNode(nextProps.item)
      }
    }
  }

  textChange = (e) => {
    const { item } = this.props
    this.props.changeWidth(item.id, e.target.value)
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

  triggerChange = (value) => {
    this.setState({
      data: value
    })
  }

  handleProcessUserChange = (handlersRangeVo) => {
    const {
      scope,
      directSelectionVo: { userAndGroupList }
    } = handlersRangeVo

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

  setAttr = (key, value) => {
    const { item } = this.props
    this.flowStore.setAttr(item.id, key, value, 'nodes')
  }

  changeVisible = () => {
    this.setState({ visible: true, ruleId: '' })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      data: this.props.item.notificationRules || []
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

  handleExecuteChange = (e) => {
    this.setAttr('autoExecutionType', e.target.value)
    // 为了更新数据
    if (e.target.value === '1') {
      this.setAttr('counterSign', 0)
      this.setAttr('needApproval', 0)
    } else {
      const { item } = this.props
      const data = {
        formId: item.formId,
        activitiType: item.activitiType,
        autoExecutionType: '0',
        groupId: item.groupId,
        height: item.height,
        icon: item.icon,
        id: item.id,
        shape: item.shape,
        text: item.text,
        width: item.width,
        x: item.x,
        y: item.y,
        sceneType: item.sceneType
      }
      this.flowStore.setItem(item.id, data, 'nodes')
    }
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

  render() {
    const { item } = this.props
    const { getFieldDecorator } = this.props.form
    const { panelIndex, visible, data, isSelectDefaultStaff, currentNodes } = this.state
    const triggerData = data[panelIndex] || {}
    const modelList = this.props.formSetGridStore.gridList
    const isSubmit = this.flowStore.isSubmit
    const reviewers = item.reviewers || []
    const relateModels = item.relateModels
    const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    return (
      <Form id="AutomaticDelivery">
        <Row gutter={8}>
          <Col span={5} className="left_label">
            <div className="required-item">
              <span className="required-item-icon">*</span>
              <span className="required-item-name">{i18n('name', '名称')}</span>
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
              <span className="required-item-name">{i18n('autoPay-env', '处理场景')}</span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem
              validateStatus={!item.sceneType && isSubmit ? 'error' : 'success'}
              help={
                !item.sceneType && isSubmit
                  ? i18n('ticket.forms.pinputAllot', '请选择分配方式')
                  : ''
              }
            >
              <Select
                value={item.sceneType ? '' + item.sceneType : undefined}
                onChange={(e) => {
                  this.handleChange('sceneType', +e)
                }}
                style={{ width: '100%' }}
              >
                {_.map(this.props.res, (re) => {
                  return (
                    <OptGroup label={re.label}>
                      {_.map(re.children, (child) => {
                        return <Option value={child.value + ''}>{child.label}</Option>
                      })}
                    </OptGroup>
                  )
                })}
              </Select>
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
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    this.handleChange('formId', e)
                  }}
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
              <div className="ticket-from required-item">
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
              <span className="required-item-name">{i18n('autoPay_type', '执行方式')}</span>
            </div>
          </Col>
          <Col span={19}>
            <FormItem>
              <Radio.Group
                value={item.autoExecutionType}
                buttonStyle="solid"
                onChange={this.handleExecuteChange}
              >
                <Radio.Button value="0">{i18n('autoOperation', '自动执行')}</Radio.Button>
                <Radio.Button value="1">{i18n('manualExecution', '手动执行')}</Radio.Button>
              </Radio.Group>
              <Tooltip
                title={
                  item.autoExecutionType === '1'
                    ? i18n(
                        'automaticDelivery-tips',
                        '手动执行：需要人员审批操作触发持续交付自动化任务'
                      )
                    : i18n('automaticDelivery-tips1', '自动执行：系统会自动触发持续交付自动化任务')
                }
              >
                <i className="iconfont icon-jinggao icon-tips" />
              </Tooltip>
            </FormItem>
          </Col>
        </Row>

        {item.autoExecutionType === '1' && (
          <div>
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
                    isShowUserVariable
                    handlersRangeVo={item.handlersRangeVo}
                    handleUserChange={this.handleProcessUserChange}
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
                    />
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
                    />
                  </FormItem>
                </Col>
              </Row>
            ) : null}
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item">
                  <span className="required-item-icon">*</span>
                  <span className="required-item-name">
                    {i18n('system.global.options', '处理意见')}
                  </span>
                </div>
              </Col>
              <Col span={19}>
                <FormItem>
                  <RadioGroup
                    value={item.isRequiredHandingSuggestion || 0}
                    onChange={(e) => {
                      this.handleChange('isRequiredHandingSuggestion', e)
                    }}
                  >
                    <Radio value={0}>{i18n('conf.model.field.optional', '选填')}</Radio>
                    <Radio value={1}>{i18n('conf.model.field.required', '必填')}</Radio>
                    <Radio value={2}>{i18n('conf.model.field.tip3', '隐藏')}</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
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
              <Col span={19} offset={5}>
                <div className="required-item">
                  <Checkbox
                    className="required-item-name"
                    checked={!!item.createCoOrganizer}
                    onChange={(e) => {
                      this.setAttr('createCoOrganizer', e.target.checked ? 1 : 0)
                    }}
                  >
                    {i18n('createRelateTicket', '支持新建协办工单')}
                  </Checkbox>
                </div>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={5} className="left_label">
                <div className="required-item" style={{ lineHeight: '28px' }}>
                  <span className="required-item-name">{i18n('action_rules', '动作策略')}</span>
                </div>
              </Col>
              <Col span={19}>
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
          </div>
        )}
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
      </Form>
    )
  }
}

const AutoPayNodeWrap = Form.create()(AutoPay)
export default AutoPayNodeWrap
