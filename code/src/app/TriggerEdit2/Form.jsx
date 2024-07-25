import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Form, Input, Radio, Select, Row, Col, Button, message, Modal } from '@uyun/components'
import TriggerRules from '~/components/triggerRules'
import { linkTo } from '~/components/LowcodeLink'
import TimeStrategy from './components/TimeStrategy'
import Actions from './components/Actions'
import TriggerTiming from './components/TriggerTiming'
import TestResult from './components/TestResult'
import moment from 'moment'
import {
  validateTriggerBasicData,
  validateActionsValue,
  validateRequired,
  validateTimeStrategy,
  isEqualAction,
  hasActinoSelect
} from './logic'
import { incidentList } from './constant'
import styles from './index.module.less'
import _ from 'lodash'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15 }
}

@inject('triggerStore', 'triggerIndexStore')
@withRouter
@observer
class TriggerForm extends Component {
  state = {
    loading: false
  }

  componentDidMount() {
    const { triggerStore, triggerIndexStore } = this.props
    const { trigger } = this.props.triggerStore
    const id = this.props.id || this.props.match.params.id

    // 如果id存在，则获取触发器详情
    if (id) {
      triggerStore.getTriggerById(id).then((res) => {
        this.queryActions(res.triggerType)
      })
    } else {
      this.queryActions(trigger.triggerType)
    }

    triggerStore.getFieldParamList()
    triggerIndexStore.getAssignUsers()
  }

  componentWillUnmount() {
    this.props.triggerStore.destory()
  }

  queryActions = (type) => {
    this.props.triggerStore.getActionsByType(type)
  }

  handleChange = (value, field) => {
    const { trigger, actions, setTrigger } = this.props.triggerStore
    const nextTrigger = { ...trigger }
    nextTrigger[field] = value
    setTrigger(nextTrigger)

    // 切换触发类型时获取动作
    if (field === 'triggerType' && !actions[value]) {
      this.queryActions(value)
    }
  }

  /**
   * 校验执行动作值
   * @param {array} actionsValue 动作值集合
   * @param {array} currentActions 当前可选的动作
   * @param {array} createTicketFormRefs 创建工单动作中的表单ref集合
   */
  handleValidateActionsValue = async (actionsValue, currentActions, createTicketFormRefs) => {
    const { hasError, formValues } = await validateActionsValue(
      actionsValue,
      currentActions,
      createTicketFormRefs
    )

    // 必须至少选中一个动作
    if (!hasActinoSelect(actionsValue, currentActions)) {
      message.error('请选择执行动作')
      return { error: true }
    }

    if (hasError) {
      message.error('请完善选中的执行动作')
      return { error: true }
    }

    // 将创建工单动作的表单值赋给trigger
    const createTicketAction = _.find(actionsValue, (item) => item.type === 'createTicket')

    if (createTicketAction) {
      // 组装创建工单动作数据
      const ticketInfoList = formValues.map((form) => {
        const { modelId, flowId, executor = {} } = form
        return {
          modelId,
          flowId,
          executor,
          form: _.omit(form, 'executor')
        }
      })
      createTicketAction.ticketInfoList = ticketInfoList
    }

    return { actionsValue }
  }

  handleValidateTrigger = async () => {
    const { triggerStore } = this.props
    const { actions, createTicketFormRefs } = triggerStore
    const trigger = toJS(triggerStore.trigger)
    const { triggerType, actionList } = trigger

    triggerStore.setSubmitting(true)

    // 校验基础数据
    if (validateTriggerBasicData(trigger)) {
      return { error: true }
    }

    const currentActions = toJS(actions[triggerType])

    // 校验动作数据
    const { error, actionsValue } = await this.handleValidateActionsValue(
      actionList,
      currentActions,
      createTicketFormRefs
    )

    if (error) {
      return { error: true }
    }

    trigger.actionList = actionsValue

    return { error: false, values: trigger }
  }

