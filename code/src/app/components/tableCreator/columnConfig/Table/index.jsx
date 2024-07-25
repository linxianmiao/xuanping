import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import Body from './Body'
import '../../index.less'

const Table = props => {
  const { className, columns, ...restProps } = props

  const THeader = useMemo(() => {
    return (
      <thead className="u4-table-thead">
        <tr>
          {
            columns.map(({ dataIndex, key, width, title }) => (
              <th key={dataIndex || key} width={width}>
                {title}
              </th>
            ))
          }
        </tr>
      </thead>
    )
  }, [columns])

  return (
    <div className={`tc-table u4-table u4-table-bordered ${className}`}>
      <div className="u4-table-body">
        <table>
          {THeader}
          <Body {...restProps} columns={columns} />
        </table>
      </div>
    </div>
  )
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  rowKey: PropTypes.string.isRequired
}

Table.defaultProps = {
  className: '',
  columns: [],
  data: [],
  rowKey: 'id',
  onDelete: () => {},
  onRowDrag: () => {}
}

export default Table
