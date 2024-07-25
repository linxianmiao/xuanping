import React, { Component } from 'react'
import { Button, message } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import * as mobx from 'mobx'
import GlobalSwitch from './globalSwitch'
import CreateTicket from './createTicket'
import TicketArchive from './ticketArchive'
import ProcessOpinions from './processOpinions'
import RemoteTicketConf from './remoteTickConf'
import ConfigStore from './store/configStore'

import './style/index.less'
const configStore = new ConfigStore()

@inject('globalStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.opinions = React.createRef()
    this.state = {
      loading: false
    }
  }

  componentDidMount() {
    const data = { type: 'switch' }
    configStore.getConfig(data)
  }

  handleSubmit = async () => {
    if (_.get(this.opinions, 'current.state.visbile')) {
      const res = await this.opinions.current.handleOk()
      if (res === false) {
        return false
      }
    }

    const { states, archivedTicket, archivedType, delayTime, endStatus, opinions, createTicket, autoReceiveForRemoteTicket } = mobx.toJS(configStore)
    const data = []
    const archived = {
      code: 'archivedTicket',
      state: archivedTicket,
      value: archivedTicket === 1 ? {
        endStatus,
        archivedType,
        delayTime
      } : null
    }
    _.map(states, item => {
      data.push({
        code: item.value,
        state: item.state
      })
    })
    data.push(archived)
    data.push(opinions)
    data.push(createTicket)
    data.push({
      code:'autoReceiveForRemoteTicket',
      state:autoReceiveForRemoteTicket
    })
    if (archivedTicket === 1 && !endStatus.length) {
      message.error(i18n('pls_select_end_status', '请选择结束状态'))
    } else if (archivedTicket === 1 && !delayTime) {
      message.error(i18n('pls_select_delay_time', '请填写延迟归档时间'))
    } else {
      this.setState({ loading: true })
      configStore.onUpdate({ list: data }, res => {
        this.setState({ loading: false })
        if (_.isEmpty(res)) {
          return false
        }
        const opinions = _.find(res.list, item => item.code === 'opinions')
        window.PROCESSOPTION = opinions.value.list
        message.success(i18n('save_success', '保存成功'))
      })
    }
  }

  componentWillUnmount() {
    configStore.distory()
  }

  render() {
    const { globalConfigModify } = this.props.globalStore.configAuthor
    const { customHandlingComments } = this.props.globalStore.ticketListOperation
    const { loading } = this.state
    return (
      <div className="system-config-global">
        <GlobalSwitch store={configStore} />
        <CreateTicket store={configStore} />
        <TicketArchive store={configStore} />
        {
          customHandlingComments && <ProcessOpinions ref={this.opinions} store={configStore} />
        }
        <RemoteTicketConf store={configStore}/>
        {
          globalConfigModify &&
          <div className="system-config-global-submit">
            <Button loading={loading} onClick={this.handleSubmit} type="primary">
              {i18n('save', '保存')}
            </Button>
          </div>
        }
      </div>
    )
  }
}

export default Index