  handleSave = async () => {
    const { error, values } = await this.handleValidateTrigger()

    if (error) {
      return
    }

    // 名称是否重复
    // let res = await axios.get(API.checkTriggerName(encodeURIComponent(values.name)))

    // if (res) {
    //   message.error('触发器名称不能重复')
    //   return
    // }

    const saveData = { ...values }

    if (saveData.timeStrategyVo) {
      const { executeTime } = saveData.timeStrategyVo

      // 后端不要带时区的
      saveData.timeStrategyVo.executeTime = executeTime
        ? moment(executeTime).format('YYYY-MM-DD HH:mm:ss')
        : ''
    }

    const { actions, trigger } = this.props.triggerStore
    const { triggerType } = saveData
    const actionTypes = actions[triggerType].map((item) => item.type)

    if (triggerType === '1') {
      // 选中事件触发时清空时间触发数据
      saveData.timeStrategyVo = null
    } else if (triggerType === '2') {
      // 选中时间触发时清空事件触发数据
      saveData.incident = undefined
      saveData.triggerConditions = null
    }

    // 清空另一种触发类型的动作
    saveData.actionList = _.filter(saveData.actionList, (item) => actionTypes.includes(item.type))

    this.setState({ loading: true })
    // 修改创建工单动作时下一环节指定处理人的传参
    const createTicketActions =
      _.filter(saveData.actionList, (d) => d.type === 'createTicket') || []
    _.forEach(createTicketActions, (d) => {
      _.forEach(d.ticketInfoList, (d2) => {
        if (d2.executor) {
          for (const key in d2.executor) {
            const arr = d2.executor[key]
            const users =
              _.filter(d2.executor[key], (user) => user.type === 1).map((d) => d.id) || []
            const groups =
              _.filter(d2.executor[key], (user) => user.type === 0).map((d) => d.id) || []
            if (users.length > 0 && groups.length > 0) {
              d2.executor[key] = { user: users, group: groups }
            } else if (users.length > 0) {
              d2.executor[key] = { user: users }
            } else if (groups.length > 0) {
              d2.executor[key] = { group: groups }
            }
          }
        }
        d2.executorAndGroup = d2.executor
        delete d2.executor
      })
    })

    _.forEach(saveData.actionList, (item) => {
      if (item.type === 'createTicket' && _.isEmpty(item.ticketInfoList)) {
        const detailInfoList =
          _.filter(toJS(trigger).actionList, (v) => v.type === 'createTicket') || []
        const ticketInfoList = _.map(detailInfoList[0]?.ticketInfoList, (v) => {
          return {
            flowId: v.flowId,
            form: v.form,
            modelId: v.modelId,
            executorAndGroup: v.executorAndGroup
          }
        })
        item.ticketInfoList = ticketInfoList
      }
    })
    const res = await axios.post(API.saveTrigger, saveData)

    this.setState({ loading: false })

    if (res === '200') {
      message.success('保存成功')
      let url = '/conf/trigger'
      if (window.LOWCODE_APP_KEY) {
        url = `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=trigger`
      }
      linkTo({
        url: url,
        pageKey: 'home',
        homeKey: 'trigger_list',
        history: this.props.history
      })
    }
  }

  handleTest = async () => {
    // 先校验执行动作的值
    const { triggerStore } = this.props
    const { trigger, actions, createTicketFormRefs } = toJS(triggerStore)
    const { triggerType, actionList } = trigger
    const currentActions = actions[triggerType]

    const { error, actionsValue } = await this.handleValidateActionsValue(
      actionList,
      currentActions,
      createTicketFormRefs
    )

    if (error) {
      return { error: true }
    }

    Modal.confirm({
      content: '测试将立即进行，请注意接收测试结果',
      onOk: () => {
        // 从动作值中过滤出当前的可选动作
        const existedActions = actionsValue.filter(
          (action) => !!currentActions.find((item) => isEqualAction(item, action))
        )
        // 补全当前触发类型下的动作
        const missingActions = currentActions.filter(
          (action) => !actionsValue.find((item) => isEqualAction(item, action))
        )
        const missingActionValues = missingActions.map((item) => ({
          type: item.type,
          actionCode: item.actionCode,
          useable: 0
        }))

        trigger.actionList = [...existedActions, ...missingActionValues]

        this.props.triggerStore.testTrigger(trigger)
      }
    })
  }

  getFormItemValidateInfo = (value, func, message) => {
    const { isSubmitting } = this.props.triggerStore
    const hasError = isSubmitting && func(value)

    return {
      validateStatus: hasError ? 'error' : 'success',
      help: hasError ? message : ''
    }
  }

