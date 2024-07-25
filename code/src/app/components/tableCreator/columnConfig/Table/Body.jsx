import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Row from './Row'
import CustomDragLayer from './CustomDragLayer'

const Body = props => {
  const { data, rowKey, onRowDrag, ...restProps } = props

  const [dragIndex, setDragIndex] = useState(-1)

  const handleDrop = dropIndex => {
    if (dragIndex > -1 && dropIndex !== dragIndex) {
      onRowDrag(dropIndex, dragIndex)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      <tbody className="u4-table-tbody">
        {
          data.map((record, index) => (
            <Row
              {...restProps}
              key={record[rowKey]}
              data={data}
              record={record}
              index={index}
              dragIndex={dragIndex}
              onDragBegin={setDragIndex}
              onDragEnd={() => setDragIndex(-1)}
              onDrop={handleDrop}
            />
          ))
        }
      </tbody>
    </DndProvider>
  )
}

export default Body
