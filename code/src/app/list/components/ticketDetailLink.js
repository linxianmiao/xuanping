import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { getCode } from '~/components/common/getPerUrl'
import { qs } from '@uyun/utils'
import list from '~/components/pageHeader/list'

@inject('globalStore')
@observer
class TicketDetailLink extends Component {
  handleClick = (record, search, menu) => {
    const { ticketId, ticketName } = record
    if (this.props.source === 'npm') {
      this.props.handleTicketDetail(
        `/itsm/#/ticketDetail/${ticketId}?${qs.stringify(search)}`,
        ticketName
      )
      return false
    }
    this.props.history.push({
      pathname: `/ticket/detail/${ticketId}`,
      search: `?${qs.stringify(search)}`,
      state: {
        fromHase: this.props.location.pathname,
        fromName: menu.name || (window.language === 'zh_CN' ? menu.zhName : menu.enName)
      }
    })
  }

  render() {
    const { record = {}, globalStore, children } = this.props
    const {
      menuList: { ticketMenuList }
    } = globalStore
    const code = getCode(this.props.location.pathname)
    const menu =
      _.find(ticketMenuList, (item) => item.code === code) ||
      _.find(list(i18n), (item) => item.value === code) ||
      {}
    const {
      externalURL,
      ticketName,
      ticketId,
      draft,
      tacheNo,
      tacheType,
      processId,
      subModelId,
      tacheId,
      caseId
    } = record
    const search = {
      tacheNo: tacheNo || 0,
      tacheType: tacheType,
      tacheId: tacheId,
      modelId: subModelId || processId,
      caseId: caseId,
      isDrafts: draft
    }
    return externalURL ? (
      <a title={ticketName} target="_blank" href={externalURL}>
        {children}
      </a>
    ) : (
      <a
        title={ticketName}
        onClick={() => {
          this.handleClick(record, search, menu)
        }}
      >
        {children}
      </a>
      // <Link
      //   title={ticketName}
      //   to={{
      //     pathname: `/ticket/detail/${ticketId}`,
      //     search: `?${qs.stringify(search)}`,
      //     state: {
      //       fromHase: this.props.location.pathname,
      //       fromName: menu.name || window.language === 'zh_CN' ? menu.zhName : menu.enName
      //     }
      //   }}
      // >
      //   {children}
      // </Link>
    )
  }
}

export default withRouter(TicketDetailLink)
