import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CloseCircleOutlined, CopyFilled } from '@uyun/icons'
import { Icon } from '@uyun/components'
import './index.less'

class Table extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    rowKey: PropTypes.string.isRequired
  }

  static defaultProps = {
    className: '',
    columns: [],
    data: [],
    rowKey: 'id',
    canCopy: false,
    onDelete: () => {},
    onCopy: () => {}
  }

  renderHeader() {
    const { columns } = this.props

    return (
      <thead className="u4-table-thead">
        <tr>
          {columns.map((col) => {
            return (
              <th key={col.dataIndex || col.key} width={col.width}>
                {col.title}
              </th>
            )
          })}
          <th className="extra-cell" />
        </tr>
      </thead>
    )
  }

  renderBody() {
    const { columns, data, rowKey, canCopy, onDelete, onCopy } = this.props

    return (
      <tbody className="u4-table-tbody">
        {data.map((item, index) => {
          return (
            <tr key={item[rowKey]}>
              {columns.map((col) => {
                const key = col.dataIndex || col.key
                const content = col.render ? col.render(item[key], item, index) : item[key]
                return <td key={key}>{content}</td>
              })}
              <td className="extra-cell">
                {!!canCopy && (
                  <CopyFilled title={i18n('copy.row', '复制')} onClick={() => onCopy(item)} />
                )}
                {data.length > 1 && (
                  <CloseCircleOutlined
                    title={i18n('delete.row', '删除')}
                    onClick={() => onDelete(item, index)}
                  />
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    )
  }

  render() {
    const { className } = this.props
    return (
      <div className={`tc-table u4-table ${className}`}>
        <table>
          {this.renderHeader()}
          {this.renderBody()}
        </table>
      </div>
    )
  }
}

export default Table
