import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import { toJS } from 'mobx'

export default function withSubscription(WrappedComponent, stores) {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        leaveNotify: false,
        location: {},
        isDrafts: false, // 是否是草稿页面
        locationHref: ''
      }
      this.wrappForms = React.createRef()
    }

    componentDidMount() {
      this.setState({ isDrafts: window.location.href.includes('drafts') })
      const itsm_del_taskIds = window.localStorage.getItem('itsm_del_taskIds')
      const itsm_del_jobIds = window.localStorage.getItem('itsm_del_jobIds')
      const { resourceStore, ticketFieldJobStore, createStore } = stores
      let locationHref = window.location.href
      this.setState({ locationHref })
      if (itsm_del_taskIds) {
        const ticketId =
          locationHref.indexOf('createTicket') !== -1
            ? window.localStorage.getItem('ticketId')
            : this.props.match.params.id
        resourceStore.removeRelateResource(itsm_del_taskIds.split(','), ticketId)
        window.localStorage.removeItem('itsm_del_taskIds')
      }

      if (itsm_del_jobIds) {
        // 刷新删除不用传工单id
        ticketFieldJobStore.job_delete(itsm_del_jobIds, undefined, 0, undefined)
        window.localStorage.removeItem('itsm_del_jobIds')
      }
      window.onbeforeunload = () => {
        this._remove('onbeforeunload')
      }
    }

    _handleChangeLeaveNotify = (leaveNotify) => {
      this.setState({
        leaveNotify
      })
    }

    // 删除配置数据
    _removeSandbox = (type) => {
      const { resourceStore } = stores
      const prevIds = _.chain(toJS(resourceStore.initialResourceValue))
        .values()
        .compact()
        .flatten()
        .map((item) => item.taskId)
        .compact()
        .value()

      const current = this.wrappForms.current.getFormCodesValue(['resource'])
      const currentIds = _.chain(current)
        .values()
        .compact()
        .flatten()
        .map((item) => item.taskId)
        .compact()
        .value()
      const delIs = _.difference(currentIds, prevIds)
      if (type === 'onbeforeunload') {
        window.localStorage.setItem('itsm_del_taskIds', delIs.toString())
      } else {
        const ticketId =
          this.state.locationHref.indexOf('createTicket') !== -1
            ? window.localStorage.getItem('ticketId')
            : this.props.match.params.id
        if (delIs.length > 0) {
          resourceStore.removeRelateResource(delIs, ticketId)
        }
      }
      resourceStore.distory() // 卸载配置项数据
    }

    // 删除作业数据
    _removeJob = (type) => {
      const { ticketFieldJobStore, createStore } = stores
      const prevIds = ticketFieldJobStore.jobIds
      const current = this.wrappForms.current.getFormCodesValue(['job'])
      const currentIds = _.chain(current)
        .values()
        .compact()
        .flatten()
        .map((item) => item.id)
        .compact()
        .value()
      const delIs = _.difference(currentIds, prevIds).toString()
      if (type === 'onbeforeunload') {
        window.localStorage.setItem('itsm_del_jobIds', delIs)
      } else {
        // 创建工单时从localStorage里拿工单id，工单详情从url拿工单id
        const ticketId =
          this.state.locationHref.indexOf('createTicket') !== -1
            ? window.localStorage.getItem('ticketId')
            : this.props.match.params.id
        ticketFieldJobStore.job_delete(delIs, undefined, 0, ticketId)
      }
    }

    componentWillUnmount() {
      const { isDrafts, leaveNotify } = this.state
      if (!isDrafts && leaveNotify) {
        this._remove()
      }
    }

    _remove = (type) => {
      this._removeSandbox(type)
      this._removeJob(type)
    }

    render() {
      return (
        <React.Fragment>
          <WrappedComponent
            {...this.props}
            ref={this.wrappForms}
            _handleChangeLeaveNotify={this._handleChangeLeaveNotify}
          />
          <Prompt when={this.state.leaveNotify} message="确认离开？" />
        </React.Fragment>
      )
    }
  }
}
