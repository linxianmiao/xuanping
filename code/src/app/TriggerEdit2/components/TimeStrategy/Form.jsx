import React, { useState } from 'react'
import { Radio, TimePicker, Select, InputNumber, DatePicker, Button, Form } from '@uyun/components'
import { executeTypes, weekDays, months, monthDays, intervalUnitList } from '../../constant'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const TimeStrategyForm = ({
  value,
  onSubmit
}) => {
  const [currentValue, setCurrentValue] = useState(value)
  const [errorInfo, setErrorInfo] = useState({})

  const {
    executeType,
    executeTime,
    executeDayOfWeek,
    executeMonth,
    executeDayOfMonth,
    timeInterval,
    intervalUnit
  } = currentValue

  const handleValidate = (value, field) => {
    const error = {}

    if (field) {
      const val = value[field]
      error[field] = typeof val === 'number' ? false : _.isEmpty(val)
      setErrorInfo({ ...errorInfo, ...error })
      return error[field]
    }

    const {
      executeType,
      executeTime,
      executeDayOfWeek,
      executeMonth,
      executeDayOfMonth,
      timeInterval
    } = value

    if (!executeTime) {
      error.executeTime = true
    }
    if (executeType === '2') {
      error.executeDayOfWeek = _.isEmpty(executeDayOfWeek)
    }
    if (executeType === '3') {
      error.executeMonth = _.isEmpty(executeMonth)
      error.executeDayOfMonth = _.isEmpty(executeDayOfMonth)
    }
    if (executeType === '4') {
      error.timeInterval = timeInterval === undefined
    }

    setErrorInfo({ ...errorInfo, ...error })

    return Object.keys(error).some(key => error[key])
  }

  const handleChange = (val, field) => {
    const nextValue = { ...currentValue }

    if (field === 'executeTime') {
      nextValue[field] = val.format('YYYY-MM-DD HH:mm:ss')
    } else {
      // 每月策略支持多选
      nextValue[field] = Array.isArray(val) ? val.join(',') : val
    }

    setCurrentValue(nextValue)

    if (field !== 'executeType') {
      handleValidate(nextValue, field)
    }
  }

  const handleSubmit = () => {
    if (handleValidate(currentValue)) {
      return
    }
    onSubmit(currentValue)
  }

  return (
    <div>
      <FormItem label="重复">
        <RadioGroup
          size="large"
          value={executeType}
          onChange={e => handleChange(e.target.value, 'executeType')}
        >
          {
            executeTypes.map(item => (
              <RadioButton key={item.value} value={item.value}>
                {item.label}
              </RadioButton>
            ))
          }
        </RadioGroup>
      </FormItem>

      {
        executeType === '2' && (
          <FormItem
            label="时间"
            validateStatus={errorInfo.executeDayOfWeek && 'error'}
            help={errorInfo.executeDayOfWeek && '请选择时间'}
          >
            <Select
              placeholder="请选择时间"
              mode="multiple"
              value={executeDayOfWeek ? executeDayOfWeek.split(',') : undefined}
              onChange={value => handleChange(value, 'executeDayOfWeek')}
            >
              {
                weekDays.map(item => <Option key={item.value}>{item.label}</Option>)
              }
            </Select>
          </FormItem>
        )
      }

      {
        executeType === '3' && (
          <>
            <FormItem
              label="月份"
              validateStatus={errorInfo.executeMonth && 'error'}
              help={errorInfo.executeMonth && '请选择月份'}
            >
              <Select
                placeholder="请选择月份"
                mode="multiple"
                value={executeMonth ? executeMonth.split(',') : []}
                onChange={value => handleChange(value, 'executeMonth')}
              >
                {
                  months.map(item => <Option key={item.value}>{item.label}</Option>)
                }
              </Select>
            </FormItem>
            <FormItem
              label="日期"
              validateStatus={errorInfo.executeDayOfMonth && 'error'}
              help={errorInfo.executeDayOfMonth && '请选择日期'}
            >
              <Select
                placeholder="请选择日期"
                mode="multiple"
                value={executeDayOfMonth ? executeDayOfMonth.split(',') : []}
                onChange={value => handleChange(value, 'executeDayOfMonth')}
              >
                {
                  monthDays.map(item => <Option key={item.value}>{item.label}</Option>)
                }
              </Select>
            </FormItem>
          </>
        )
      }

      {
        executeType === '4' && (
          <FormItem
            label="周期"
            validateStatus={errorInfo.timeInterval && 'error'}
            help={errorInfo.timeInterval && '请输入周期'}
          >
            <InputNumber
              max={60}
              min={0}
              value={timeInterval}
              onChange={value => handleChange(value, 'timeInterval')}
            />
            <Select
              placeholder="请选择单位"
              style={{ marginLeft: 10, width: 300 }}
              value={intervalUnit}
              onChange={value => handleChange(value, 'intervalUnit')}
            >
              {
                intervalUnitList.map(item => <Option key={item.value}>{item.label}</Option>)
              }
            </Select>
          </FormItem>
        )
      }

      {
        executeType === '5' && (
          <FormItem
            label="触发时间"
            validateStatus={errorInfo.executeTime && 'error'}
            help={errorInfo.executeTime && '请选择时间'}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              value={executeTime ? moment(executeTime) : undefined}
              onChange={value => handleChange(value, 'executeTime')}
            />
          </FormItem>
        )
      }

      {
        executeType !== '5' && (
          <FormItem
            label="触发时间"
            validateStatus={errorInfo.executeTime && 'error'}
            help={errorInfo.executeTime && '请选择时间'}
          >
            <TimePicker
              format="HH:mm"
              value={executeTime ? moment(executeTime) : undefined}
              onChange={value => handleChange(value, 'executeTime')}
            />
          </FormItem>
        )
      }

      <Button type="primary" onClick={handleSubmit}>确定</Button>
    </div>
  )
}

export default TimeStrategyForm
