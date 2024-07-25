import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { PlusOutlined } from '@uyun/icons';
import { Button, message, DatePicker } from '@uyun/components'
import moment from 'moment'

@inject('createDefinitionStore')
@observer
class Holiday extends Component {
    // 修改
    handleChange = (work, index) => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        work,
        ...workDay.slice(index + 1)
      ], 'holiday')
    }

    // 修改日期前进行重复性校验
    handleChangeDatePicket = (dateString, index) => {
      const { workDay } = this.props
      const falt = _.some(workDay, item => item === dateString)
      if (falt) {
        message.warning(i18n('create-definiton-server-time-holiday-tip', '节假日重复'))
        return false
      }
      this.handleChange(dateString, index)
    }

    handleDel = index => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0, index),
        ...workDay.slice(index + 1)
      ], 'holiday')
    }

    addServiceWeek = () => {
      const { workDay } = this.props
      this.props.handleChangeTimePolicy && this.props.handleChangeTimePolicy([
        ...workDay.slice(0),
        undefined
      ], 'holiday')
    }

    render () {
      const { workDay } = this.props
      return (
        <React.Fragment>
          <ul>
            {_.map(workDay, (work, index) => {
              return (
                <li className="flex-space-between" style={{ marginBottom: 15 }} key={index}>
                  <DatePicker style={{ width: 256 }} onChange={(data, dateString) => {
                    this.handleChangeDatePicket(dateString, index)
                  }} value={work ? moment(work, 'YYYY-MM-DD') : undefined} />
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
export default Holiday