  render() {
    const { loading } = this.state
    const { trigger, actions, isSubmitting, testResult } = this.props.triggerStore
    const {
      id,
      name,
      description,
      triggerType,
      incident,
      triggerConditions,
      timeStrategyVo,
      actionList,
      delay,
      delayTime,
      delayUnit
    } = toJS(trigger)

    const currentActions = toJS(actions[triggerType])

    return (
      <div
        id="notification-wrap"
        style={{ minHeight: 'calc(-108px + 100vh)' }}
        className={`content-layout ${
          window.LOWCODE_APP_KEY ? `${styles.triggerForm} add-padding ` : styles.triggerForm
        }`}
      >
        <FormItem
          {...formItemLayout}
          label="触发器名称"
          required
          {...this.getFormItemValidateInfo(name, validateRequired, '请输入触发器名称')}
        >
          <Input
            placeholder="请输入触发器名称"
            value={name}
            onChange={(e) => this.handleChange(e.target.value, 'name')}
          />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="触发器描述"
          required
          {...this.getFormItemValidateInfo(description, validateRequired, '请输入触发器描述')}
        >
          <Input.TextArea
            placeholder="请输入触发器描述，便于团队内的理解"
            value={description}
            onChange={(e) => this.handleChange(e.target.value, 'description')}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="类型" required>
          <RadioGroup
            size="large"
            disabled={!!id}
            value={triggerType}
            onChange={(e) => this.handleChange(e.target.value, 'triggerType')}
          >
            <RadioButton value="1">事件触发</RadioButton>
            <RadioButton value="2">时间触发</RadioButton>
          </RadioGroup>
          <span className={styles.tip}>
            触发器只支持一种触发类型生效，更换触发类型后将重置触发器内容配置
          </span>
        </FormItem>

        {/* 事件触发 */}
        {triggerType === '1' && (
          <>
            <FormItem
              {...formItemLayout}
              label="触发事件"
              required
              {...this.getFormItemValidateInfo(incident, validateRequired, '请选择触发事件')}
            >
              <Select
                placeholder="请选择触发事件"
                mode="multiple"
                value={incident || undefined}
                onChange={(value) => this.handleChange(value, 'incident')}
              >
                {incidentList.map((item) => (
                  <Option key={item.code}>{item.name}</Option>
                ))}
              </Select>
            </FormItem>
            <Row>
              <Col offset={3} span={20}>
                <TriggerRules
                  isError={isSubmitting}
                  value={triggerConditions || undefined}
                  onChange={(value) => this.handleChange(value, 'triggerConditions')}
                />
              </Col>
            </Row>
          </>
        )}

        {/* 时间策略 */}
        {triggerType === '2' && (
          <FormItem
            {...formItemLayout}
            label="定时策略"
            required
            {...this.getFormItemValidateInfo(
              timeStrategyVo,
              validateTimeStrategy,
              '请设置时间策略'
            )}
          >
            <TimeStrategy
              value={timeStrategyVo || {}}
              onChange={(value) => this.handleChange(value, 'timeStrategyVo')}
            />
          </FormItem>
        )}

        {/* 动作 */}
        <Row>
          <Col offset={3} span={20} className={styles.hits}>
            执行以下动作:
          </Col>
        </Row>
        <Row>
          <Col offset={3} span={20}>
            <Actions
              actions={currentActions || []}
              value={actionList}
              onChange={(value) => this.handleChange(value, 'actionList')}
            />
          </Col>
        </Row>

        {triggerType === '1' && (
          <FormItem {...formItemLayout} label="触发时机">
            <TriggerTiming
              delay={delay}
              delayTime={delayTime}
              delayUnit={delayUnit}
              onChange={this.handleChange}
            />
          </FormItem>
        )}

        <Row style={{ marginTop: 30 }}>
          <Col offset={3} span={20}>
            <Button type="primary" loading={loading} onClick={this.handleSave}>
              保存
            </Button>
            <Button type="primary" style={{ marginLeft: 10 }} onClick={this.handleTest}>
              测试
            </Button>
            <Button
              style={{ marginLeft: 10 }}
              onClick={() => {
                linkTo({
                  url: '/conf/trigger',
                  pageKey: 'home',
                  homeKey: 'trigger_list',
                  history: this.props.history
                })
              }}
            >
              返回
            </Button>
          </Col>
        </Row>

        {testResult.length > 0 && (
          <Row style={{ marginTop: 20 }}>
            <Col offset={3} span={20}>
              <TestResult data={toJS(testResult)} />
            </Col>
          </Row>
        )}
      </div>
    )
  }
}
export default TriggerForm
