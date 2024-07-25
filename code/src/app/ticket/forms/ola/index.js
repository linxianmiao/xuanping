import React, { Component } from 'react'
import { Collapse } from '@uyun/components'
import Ola from '~/details/ola'

class OlaCom extends Component {
  static defaultProps = {
    ticketId: '',
    activeKey: '',
    formList: {},

    getDetailForms: () => {},
    getCurrentTicketValue: () => {}
  }

  render() {
    const { fold, field, startNode, relateTicketError, isInLayout } = this.props
    const { name, height = 500, styleAttribute, isRequired } = field || {}
    let wrapStyle = {
      height: height + 'px',
      overflowY: 'auto'
    }

    if (Number(height) === 0) {
      wrapStyle = {
        height: 'auto',
        overflowY: 'auto'
      }
    }

    const olaProps = {
      ...this.props,
      id: this.props.ticketId,
      isRequired
    }
    if (isInLayout) {
      return (
        <div style={wrapStyle}>
          <Ola {...olaProps} />
          {relateTicketError ? <span className="relate-ticket-mes">请添加关联工单</span> : null}
        </div>
      )
    }
    return (
      <div className="forms-group-wrap">
        <Collapse defaultActiveKey={fold === 0 ? ['1'] : []}>
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
              <Ola {...olaProps} />
              {relateTicketError ? <span className="relate-ticket-mes">请添加关联工单</span> : null}
            </div>
          </Collapse.Card>
        </Collapse>
      </div>
    )
  }
}

export default OlaCom
