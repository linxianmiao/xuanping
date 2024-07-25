import React from 'react'
import { useDragLayer } from 'react-dnd'

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }
  let { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform
  };
}

const CustomDragLayer = () => {
  const {
    item,
    itemType,
    isDragging,
    initialOffset,
    currentOffset
  } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset()
  }))

  if (!isDragging || itemType !== 'row') {
    return null
  }

  const { columns, record, index } = item

  return (
    <div className="tc-drag-layer-wrapper">
      <div
        className="tc-table tc-drag-layer-content u4-table"
        style={getItemStyles(initialOffset, currentOffset)}
      >
        <table>
          <tbody className="u4-table-tbody">
            <tr>
              {
                columns.map(col => {
                  const key = col.dataIndex || col.key
                  const content = col.render ? col.render(record[key], record, index) : record[key]
                  return (
                    <td key={key}>
                      {content}
                    </td>
                  )
                })
              }
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomDragLayer
