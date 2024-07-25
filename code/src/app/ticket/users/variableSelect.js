import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table } from '@uyun/components'
import Search from './search'
import { TABS } from './config'
import variableList from '../../model/config/variable'
class VariableSelect extends Component {
  // 关键字 查找
    handleSearch= value => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], kw: value }, 'replace')
    }

    onChange = e => {
      this.props.setUseVariable(e.target.checked)
    }

    render () {
      const { lists, selects, query, tab, isUseVariable, isShowUserVariable, count } = this.props
      const { kw, pageNo, pageSize } = query[tab]
      const columns = [{
        title: i18n('name', '名称'),
        dataIndex: 'name'
      }, {
        title: i18n('ticket.create.type', '类型'),
        dataIndex: 'variableType',
        render: text => {
          const typeObj = _.find(variableList, variable => variable.value === text)
          return typeObj.label
        }
      }, {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      }, {
        title: i18n('listSel.input_tips3', '描述'),
        dataIndex: 'description'
      }]
      const rowSelection = {
        selectedRowKeys: selects.map(select => select.id),
        onChange: (selectedRowKeys, selectedRows) => {
          this.props.setSelects(this.props.tab, selectedRows)
        }
      }
      const pagination = {
        total: count,
        current: pageNo,
        pageSize: pageSize,
        size: 'small',
        onChange: page => {
          const { query, tab } = this.props
          this.props.onSearch(tab, { ...query[tab], pageNo: page }, 'replace')
        }
      }
      return (
        <div className="new-users-modal-section-wrap clearfix">
          <Search
            kw={kw}
            tab={tab}
            isUseVariable={isUseVariable}
            isShowUserVariable={isShowUserVariable}
            handleSearch={this.handleSearch}
            onChange={this.onChange} />
          <Table
            rowSelection={rowSelection}
            pagination={pagination}
            dataSource={lists}
            rowKey={record => record.id}
            columns={columns} />
        </div>
      )
    }
}
VariableSelect.propTypes = {
  lists: PropTypes.array.isRequired,
  selects: PropTypes.array.isRequired,
  setSelects: PropTypes.func.isRequired,
  setUseVariable: PropTypes.func.isRequired
}
export default VariableSelect
