import React, { Component } from 'react'
import { weekList } from '../config'
import { Radio, Select, Popover, Divider, Checkbox, Row, Col, message } from '@uyun/components'
const Option = Select.Option
const CheckboxGroup = Checkbox.Group

class ServiceWeek extends Component {
    state = {
      radioValue: undefined
    }

    handleChangeRadio = radioValue => {
      const { work, index, alreadyDayList, weeks: disWeeks } = this.props
      const disabledList = _.filter(alreadyDayList, item => !_.includes(disWeeks, item)) // 禁用的选项是之前已经选过的，当前选的的不禁用

      let weekDay = work.weekDay
      if (radioValue === 'wordDay') {
        weekDay = '1,2,3,4,5'
      } else if (radioValue === 'weekend') {
        weekDay = '6,0'
      } else if (radioValue === 'all') {
        weekDay = '1,2,3,4,5,6,0'
      }
      const weeks = weekDay.split(',')
      if (!_.isEmpty(disabledList) && _.intersection(disabledList, weeks).length !== 0) {
        message.warning(i18n('create-definiton-server-time-week-tip', '服务时段重复'))
        return false
      }
      this.setState({ radioValue })
      this.props.handleChange && this.props.handleChange(_.assign({}, work, {
        weekDay: weekDay
      }), index)
    }

    handleChangeWeeks = weeks => {
      const { work, index } = this.props
      this.props.handleChange && this.props.handleChange(_.assign({}, work, {
        weekDay: weeks.toString()
      }), index)
    }

    renderContent = () => {
      const { weeks, alreadyDayList } = this.props
      const { radioValue } = this.state
      const disabledList = _.filter(alreadyDayList, item => !_.includes(weeks, item)) // 禁用的选项是之前已经选过的，当前选的的不禁用
      return (
        <div>
          <Radio.Group onChange={e => { this.handleChangeRadio(e.target.value) }} value={radioValue} buttonStyle="solid">
            <Radio.Button value="wordDay">{i18n('create-definiton-server-time-week-wordDay', '工作日')}</Radio.Button>
            <Radio.Button value="weekend">{i18n('create-definiton-server-time-week-weekend', '周末')}</Radio.Button>
            <Radio.Button value="all">{i18n('create-definiton-server-time-week-all', '全部')}</Radio.Button>
            <Radio.Button value="customize">{i18n('create-definiton-server-time-week-customize', '自定义')}</Radio.Button>
          </Radio.Group>
          {radioValue === 'customize' &&
          <div>
            <Divider />
            <CheckboxGroup value={weeks} onChange={value => { this.handleChangeWeeks(value) }}>
              <Row>
                {_.map(weekList, item => {
                  return (
                    <Col key={item.value} span={8}>
                      <Checkbox
                        disabled={_.includes(disabledList, item.value)}
                        value={item.value}>{item.label}</Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </CheckboxGroup>
          </div>}
        </div>
      )
    }

    render () {
      const { weeks } = this.props
      return (
        <Popover trigger="click" placement="bottom" content={this.renderContent()}>
          <div>
            <Select
              mode="multiple"
              value={weeks}
              onChange={this.handleChangeWeeks}
              style={{ width: 256 }}
              open={false}
              showArrow={false}>
              {_.map(weekList, item => {
                return <Option value={item.value} key={item.value}>{item.label}</Option>
              })}
            </Select>
          </div>
        </Popover>
      )
    }
}
export default ServiceWeek
