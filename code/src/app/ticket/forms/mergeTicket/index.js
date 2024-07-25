import React from 'react'
import { Collapse, Title } from '@uyun/components'
import styles from '../index.module.less'
import classnames from 'classnames'
import MergeTicket from '~/ticket/mergeTicket'

function MergeTicketCom(props) {
  const { field, isInLayout } = props
  const { name, height = 500, styleAttribute, fold } = field || {}
  if (isInLayout) {
    return (
      <div
        style={
          Number(height) === 0
            ? { overflow: 'visible' }
            : { maxHeight: height + 'px', overflow: 'scroll' }
        }
      >
        <MergeTicket {...props} formMode="new" />
      </div>
    )
  }
  return (
    <Collapse defaultActiveKey={fold === 0 ? ['1'] : []} className="no-border-collapse">
      <Collapse.Card key="1" header={<span>{name}</span>} forceRender>
        <div
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll' }
          }
        >
          <MergeTicket {...props} formMode="new" />
        </div>
      </Collapse.Card>
    </Collapse>
  )
}

export default MergeTicketCom
