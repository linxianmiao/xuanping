import React, { Component } from 'react'
import { Tabs as UTabs } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import originalQuery from '../config/originalQuery'
import defaultAttributeList from '../config/defaultAttributeList'
import '../styles/tabs.less'

const { TabPane } = UTabs

@inject('listStore')
@observer
class Tabs extends Component {
    handleChange = data => {
      this.props.listStore.setFilterType(data)

      if (window.TICKET_QUERY[data]) {
        const { current, pageSize, query, attributeList } = window.TICKET_QUERY[data]
        this.props.listStore.setQuery(query)
        this.props.listStore.setCurrentAndPageSize(current, pageSize)
        this.props.listStore.setAttributeList(attributeList)
      } else {
        this.props.listStore.setQuery(originalQuery)
        this.props.listStore.setCurrentAndPageSize(1, 20)
        this.props.listStore.setAttributeList(defaultAttributeList)
      }

      this.props.listStore.getList()
    }

    render() {
      const { filterType } = this.props.listStore

      return (
        <div className="ticket-list-tabs-wrap">
          <UTabs activeKey={filterType} onChange={this.handleChange}>
            <TabPane key="all" tab={i18n('ticket.list.no.archive', '未归档')} />
            <TabPane key="archived" tab={i18n('ticket.list.archive', '已归档')} />
          </UTabs>
        </div>
      )
    }
}

export default Tabs
