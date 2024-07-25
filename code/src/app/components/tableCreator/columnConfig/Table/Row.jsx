import React, { useRef } from 'react'
import { CloseCircleFilled } from '@uyun/icons'
import { Icon } from '@uyun/components'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import classnames from 'classnames'

const Row = (props) => {
  const { record, data, index, columns, dragIndex, onDelete, onDragBegin, onDragEnd, onDrop } =
    props
  const ref = useRef()

  const [{ isDragging }, connectDrag, connectDragPreview] = useDrag({
    item: { type: 'row', columns, record, index },
    begin: () => onDragBegin(index),
    end: () => onDragEnd(index),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  const [{ isOver }, connectDrop] = useDrop({
    accept: 'row',
    drop: () => onDrop(index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  })

  connectDragPreview(getEmptyImage())
  connectDrag(ref)
  connectDrop(ref)

  const tdClassName = classnames({
    'can-drop-top': isOver && dragIndex > index,
    'can-drop-bottom': isOver && dragIndex < index
  })

  const trClassName = classnames({
    dragging: isDragging
  })

  return (
    <tr ref={ref} className={trClassName}>
      {columns.map((col) => {
        const key = col.dataIndex || col.key
        const content = col.render ? col.render(record[key], record, index) : record[key]
        return (
          <td key={key} className={tdClassName}>
            {content}
          </td>
        )
      })}

      <td className="extra-cell">
        {data.length > 1 && (
          <CloseCircleFilled
            title={i18n('delete.row', '删除')}
            onClick={() => onDelete(record, index)}
          />
        )}
      </td>
    </tr>
  )
}

export default Row
