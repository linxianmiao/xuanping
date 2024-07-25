import React, { Component } from 'react'
import { Table } from '@uyun/components'
import { Resizable } from 'react-resizable'

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props

  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...restProps} />
    </Resizable>
  )
}

class ResourceTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      columns: _.cloneDeep(props.columns)
    }
  }

  components = {
    header: {
      cell: ResizableTitle
    }
  }

  componentDidUpdate(prevProps) {
    const { columns } = this.props

    if (columns.length !== prevProps.columns.length) {
      this.setState({ columns: _.cloneDeep(columns) })
    }
  }

  handleResize =
    (index) =>
    (e, { size }) => {
      this.setState(({ columns }) => {
        const nextColumns = [...columns]
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width
        }
        return { columns: nextColumns }
      })
    }

  render() {
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: this.handleResize(index)
      })
    }))

    return (
      <Table
        {...this.props}
        className="ticket-resource-table"
        columns={columns}
        components={this.components}
      />
    )
  }
}

export default ResourceTable
