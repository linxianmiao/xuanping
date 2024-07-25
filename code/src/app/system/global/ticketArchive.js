import React, { Component } from 'react'
import { Checkbox, Radio, Select, InputNumber, Title } from '@uyun/components'
import { observer } from 'mobx-react'
import * as mobx from 'mobx'
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

@observer
class TicketArchive extends Component {
    onArchiveChange = e => {
      const value = e.target.checked ? 1 : 0
      this.props.store.onArchiveState(value)
    }

    handleRadioChange = e => {
      const value = e.target.value
      this.props.store.onArchiveType(value)
    }

    onArchiveTime = value => {
      this.props.store.onArchiveTime(value)
    }

    onStatusChange = values => {
      this.props.store.onEndStatus(values)
    }

    render () {
      const { archivedTicket, archivedType, endStatus, delayTime } = mobx.toJS(this.props.store)
      return (
        <div className="clearfix">
          <Title>{i18n('ticket_archive', '工单归档')}</Title>
          <div className="system-config-global-group">
            <label className="global-checkbox-label">
              <span className="left">
                <Checkbox checked={archivedTicket === 1} onChange={this.onArchiveChange} />
              </span>
              <span className="right">{i18n('ticket_archive_tips', '当工单处理结束后，系统将自动对其进行归档操作')}</span>
            </label>
            <div className="ticket-archive-condition clearfix">
              <span>{i18n('end_status', '结束状态')}：</span>
              <Select
                mode="multiple"
                style={{ width: 400 }}
                placeholder={i18n('pls_select_end_status', '请选择结束状态')}
                value={endStatus}
                onChange={this.onStatusChange}
                disabled={archivedTicket === 0}
              >
                <Option key={'3'}>{i18n('status_3')}</Option>
                <Option key={'7'}>{i18n('status_7')}</Option>
                <Option key={'11'}>{i18n('status_11')}</Option>
              </Select>
            </div>
            <div className="ticket-archive-condition clearfix">
              <div className="left">
                <span>{i18n('archive_time', '归档时间')}：</span>
                <RadioGroup value={archivedType} onChange={this.handleRadioChange} disabled={archivedTicket === 0}>
                  <RadioButton value={0}>{i18n('atonce_archive', '立刻归档')}</RadioButton>
                  <RadioButton value={1}>{i18n('delay_archive', '延迟归档')}</RadioButton>
                </RadioGroup>
              </div>
              { archivedType === 1 && <div className="left">
                <InputNumber value={delayTime} precision={0} min={1} disabled={archivedTicket === 0} onChange={this.onArchiveTime} />
                <span>{i18n('archive_time_tips', '天后自动归档')}</span>
              </div> }
            </div>
          </div>
        </div>
      )
    }
}

export default TicketArchive
