import React, { Component } from './react'
import {
  Form,
  Radio,
  TimePicker,
  Select,
  InputNumber,
  DatePicker,
  Popover,
  message
} from './@uyun/components'
import moment from './moment'
import '../style/timeAction.less'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const weekend = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const mounth = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]
// : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const days = []
for (let i = 1; i <= 31; i++) {
  let day = i
  day += '号'
  days.push(day)
}

days.push('月末')

class TimeAction extends Component {
  constructor(props) {
    super(props)

    this.state = {
      actionType: '',
      visible: false,
      tip1: '请设置时间策略',
      tip2: ''
    }
  }

  onChange = e => {
    this.setState({
      actionType: e.target.value
    })
  }

  showPop = () => {
    this.setState({
      visible: true
    })
  }

  componentDidMount() {
    const values = this.props.triggerview.timeStrategyVo
    if (values) {
      const type = values.executeType
      const tips = this.manageData(type, values)
      this.setState({
        tip1: tips.tip1,
        tip2: tips.tip2
      })
    }
  }

  manageData = (type, values) => {
    let tip1 = ''
    let tip2 = ''
    const { getFieldValue } = this.props
    if (type === '1') {
      tip1 = moment(values.executeTime1 || values.executeTime).format('HH:mm')
      tip1 += ' 触发'
      tip2 = '每天 重复'
    } else if (type === '2') {
      tip1 = moment(values.executeTime2 || values.executeTime).format('HH:mm')
      tip1 += ' 触发'
      let executeDayOfWeek = values.executeDayOfWeek
      if (typeof executeDayOfWeek === 'string') {
        executeDayOfWeek = executeDayOfWeek.split(',')
      }
      _.map(executeDayOfWeek, item => {
        tip2 += weekend[+item - 1] + ' '
      })
      tip2 += '重复'
    } else if (type === '3') {
      tip1 = moment(values.executeTime3 || values.executeTime).format('HH:mm')
      tip1 += ' 触发'
      let executeMonth = values.executeMonth
      if (typeof executeMonth === 'string') {
        executeMonth = executeMonth.split(',')
      }
      let executeDayOfMonth = values.executeDayOfMonth
      if (typeof executeDayOfMonth === 'string') {
        executeDayOfMonth = executeDayOfMonth.split(',')
      }
      const myDate = new Date()
      const year = Number(myDate.getFullYear())
      let isLeapYear = false
      if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
        isLeapYear = true
      }
      _.map(executeMonth, item => {
        // tip2 += mounth[+item - 1] + " ";
        _.map(executeDayOfMonth, day => {
          if (+item === 2) {
            if (isLeapYear) {
              if (+day > 29 && +day !== 32) {
                return
              }
            } else {
              if (+day > 28 && +day !== 32) {
                return
              }
            }
          }
          if (+item === 4 || +item === 6 || +item === 9 || +item === 11) {
            if (+day === 31) {
              return
            }
          }
          if (+day <= 31) {
            tip2 += mounth[+item - 1]
            tip2 += day + '号 '
          } else {
            tip2 += mounth[+item - 1] + '月末 '
          }
        })
      })
      tip2 += '重复'
    } else if (type === '4') {
      tip1 = '从 '
      tip1 = moment(values.executeTime4 || values.executeTime).format('HH:mm')
      tip1 += ' 开始触发'
      let unit = getFieldValue('intervalUnit')
      unit = unit === '1' ? '分' : unit === '2' ? '小时' : unit === '3' ? '天' : '周'
      tip2 = '每隔 '
      tip2 += values.timeInterval + ' ' + unit
      tip2 += ' 触发'
    } else {
      tip1 = moment(values.executeTime5 || values.executeTime).format('YYYY/MM/DD HH:mm')
      tip1 += ' 触发'
      tip2 = ''
    }
    return {
      tip1,
      tip2
    }
  }

  validataMonth = (type, values) => {
    if (type === '3') {
      let d29 = false
      let d30 = false
      let d31 = false
      let flag = false
      _.map(values.executeDayOfMonth, day => {
        if (day === '29') {
          d29 = true
        } else if (day === '30') {
          d30 = true
        } else if (day === '31') {
          d31 = true
        }
      })
      _.map(values.executeMonth, month => {
        if (month === '2') {
          const myDate = new Date()
          const year = Number(myDate.getFullYear())
          if (d29) {
            flag = true
          }
          if ((year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) && d29) {
            flag = false
          }
          if (d30 || d31) {
            flag = true
          }
        } else if (month === '4' || month === '6' || month === '9' || month === '11') {
          if (d31) {
            flag = true
          }
        }
      })
      if (flag) {
        message.warning('提示: 存在超出月份的日期')
      }
    }
  }

  okClick = () => {
    const { getFieldValue, validateFields } = this.props
    const type = getFieldValue('executeType')
    const validatorArr = ['executeTime' + type]
    if (type === '2') {
      validatorArr.push('executeDayOfWeek')
    } else if (type === '3') {
      validatorArr.push('executeMonth')
      validatorArr.push('executeDayOfMonth')
    } else if (type === '4') {
      validatorArr.push('timeInterval')
      validatorArr.push('intervalUnit')
    }
    validateFields(validatorArr, (errors, values) => {
      if (errors) {
        return
      }
      const tips = this.manageData(type, values)
      // this.validataMonth(type,values)
      this.setState({
        visible: false,
        tip1: tips.tip1,
        tip2: tips.tip2
      })
    })
  }

  onVisibleChange = value => {
    if (!value) {
      this.setState({
        visible: false
      })
    }
  }

  render() {
    const { formItemLayout, getFieldDecorator, triggerview } = this.props
    const timeStrategyVo = triggerview.timeStrategyVo || {}
    const { visible, tip1, tip2 } = this.state
    let actionType = timeStrategyVo.executeType || '1'

    if (this.state.actionType) {
      actionType = this.state.actionType
    }
    return (
      <FormItem label="定时策略" {...formItemLayout} required>
        <div id="time-action-wrap" className="time-action-wrap">
          <Popover
            visible={visible}
            overlayClassName="pop-over"
            onVisibleChange={this.onVisibleChange}
            content={
              <div className="action-type-wrap tiem-action">
                <p>重复</p>
                {getFieldDecorator('executeType', {
                  initialValue: timeStrategyVo.executeType || '1',
                  onChange: e => {
                    this.onChange(e)
                  }
                })(
                  <RadioGroup size="large">
                    <RadioButton value="1">每天</RadioButton>
                    <RadioButton value="2">每周</RadioButton>
                    <RadioButton value="3">每月</RadioButton>
                    <RadioButton value="4">周期执行</RadioButton>
                    <RadioButton value="5">单次执行</RadioButton>
                  </RadioGroup>
                )}
                {(() => {
                  if (actionType === '1') {
                    return (
                      <div key="1">
                        <p className="mt10">时间</p>
                        <FormItem>
                          {getFieldDecorator('executeTime1', {
                            initialValue: timeStrategyVo.executeTime
                              ? new Date(timeStrategyVo.executeTime)
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请填写时间'
                              }
                            ]
                          })(
                            <TimePicker
                              format="HH:mm"
                              placeholder="请选择时间"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            />
                          )}
                        </FormItem>
                      </div>
                    )
                  } else if (actionType === '2') {
                    return (
                      <div key="2">
                        <p className="mt10">时间</p>
                        <FormItem>
                          {getFieldDecorator('executeDayOfWeek', {
                            initialValue: timeStrategyVo.executeDayOfWeek
                              ? timeStrategyVo.executeDayOfWeek.split(',')
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请选择'
                              }
                            ]
                          })(
                            <Select
                              multiple
                              placeholder="请选择"
                              optionFilterProp="children"
                              notFoundContent="没有找到"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            >
                              {_.map(weekend, (item, index) => {
                                return (
                                  <Option key={index} value={'' + (index + 1)}>
                                    {item}
                                  </Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <p className="mt10">触发时间</p>
                        <FormItem>
                          {getFieldDecorator('executeTime2', {
                            initialValue: timeStrategyVo.executeTime
                              ? new Date(timeStrategyVo.executeTime)
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请填写时间'
                              }
                            ]
                          })(
                            <TimePicker
                              format="HH:mm"
                              placeholder="请选择时间"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            />
                          )}
                        </FormItem>
                      </div>
                    )
                  } else if (actionType === '3') {
                    return (
                      <div key="3">
                        <p className="mt10">月份</p>
                        <FormItem>
                          {getFieldDecorator('executeMonth', {
                            initialValue: timeStrategyVo.executeMonth
                              ? timeStrategyVo.executeMonth.split(',')
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请选择'
                              }
                            ]
                          })(
                            <Select
                              multiple
                              placeholder="请选择"
                              optionFilterProp="children"
                              notFoundContent="没有找到"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            >
                              {_.map(mounth, (item, index) => {
                                return (
                                  <Option key={index} value={'' + (index + 1)}>
                                    {item}
                                  </Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <p className="mt10">日期</p>
                        <FormItem>
                          {getFieldDecorator('executeDayOfMonth', {
                            initialValue: timeStrategyVo.executeDayOfMonth
                              ? timeStrategyVo.executeDayOfMonth.split(',')
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请选择'
                              }
                            ]
                          })(
                            <Select
                              multiple
                              placeholder="请选择"
                              optionFilterProp="children"
                              notFoundContent="没有找到"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            >
                              {_.map(days, (item, index) => {
                                return (
                                  <Option key={index} value={'' + (index + 1)}>
                                    {item}
                                  </Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <p className="mt10">时间</p>
                        <FormItem>
                          {getFieldDecorator('executeTime3', {
                            initialValue: timeStrategyVo.executeTime
                              ? new Date(timeStrategyVo.executeTime)
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请选择'
                              }
                            ]
                          })(
                            <TimePicker
                              format="HH:mm"
                              placeholder="请选择时间"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            />
                          )}
                        </FormItem>
                      </div>
                    )
                  } else if (actionType === '4') {
                    return (
                      <div key="4">
                        <p className="mt10">周期</p>
                        <FormItem>
                          <div className="clearfix">
                            {getFieldDecorator('timeInterval', {
                              initialValue: timeStrategyVo.timeInterval
                                ? timeStrategyVo.timeInterval
                                : undefined,
                              rules: [
                                {
                                  required: true,
                                  message: '请输入'
                                }
                              ]
                            })(<InputNumber className="fl" min={0} max={60} />)}
                            {getFieldDecorator('intervalUnit', {
                              initialValue: timeStrategyVo.intervalUnit
                                ? timeStrategyVo.intervalUnit
                                : undefined,
                              rules: [{ required: true }]
                            })(
                              <Select
                                className="fl"
                                style={{ width: '200' }}
                                placeholder="Please select"
                                optionFilterProp="children"
                                notFoundContent="没有找到"
                                getPopupContainer={() => document.querySelector('.pop-over')}
                              >
                                <Option value={'1'}>分</Option>
                                <Option value={'2'}>小时</Option>
                                <Option value={'3'}>天</Option>
                                <Option value={'4'}>周</Option>
                              </Select>
                            )}
                          </div>
                        </FormItem>
                        <p className="mt10">时间</p>
                        <FormItem>
                          {getFieldDecorator('executeTime4', {
                            initialValue: timeStrategyVo.executeTime
                              ? new Date(timeStrategyVo.executeTime)
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请填写时间'
                              }
                            ]
                          })(
                            <TimePicker
                              format="HH:mm"
                              placeholder="请选择时间"
                              getPopupContainer={() => document.querySelector('.pop-over')}
                            />
                          )}
                        </FormItem>
                      </div>
                    )
                  } else {
                    return (
                      <div key="5">
                        <p className="mt10">时间</p>
                        <FormItem>
                          {getFieldDecorator('executeTime5', {
                            initialValue: timeStrategyVo.executeTime
                              ? new Date(timeStrategyVo.executeTime)
                              : undefined,
                            rules: [
                              {
                                required: true,
                                message: '请填写时间'
                              }
                            ]
                          })(
                            <DatePicker
                              showTime
                              format="yyyy-MM-dd HH:mm"
                              placeholder="请选择时间"
                              getCalendarContainer={() => document.querySelector('.pop-over')}
                            />
                          )}
                        </FormItem>
                      </div>
                    )
                  }
                })()}
                <div className="ok-btn" onClick={this.okClick}>
                  {i18n('globe.ok', '确定')}
                </div>
              </div>
            }
            trigger="click"
            placement="bottomLeft"
            getTooltipContainer={() => document.getElementById('time-action-wrap')}
          >
            <div onClick={this.showPop} className="action-type-btn" id="action-type-btn">
              <p className="time">{tip1}</p>
              {tip2 ? <p className="day">{tip2}</p> : null}
              <span className="tansAngle" />
            </div>
          </Popover>
        </div>
      </FormItem>
    )
  }
}

export default TimeAction
