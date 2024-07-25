import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'
import LazySelect from '~/components/lazyLoad/lazySelect'

@inject('userPickStore')
@observer
export default class MatrixPicker extends BasicPicker {
    static defaultProps = {
      extendQuery: {}
    }

    get extendQuery() {
      return {
        type: 6,
        modelId: this.props.extendQuery.modelId
      }
    }

    getRowList = async(query = {}, callback, id) => {
      const { pageSize, pageNo, kw } = query
      let res = await this.props.userPickStore.getMatrixRowList({ pageNum: pageNo, wd: kw, pageSize, id }) || []
      res = _.map(res.columnList, item => ({ id: item.columnId, name: item.columnName }))
      callback(res)
    }

    render () {
      const { rowKey, type } = this.props
      const { query, list } = this.state
      // const selectedRowKeys = _.map(this.props.value.matrix, item => item.id)
      const selectedRowKeys = _.filter(this.props.value.all, item => item.type === 'matrix').map(item => item.id)
      const columns = [
        {
          title: i18n('name', '名称'),
          dataIndex: 'name',
          width: '25%'
        }, {
          title: i18n('field_code', '编码'),
          dataIndex: 'code'
        }, {
          title: i18n('listSel.input_tips3', '描述'),
          dataIndex: 'description'
        }, {
          title: i18n('operation', '操作'),
          dataIndex: 'operation',
          width: 250,
          render: (text, record) => {
            const matrix = _.find(this.props.value.all, matrix => matrix.id === record.id) || {}
            const vos = _.map(matrix.matrixInfoVOS, vo => ({ label: vo.colName, key: vo.colId }))
            return <LazySelect
              value={vos}
              labelInValue
              onChange={value => { this.changeMatrixCol(value, record.id) }}
              getList={(query, callback) => { this.getRowList(query, callback, record.id) }}
              placeholder={i18n('pls_select_matrix_row', '选择矩阵列前，请先勾选矩阵')}
            />
          }
        }
      ]
      return (
        <StoreConsumer>
          {
            ({ props }) => (
              <PickerPane
                query={query}
                columns={columns}
                dataSource={list}
                type={type}
                rowKey={rowKey}
                selectionType={props.selectionType}
                selectedRowKeys={selectedRowKeys}
                onSelectAll={this.onSelect}
                onSelect={this.onSelect}
                handleChangeQuery={this.handleChangeQuery}
              />
            )
          }
        </StoreConsumer>
      )
    }
}
