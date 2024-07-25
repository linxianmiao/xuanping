/* eslint-disable react/jsx-boolean-value */
import React, { useEffect, Component } from 'react'
import { Checkbox, InputNumber, Select, Form, Radio } from '@uyun/components'
import ServiceTime from '~/create-definition/serviceTime'
import DateVariableSelect from './DateVariableSelect'
import uuid from '~/utils/uuid'
import ConditionList from './ConditionList'
import { units } from './ConditionModal'
import { Provider } from 'mobx-react'
import createDefinitionStore from '~/create-definition/stores/createDefinitionStore'
import styles from './index.module.less'

const Option = Select.Option
const FormItem = Form.Item

const tip1Map = {
  0: '启用节点响应时长监控',
  1: '启用节点处理时长监控',
  2: '启用节点总时长监控'
}
const tip2Map = {
  0: '响应时长',
  1: '处理时长',
  2: '总时长'
}

// 初始值
function createInitialValue() {
  return Array(3)
    .fill(null)
    .map((item, index) => ({
      id: uuid(),
      olaType: index, // 0:响应 1:处理 2: 总时长
      conditionFilterFlag: false, // 是否按条件过滤
      olaConditionVos: [],
      useTimingMonitor: false, // 是否开启时长监控
      useProcessorsTime: false,
      timeDifference: 1, // 时长
      timeDifferenceUnit: 'MINUTES', // 时长单位
      useDateVariable: false, // 是否使用时间变量
      dateVariable: null // 时间变量
      // {
      //   code: '',
      //   id: '',
      //   name: '',
      //   type: 0
      // }
    }))
}

const validateDateVariable = (monitor, value) =>
  monitor.useTimingMonitor && monitor.useDateVariable && !value

const TimingMonitor = ({ isSubmit = false, modelId, value = [], onChange = () => {} }) => {
  useEffect(() => {
    // 初始化响应和处理的时长监控
    if (!value || value.length === 0) {
      onChange(createInitialValue())
    }
  }, [value])

  const handleChange = (fieldValue, field, index) => {
    let nextValue = [...value]
    if (nextValue) {
      nextValue = _.map(nextValue, (item) => {
        if (item.timeDifference === 0) {
          item.timeDifference = 1
        }
        return item
      })
    }
    nextValue[index] = {
      ...nextValue[index],
      [field]: fieldValue
    }
    onChange(nextValue)
  }

  const renderItem = (monitor, index) => {
    const {
      serviceTimeId,
      conditionFilterFlag,
      useTimingMonitor,
      useProcessorsTime,
      timeDifference,
      timeDifferenceUnit,
      useDateVariable,
      dateVariable
    } = monitor
    const olaConditionVos = monitor.olaConditionVos ?? []
    const disabled = !useTimingMonitor

    const dateVariableError = validateDateVariable(monitor, dateVariable) && isSubmit

    return (
      <div key={index} className={styles.item}>
        <Checkbox
          checked={useTimingMonitor}
          onChange={(e) => handleChange(e.target.checked, 'useTimingMonitor', index)}
        >
          {tip1Map[index]}
        </Checkbox>
        <div className={styles.panel}>
          {index === 2 && (
            <Checkbox
              disabled={disabled}
              checked={useProcessorsTime}
              onChange={(e) => handleChange(e.target.checked, 'useProcessorsTime', index)}
            >
              按处理人处理组计时
            </Checkbox>
          )}
          <Form.Item
            label={i18n('create-definition-time_policy', '服务时间')}
            style={{ marginBottom: 0 }}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
          >
            <ServiceTime
              allowClear
              disabled={disabled}
              value={serviceTimeId}
              onChange={(val) => handleChange(val, 'serviceTimeId', index)}
              placeholder={`${i18n('globe.select', '请选择')}${i18n(
                'create-definition-time_policy',
                '服务时间'
              )}`}
            />
          </Form.Item>
          <Form.Item
            style={{ marginBottom: 0 }}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
            label="是否按条件过滤"
          >
            <Radio.Group
              disabled={disabled}
              onChange={(e) => handleChange(e.target.value, 'conditionFilterFlag', index)}
              value={conditionFilterFlag}
            >
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>

          {conditionFilterFlag ? (
            <ConditionList
              modelId={modelId}
              value={olaConditionVos}
              onChange={(val) => handleChange(val, 'olaConditionVos', index)}
            />
          ) : (
            <Form.Item
              style={{ marginBottom: 0 }}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
              label={tip2Map[index]}
            >
              <InputNumber
                min={1}
                disabled={disabled}
                precision={0}
                value={timeDifference || 1}
                onChange={(val) => handleChange(val, 'timeDifference', index)}
              />
              <Select
                style={{ width: 60, marginLeft: 10, verticalAlign: 'top' }}
                disabled={disabled}
                value={timeDifferenceUnit || 'MINUTES'}
                onChange={(val) => handleChange(val, 'timeDifferenceUnit', index)}
              >
                {units.map((unit) => (
                  <Option key={unit.value}>{unit.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Checkbox
            style={{ marginTop: 10 }}
            disabled={disabled}
            checked={useDateVariable}
            onChange={(e) => handleChange(e.target.checked, 'useDateVariable', index)}
          >
            使用日期时间变量
          </Checkbox>
          {useDateVariable && (
            <FormItem
              validateStatus={dateVariableError ? 'error' : 'success'}
              help={dateVariableError ? '请选择日期时间变量' : ''}
            >
              <DateVariableSelect
                style={{ marginTop: 10 }}
                disabled={disabled}
                modelId={modelId}
                value={dateVariable}
                onChange={(value) => handleChange(value, 'dateVariable', index)}
              />
            </FormItem>
          )}
        </div>
      </div>
    )
  }

  if (!value || value.length === 0) {
    return null
  }

  return <div>{value.map(renderItem)}</div>
}

class TimingMonitorIndex extends Component {
  componentDidMount() {
    createDefinitionStore.queryTimePolicy()
  }

  render() {
    return (
      <Provider createDefinitionStore={createDefinitionStore}>
        <TimingMonitor {...this.props} />
      </Provider>
    )
  }
}

export default TimingMonitorIndex
