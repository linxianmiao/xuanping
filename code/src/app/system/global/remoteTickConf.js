import React, { Component } from 'react'
import { Checkbox, Radio, Select, InputNumber, Title } from '@uyun/components'
import { observer } from 'mobx-react'
import * as mobx from 'mobx'
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

@observer
class RemoteTicketConf extends Component {
    onChange = e => {
      const value = e.target.checked ? 1 : 0
      this.props.store.changeRemoteTicketAuto(value)
    }

    render () {
      const { autoReceiveForRemoteTicket } = mobx.toJS(this.props.store)
      return (
        <div className="clearfix">
          <Title>{i18n('ticket.tabs.remoteTicket', '远程工单')}</Title>
          <div className="system-config-global-group">
            <label className="global-checkbox-label">
              <span className="left">
                <Checkbox checked={autoReceiveForRemoteTicket === 1} onChange={this.onChange} />
              </span>
              <span className="right">{i18n("ticket_remote_ticket_auto_process","是否自动远程工单受理")}</span>
            </label>
            
          </div>
        </div>
      )
    }
}

export default RemoteTicketConf
