import React, { Component } from 'react'
import { Pagination } from '@uyun/components'

class TablePagination extends Component {
  render () {
    const { current, total } = this.props
    return (
      <Pagination
        showQuickJumper
        current={current}
        pageSize={5}
        total={total}
        onChange={this.props.onChange} />
    )
  }
}

export default TablePagination
