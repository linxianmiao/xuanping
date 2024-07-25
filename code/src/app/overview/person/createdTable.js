import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { autorun, toJS } from 'mobx'
import TableDetail from './tableDetail'
import { Select } from '@uyun/components'
const Option = Select.Option

@inject('createdTableStore')
@observer
class CreatedTable extends Component {
    onPageChange = (page, pageSize) => {
      this.props.createdTableStore.setPageNum(page, pageSize)
    }

    onSelectChange = value => {
      this.props.createdTableStore.setFilterType(value)
    }

    componentDidMount () {
      this.disposer = autorun(() => {
        const { pageNum, pageSize, creator, filterType, extParams } = this.props.createdTableStore
        const data = { pageNum, pageSize, creator, filterType: 'myCreate', extParams }
        const params = filterType === 'all' ? data : _.merge({}, data, {
          filterType: 'myCreate',
          status: [filterType]
        })
        this.props.createdTableStore.getAllTicket(params)
      })
    }

    componentWillUnmount () {
      this.disposer()
      this.props.createdTableStore.distory()
    }

    render () {
      const options = [
        { value: 'all', label: i18n('all') },
        { value: '1', label: i18n('status_1') },
        { value: '2', label: i18n('status_2') },
        { value: '3', label: i18n('status_3') },
        { value: '7', label: i18n('status_7') },
        { value: '10', label: i18n('status_10') },
        { value: '11', label: i18n('status_11') }
      ]
      const { lists, pageNum, total, filterType, pageSize, loading } = toJS(this.props.createdTableStore)
      return (
        <div className="overview-person-table">
          <div className="overview-person-table-filter">
            <Select defaultValue={filterType}
              style={{ width: 200 }}
              onChange={this.onSelectChange}>
              {_.map(options, (item, i) => {
                return <Option key={i} value={item.value}>{item.label}</Option>
              })}
            </Select>
          </div>
          <TableDetail
            loading={loading}
            data={lists}
            current={pageNum}
            pageSize={pageSize}
            total={total}
            onChange={this.onPageChange} />
        </div>)
    }
}

export default CreatedTable
