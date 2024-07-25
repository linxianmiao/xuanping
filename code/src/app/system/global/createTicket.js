import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Checkbox, Title, Modal } from '@uyun/components'
import { observer } from 'mobx-react'
import * as mobx from 'mobx'

@observer
class GlobalSwitch extends Component {
    onChange = (type, e) => {
      const createTicket = _.cloneDeep(mobx.toJS(this.props.store.createTicket))
      createTicket.value.openType[type] = e.target.checked ? '1' : '0'
      if (createTicket.value.openType.indexOf('1') > -1) {
        this.props.store.onChangeCreate(createTicket)
      } else {
        Modal.info({
          title: i18n('layout.createTicket.tips', '至少选择一个创建工单入口')
        })
      }
    }

    render () {
      const { createTicket } = mobx.toJS(this.props.store)
      const { authorizedApps } = runtimeStore.getState()
      const hasCatalog = _.some(authorizedApps, item => item.code === 'catalog')
      return (
        <div>
          { createTicket && hasCatalog ? <div>
            <Title>{i18n('incident.create', '工单创建')}</Title>
            <div className="system-config-global-group">
              <Checkbox checked={createTicket.value.openType[0] === '1'} onChange={e => { this.onChange(0, e) }} >{i18n('layout.tickets', '工单')}</Checkbox>
              <Checkbox checked={createTicket.value.openType[1] === '1'} onChange={e => { this.onChange(1, e) }} >{i18n('service.catlog', '服务目录')}</Checkbox>
            </div>
          </div> : null}
        </div>
      )
    }
}

export default GlobalSwitch
