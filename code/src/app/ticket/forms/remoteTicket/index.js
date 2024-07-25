import React from 'react'
import { Collapse, Title } from '@uyun/components'
import RemoteTicket from '~/ticket/remoteTicket'

function RemoteTicketCom(props) {
  const { field, isInLayout } = props
  const { name, height = 500, fold, isRequired } = field || {}
  if (isInLayout) {
    return (
      <div
        style={
          Number(height) === 0
            ? { overflow: 'visible' }
            : { maxHeight: height + 'px', overflow: 'scroll' }
        }
      >
        <RemoteTicket {...props} formMode="new" />
      </div>
    )
  }
  return (
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
        <div
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll' }
          }
        >
          <RemoteTicket {...props} formMode="new" />
        </div>
      </Collapse.Card>
    </Collapse>
  )
}

export default RemoteTicketCom
