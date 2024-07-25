import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Pagination } from '@uyun/components'

@inject('listStore')
@observer
class TicketPagination extends Component {
  static defaultProps = {
    pageSizeOptions: ['10', '20', '50', '100']
  }

  getList = () =>
    typeof this.props.getList === 'function' ? this.props.getList() : this.props.listStore.getList()

  render() {
    const { pageSizeOptions } = this.props
    const { current, pageSize, count } = this.props.listStore
    return (
      <div style={{ padding: '16px 0' }}>
        <Pagination
          showTotal
          showQuickJumper
          total={count}
          current={current}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onShowSizeChange={async (current, pageSize) => {
            const res = await this.props.listStore.setCurrentAndPageSize(1, pageSize)
            if (res) {
              this.getList()
            }
          }}
          onChange={async (current, pageSize) => {
            const res = await this.props.listStore.setCurrentAndPageSize(current, pageSize)
            if (res) {
              this.getList()
            }
          }}
        />
      </div>
    )
  }
}
export default TicketPagination
