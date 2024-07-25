import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { Form, Select, InputNumber, Radio, message } from '@uyun/components'
import Input from '~/public/input'
import TriggerAction from '~/trigger/component/triggerAction'
import uuid from '~/utils/uuid'
import TriggerIndexStore from '~/trigger/store/indexStore'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const getInitialStrategy = () => ({
  id: uuid(),
  name: '',
  delay: 2,
  delayTime: 0,
  delayUnit: 'MINUTES',
  params: [],
  olaId: undefined
})

// 单位
const units = [
  { label: '分', value: 'MINUTES' },
  { label: '时', value: 'HOURS' },
  { label: '天', value: 'DAYS' }
]

@Form.create()
@observer
class StrategyForm extends Component {
  static defaultProps = {
    links: [], // 流程图中的连线
    olaMonitors: [],
    onChange: () => {}
  }

  state = {
    value: this.props.value || _.cloneDeep(getInitialStrategy()),
    errorInfo: {}
  }

  store = new TriggerIndexStore()

  componentDidMount() {
    this.store.getActionTypes({ olaAction: 1 })
    this.store.getFieldParams()
  }

  handleChange = (fieldValue, field) => {
    const { value } = this.state
    const nextValue = { ...value }

    nextValue[field] = fieldValue
    this.setState({ value: nextValue })
  }

  handleValidateActions = params => {
    let tmp = _.isEmpty(params)
    _.map(params, param => {
      const { type, executeParamPos } = param
      if (type === 'closeTicket' || type === 'rollbackTicket') {
        return
      }
      if (_.isEmpty(executeParamPos)) {
        tmp = true
        return
      }
      if (type === 'setColor') {
        return
      }
      _.map(executeParamPos, executeParamPo => {
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
    return tmp
  }

  onSubmit = callback => {
    this.props.form.validateFields((error, values) => {
      if (error) return false

      const { value } = this.state

      // 校验actions
      if (this.handleValidateActions(value.params)) {
        message.error(i18n('add_noti_rules_tips', '请完善动作'))
        return false
      }

      const nextValue = {
        ...value,
        name: values.name,
        olaId: values.olaId
      }

      callback(nextValue)
    })
  }

  //

  render() {
    const {
      actionTypes,
      titleParams,
      fullParams,
      builtinParams,
      defineParams,
      ticketParams
    } = this.store
    const { olaMonitors, form, links } = this.props
    const { getFieldDecorator } = form
    const { value } = this.state
    const { name, delay, delayTime, delayUnit, params, olaId } = value

    const fieldsData = {
      titleParams,
      fullParams,
      builtinParams,
      defineParams,
      ticketParams
    }

    return (
      <Form className="notification-wrap" id="notification-wrap">
        <Input
          formItemLayout={formItemLayout}
          item={{
            required: 1,
            code: 'name',
            minLength: 4,
            maxLength: 20,
            name: i18n('trigger_name', '策略名称')
          }}
          defaultValue={name}
          getFieldDecorator={getFieldDecorator}
        />
        <FormItem {...formItemLayout} label="监控事件" required>
          {getFieldDecorator('olaId', {
            initialValue: olaId,
            rules: [
              {
                required: true,
                message: '请选择监控事件'
              }
            ]
          })(
            <RadioGroup>
              <Radio value={olaMonitors[0].id}>
                节点响应{olaMonitors[0].useTimingMonitor ? '' : '(未启用)'}
              </Radio>
              <Radio value={olaMonitors[1].id}>
                节点处理{olaMonitors[1].useTimingMonitor ? '' : '(未启用)'}
              </Radio>
              <Radio value={olaMonitors[2]?.id}>
                节点总时长监控{olaMonitors[2]?.useTimingMonitor ? '' : '(未启用)'}
              </Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="类型" required>
          <RadioGroup value={delay} onChange={e => this.handleChange(e.target.value, 'delay')}>
            <RadioButton value={2}>到期前</RadioButton>
            <RadioButton value={1}>逾期后</RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem {...formItemLayout} label="时间" required>
          <span>{delay === 1 ? '逾期后' : '到期前'}</span>
          <InputNumber
            style={{ marginLeft: 10 }}
            min={0}
            precision={0}
            value={delayTime}
            onChange={val => this.handleChange(val, 'delayTime')}
          />
          <Select
            style={{ width: 60, marginLeft: 10 }}
            value={delayUnit}
            onChange={val => this.handleChange(val, 'delayUnit')}
          >
            {units.map(unit => (
              <Option key={unit.value}>{unit.label}</Option>
            ))}
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="动作" required>
          <TriggerAction
            source="olaStrategy"
            links={links}
            store={this.store}
            fieldsData={fieldsData}
            actionTypes={toJS(actionTypes)}
            triggers={params}
            setTriggerData={(a, value) => this.handleChange(value, 'params')}
          />
        </FormItem>
      </Form>
    )
  }
}

export default StrategyForm
