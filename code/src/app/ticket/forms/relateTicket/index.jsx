import React, { Component } from 'react'
import { Collapse } from '@uyun/components'
import RelateTicketComponent from '~/ticket/relateTicket'

class RelateTicket extends Component {
  static defaultProps = {
    ticketId: '',
    activeKey: '',
    formList: {},

    getDetailForms: () => {},
    getCurrentTicketValue: () => {}
  }

  render() {
    const { open, field, toggleOpen, relateTicketError, isInLayout } = this.props
    const { name, height = 500, styleAttribute, isRequired } = field || {}
    let wrapStyle = {
      maxHeight: height + 'px',
      overflowY: 'auto'
    }

    if (Number(height) === 0) {
      wrapStyle = {
        height: 'auto',
        overflowY: 'auto'
      }
    }

    const relateTicketComponentProps = {
      ...this.props,
      id: this.props.ticketId,
      source: 'form',
      isRequired
    }
    if (isInLayout) {
      return (
        <div style={wrapStyle} id="relateTicketField">
          <RelateTicketComponent {...relateTicketComponentProps} />
          {relateTicketError ? <span className="relate-ticket-mes">请添加关联工单</span> : null}
        </div>
      )
    }
    return (
      <div className="forms-group-wrap" id="relateTicketField">
        <Collapse onChange={toggleOpen} defaultActiveKey={open ? ['1'] : []}>
          <Collapse.Card
            key="1"
            header={
              <span>
                {isRequired === 1 ? <span className="required-item-icon">*</span> : null}
                {name}
              </span>
            }
            forceRender
          >
            <div style={wrapStyle}>
              <RelateTicketComponent {...relateTicketComponentProps} />
              {relateTicketError ? <span className="relate-ticket-mes">请添加关联工单</span> : null}
            </div>
          </Collapse.Card>
        </Collapse>
      </div>
    )
  }
}

export default RelateTicket
