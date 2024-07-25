import React, { Component } from 'react'
import TableList from './tableList'
import CardList from './cardList'
import { message } from '@uyun/components'
import { observer, inject } from 'mobx-react'

@inject('ticketStore')
@observer
class TableOrCard extends Component {
    state = {
      visible: false
    }

    componentDidMount () {
    // this.props.ticketStore.getTicketDetail({
    //   ticketId: 'd01c6840627b44a48605619e5f1d5edc',
    //   tacheNo: 0,
    //   tacheType: 0
    // })
    }

    // 显示侧滑框
    showSide = async ticket => {
      this.setState({ visible: false })
      const data = await this.props.ticketStore.getTicketDetail(ticket)
      if (data === 'success') {
        this.setState({ visible: true })
      }
    }

    // 影藏侧滑框
    hideSide = () => {
      this.setState({ visible: false })
    }

    /** 更多操作  acction == 关注 ； order == 接单 ； reminder == 催办 */
    moreOpeartion = (record, e) => {
      const filterUrl = this.context.filterUrl // 当前的路由
      const ticket = {
        ticketId: record.ticketId,
        tacheNo: record.tacheNo,
        tacheType: record.tacheType
      }

      const callback = mes => {
        mes && message.success(mes)
      }
      switch (e.key) {
        case 'acction':this.props.ticketListStore.ticketAttention(ticket, record.isAttention, record.processId, filterUrl, callback); break
        case 'order': this.props.ticketListStore.ticketReceive(ticket, record.status, callback); break
        case 'reminder' : this.props.ticketListStore.ticketReminder(ticket, record.canRemind, callback); break
      }
    }

    render () {
      const dilver = {
        moreOpeartion: this.moreOpeartion,
        showSide: this.showSide
      }
      return (
        <div>
          {this.props.ticketListStore.currentPattern === 'table' && <TableList {...dilver} {...this.props} />}
          {this.props.ticketListStore.currentPattern === 'card' && <CardList {...dilver} {...this.props} />}
        </div>
      )
    }
}

export default TableOrCard
