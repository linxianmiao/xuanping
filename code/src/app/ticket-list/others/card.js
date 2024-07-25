import React, { Component } from 'react'
import { Tooltip, Menu, Dropdown } from '@uyun/components'
import { getStatusColor } from './component/common/util'
import { PriorityTd } from './component'
import SLA from './component/sla'
import './style/card.less'

class Card extends Component {
  render() {
    const { ticket } = this.props
    const { name, color } = getStatusColor(ticket.status)
    const menu = (
      <Menu
        onClick={(e) => {
          this.props.moreOpeartion(ticket, e)
        }}
      >
        <Menu.Item key="order" disabled={!!(ticket.isExecutor === 0 || ticket.status !== 1)}>
          {ticket.status === 1
            ? i18n('ticket.list.order', '接单')
            : i18n('ticket.list.receivedOrder', '已接单')}
        </Menu.Item>
        {(ticket.canRemind === 1 || ticket.canRemind === 0) && (
          <Menu.Item key="reminder" disabled={ticket.canRemind === 0}>
            {ticket.canRemind === 1
              ? i18n('ticket.list.reminder', '催办')
              : i18n('ticket.list.hasReminder', '已催办')}
          </Menu.Item>
        )}
      </Menu>
    )

    return (
      <div className="card-wrap">
        <div className="card-inner">
          <header className="inner-header">
            <h3 className="card-title">{`${ticket.ticketName}[${ticket.ticketNum}]`}</h3>
            <span className="card-span">{`${i18n('ticket.list.ticketProcessName', '工单模型')} : ${
              ticket.processName
            }`}</span>
            <span className="card-span">
              {`${i18n('ticket.list.priority', '优先级')} : `}
              <PriorityTd priority={ticket.priority} />
            </span>
            <span className="card-span">
              {`${i18n('ticket.list.creatorName', '创建人')} : ${ticket.creatorName}`}
            </span>
            <span className="card-span">{`${i18n('ticket.list.tacheName', '当前节点')} : `}</span>
            <span className="card-span">
              {`${i18n('ticket.list.excutors', '处理人')}`}
              <Tooltip
                title={<div style={{ wordBreak: 'break-all' }}>{ticket.excutors.join(',')}</div>}
              >
                <div className="ticket-list-td-excutors-inner">{ticket.excutors.join(',')}</div>
              </Tooltip>
              <SLA record={ticket} type="line" />
            </span>
          </header>
          <footer className="inner-footer">
            <span>
              {ticket.isAttention === 1 && (
                <i
                  className="icon-yiguanzhu iconfont"
                  onClick={() => {
                    this.props.moreOpeartion(ticket, { key: 'acction' })
                  }}
                />
              )}
              {ticket.isAttention === 0 && (
                <i
                  className="icon-wodeguanzhu iconfont"
                  onClick={() => {
                    this.props.moreOpeartion(ticket, { key: 'acction' })
                  }}
                />
              )}
              12
            </span>
            <span>
              <i className="icon-pinglun iconfont" />
              {8}
            </span>
          </footer>
          <div className="card-status" style={{ background: color }}>
            {name}
          </div>
          <Dropdown overlay={menu}>
            <i className="iconfont icon-gengduocaozuo card-more" />
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default Card
