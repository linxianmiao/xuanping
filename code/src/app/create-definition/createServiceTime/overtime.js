import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons';
import { Button, message, DatePicker } from '@uyun/components'
import moment from 'moment'
import ServieTimePicker from './servieTimePicker'

@inject('createDefinitionStore')
@observer
class OverTime extends Component {
    // 修改
    handleChange = (work, index) => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        work,
        ...workDay.slice(index + 1)
      ], 'include_day')
    }

    // 修改日期前进行重复性校验
    handleChangeDatePicket = (dateString, work, index) => {
      const { workDay } = this.props
      const falt = _.some(workDay, item => item.date === dateString)
      if (falt) {
        message.warning(i18n('create-definiton-server-time-overTime-tip', '加班重复'))
        return false
      }
      this.handleChange(_.assign({}, work, { date: dateString }), index)
    }

    handleDel = index => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        ...workDay.slice(index + 1)
      ], 'include_day')
    }

    addServiceWeek = () => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0),
        { date: '', startAM: undefined, endAM: undefined, startPM: undefined, endPM: undefined }
      ], 'include_day')
    }

    render () {
      const { workDay } = this.props
      return (
        <React.Fragment>
          <ul>
            {_.map(workDay, (work, index) => {
              const { date, startAM, endAM, startPM, endPM } = work
              const dilver = {
                work,
                index,
                handleChange: this.handleChange
              }
              return (
                <li className="flex-space-between" style={{ marginBottom: 15 }} key={index}>
                  <DatePicker style={{ width: 256 }} onChange={(data, dateString) => {
                    this.handleChangeDatePicket(dateString, work, index)
                  }} value={date ? moment(date, 'YYYY-MM-DD') : undefined} />
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
export default OverTime
