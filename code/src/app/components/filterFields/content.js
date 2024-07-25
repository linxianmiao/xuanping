import React, { useCallback } from 'react'
import { Checkbox, Tooltip } from '@uyun/components'

export default function Content(props) {
  const { contentObj, checkedList, handleChange } = props
  const getName = useCallback(
    (key) => {
      switch (key) {
        case 'attribute': return i18n('ticket.list.work.order.attribute', '工单属性')
        case 'builtinFields': return i18n('builtin_field', '内置字段')
        case 'extendedFields': return i18n('expansion_field', '扩展字段')
      }
    },
    []
  )
  return (
    <div className="ticket-expansion-filter-list-wrap">
      {_.map(contentObj, (item, key) => {
        if (_.isEmpty(item)) return undefined

        return (
          <div className="classification-filter-wrap" key={key}>
            <h3>{getName(key)}</h3>
            <div className="list-wrap">
              {_.map(item, (data, index) => {
                return (
                  <div key={data.code}>
                    <Tooltip
                      placement={index % 2 === 0 ? 'left' : 'right'}
                      title={
                        <span>{data.name} | {data.code}</span>
                      }
                    >
                      <Checkbox
                        disabled={data.disabled}
                        value={data.code}
                        checked={_.includes(checkedList, data.code)}
                        onChange={handleChange}
                      >
                        <span className="shenglue">{data.name}</span>
                      </Checkbox>
                    </Tooltip>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
