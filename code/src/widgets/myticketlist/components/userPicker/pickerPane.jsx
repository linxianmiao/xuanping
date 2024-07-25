import React, { Component } from 'react'
import { Form, Input, Table, Checkbox } from '@uyun/components'
// import LazySelect from '../lazyLoad/lazySelect';
import styles from './index.module.less'

export default class PickerPane extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadMore: 'finished'
    }
  }

  static defaultProps = {
    onSelect: () => {},
    onSelectAll: () => {},
    onChangeUseVariable: () => {}
  }

  componentDidMount() {
    const { dataSource, query } = this.props
    const { pageNo, pageSize } = query
    if (dataSource.length < pageNo * pageSize) {
      this.setState({ loadMore: 'finished' })
    } else {
      this.setState({ loadMore: false })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dataSource !== this.props.dataSource) {
      const { dataSource, query } = this.props
      const { pageNo, pageSize } = query
      if (dataSource.length < pageNo * pageSize) {
        this.setState({ loadMore: 'finished' })
      } else {
        this.setState({ loadMore: false })
      }
    }
  }

  // getTenants = async (query, callback) => {
  //   const res = (await axios.get(API.queryAllTenantList, { params: query })) || {}
  //   const list = res.list || []

  //   callback(list)
  // }

  onSelect = (record, selected, selectedRows) => {
    this.props.onSelect([record], selected, this.props.type)
  }

  onSelectAll = (selected, selectedRows, changeRows) => {
    this.props.onSelectAll(changeRows, selected, this.props.type)
  }

  // 是否勾选 当变量有值时，仅选择变量值作为处理人 仅在变量的tab也使用
  onChange = (e) => {
    this.props.onChangeUseVariable(e.target.checked)
  }

  render() {
    const {
      rowKey,
      size,
      columns,
      dataSource,
      total,
      query,
      type,
      useVariable,
      selectedRowKeys,
      selectionType,
      handleChangeQuery
    } = this.props
    const { pageNo, pageSize } = query
    const pagination = {
      total,
      size: 'small',
      showTotal: false,
      showQuickJumper: false,
      current: pageNo,
      pageSize,
      onChange: (pageNo, pageSize) => {
        handleChangeQuery(_.assign({}, query, { pageNo, pageSize, lazyLoad: false }))
      }
    }
    const { loadMore } = this.state
    return (
      <div>
        <Form layout="inline">
          <Form.Item>
            <Input.Search
              allowClear
              enterButton
              placeholder="请输入关键字"
              onSearch={(value) => {
                handleChangeQuery(_.assign({}, query, { kw: value, pageNo: 1, lazyLoad: false }))
              }}
              onClear={(e) => {
                handleChangeQuery(
                  _.assign({}, query, { kw: e.target.value, pageNo: 1, lazyLoad: false })
                )
              }}
            />
          </Form.Item>
          {type === 'variables' && (
            <Form.Item>
              <Checkbox checked={useVariable} onChange={this.onChange}>
                当变量有值时，仅选择变量值作为处理人
              </Checkbox>
            </Form.Item>
          )}
          {/* {(type === 'crossUnitUsers' || type === 'crossUnitGroups') && (
            <Form.Item>
              <LazySelect
                placeholder={'请选择租户'}
                value={query.qytids}
                labelInValue={false}
                getList={this.getTenants}
                onChange={(value) =>
                  handleChangeQuery(_.assign({}, query, { qytids: value, lazyLoad: false }))
                }
              />
            </Form.Item>
          )} */}
        </Form>

        <Table
          className={styles.table}
          rowKey={rowKey}
          size={size}
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            type: selectionType,
            selectedRowKeys,
            onSelect: this.onSelect,
            onSelectAll: this.onSelectAll
          }}
          pagination={type === 'groups' ? false : pagination}
          loadMore={loadMore}
          onLoadMore={() => {
            const pageNo = query.pageNo + 1
            handleChangeQuery(_.assign({}, query, { pageNo, lazyLoad: true }))
          }}
        />
      </div>
    )
  }
}
