import React from 'react'
import { Collapse } from '@uyun/components'
import Log from '~/ticket/log/index.js'

function ProcessRecord(props) {
  const { field, isInLayout } = props
  const { name, height = 500, fold } = field || {}

  if (isInLayout) {
    return (
      <div
        id="processRecordWrap"
        style={
          Number(height) === 0
            ? { overflow: 'visible' }
            : { maxHeight: height + 'px', overflow: 'scroll' }
        }
      >
        <Log {...props} formMode="new" />
      </div>
    )
  }
  return (
    <Collapse defaultActiveKey={fold === 0 ? ['1'] : []}>
      <Collapse.Card key="1" header={<span>{name}</span>} forceRender>
        <div
          id="processRecordWrap"
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll' }
          }
        >
          <Log {...props} formMode="new" />
        </div>
      </Collapse.Card>
    </Collapse>
  )
}

export default ProcessRecord
