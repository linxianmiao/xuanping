import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons';
import { Button, message } from '@uyun/components'
import ServieTimePicker from './servieTimePicker'
import WeekSelect from './weekSelect'
@inject('createDefinitionStore')
@observer
class ServiceWeek extends Component {
    handleChange = (work, index) => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        work,
        ...workDay.slice(index + 1)
      ], 'work_day')
    }

    handleDel = index => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        ...workDay.slice(index + 1)
      ], 'work_day')
    }

    addServiceWeek = () => {
      if (this.alreadyDayList.length === 7) {
        message.warning(i18n('create-definiton-server-time-week-tip2', '无可选时间'))
        return false
      }
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0),
        { weekDay: '', startAM: undefined, endAM: undefined, startPM: undefined, endPM: undefined }
      ], 'work_day')
    }

    render () {
      const { workDay } = this.props
      const alreadyDays = workDay.reduce((accumulator, currentValue) => {
        if (currentValue.weekDay) {
          return accumulator ? currentValue.weekDay + ',' + accumulator : currentValue.weekDay
        } else {
          return accumulator
        }
      }, '')
      this.alreadyDayList = alreadyDays ? [...new Set(alreadyDays.split(','))] : []
      return (
        <React.Fragment>
          <ul>
            {_.map(workDay, (work, index) => {
              const { weekDay, startAM, endAM, startPM, endPM } = work
              const dilver = {
                work,
                index,
                handleChange: this.handleChange
              }
              return (
                <li className="flex-space-between" style={{ marginBottom: 15 }} key={index}>
                  <WeekSelect alreadyDayList={this.alreadyDayList} weeks={weekDay ? weekDay.split(',') : undefined} {...dilver} />
                  <ServieTimePicker timeType="AM" startTime={startAM} endTime={endAM} {...dilver} />
                  <ServieTimePicker timeType="PM" startTime={startPM} endTime={endPM} {...dilver} />
                  <i style={{ cursor: 'pointer' }} onClick={() => { this.handleDel(index) }} className="iconfont icon-shanchu" />
                </li>
              )
            })}
          </ul>
          <Button style={{ width: 156 }} icon={<PlusOutlined />} type="dashed" onClick={() => {
            this.addServiceWeek()
          }}>添加</Button>
        </React.Fragment>
      );
    }
}
export default ServiceWeek
