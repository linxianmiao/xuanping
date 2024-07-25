import React, { Component } from 'react'
import { Form, Input, Table, Checkbox, Row, Col } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import styles from './index.module.less'
import classnames from 'classnames'

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
    onChangeUseVariable: () => {},
    handleChangeAdd: () => {}
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

  getTenants = async (query, callback) => {
    const res = (await axios.get(API.queryAllTenantList, { params: query })) || {}
    const list = res.list || []

    callback(list)
  }

  onSelect = (record, selected, selectedRows) => {
    this.props.onSelect([record], selected, this.props.type)
  }
  selectRow = (record) => {
    const { selectedRowKeys } = this.props
    if (selectedRowKeys.includes(record.id)) {
      this.props.onSelect([record], false, this.props.type)
    } else {
      this.props.onSelect([record], true, this.props.type)
    }
  }
  onSelectAll = (selected, selectedRows, changeRows) => {
    this.props.onSelectAll(changeRows, selected, this.props.type)
  }

  handleChangeAdd = (value) => {
    this.props && this.props?.handleChangeAdd(value)
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
      handleChangeQuery,
      mode
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
        <Form layout="inline" style={{ marginBottom: 10 }}>
          <Row>
            <Col span={10}>
              <Form.Item>
                <Input.Search
                  allowClear
                  enterButton
                  placeholder="请输入关键字"
                  onSearch={(value) => {
                    this.handleChangeAdd(false)
                    handleChangeQuery(
                      _.assign({}, query, { kw: value, pageNo: 1, lazyLoad: false })
                    )
                  }}
                  onClear={(e) => {
                    this.handleChangeAdd(false)
                    handleChangeQuery(
                      _.assign({}, query, { kw: e.target.value, pageNo: 1, lazyLoad: false })
                    )
                  }}
                />
              </Form.Item>
            </Col>

            {type === 'variables' && (
              <Col span={13} push={1}>
                <Form.Item>
                  <Checkbox checked={useVariable} onChange={this.onChange}>
                    {i18n('variable-tip', '当变量有值时，仅选择变量值作为处理人')}
                  </Checkbox>
                </Form.Item>
              </Col>
            )}

            {(type === 'crossUnitUsers' || type === 'crossUnitGroups') && (
              <Col span={6} push={1}>
                <Form.Item>
                  <LazySelect
                    placeholder={'请选择租户'}
                    value={query.qytids}
                    labelInValue={false}
                    getList={this.getTenants}
                    onChange={(value) => {
                      this.handleChangeAdd(false)
                      handleChangeQuery(
                        _.assign({}, query, { pageNo: 1, qytids: value, lazyLoad: false })
                      )
                    }}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>

        <Table
          className={classnames({
            [styles.table]: true,
            [styles.smallSize]: mode === 'select'
          })}
          rowKey={rowKey}
          size={size}
          columns={columns}
          dataSource={dataSource}
          onRow={(record) => {
            return {
              onClick: () => {
                this.selectRow(record)
              }
            }
          }}
          rowSelection={{
            type: selectionType,
            selectedRowKeys,
            onSelect: this.onSelect,
            onSelectAll: this.onSelectAll
          }}
          pagination={type === 'groups' ? false : pagination}
          loadMore={loadMore}
          onLoadMore={() => {
            this.handleChangeAdd(true)
            const pageNo = query.pageNo + 1
            handleChangeQuery(_.assign({}, query, { pageNo, lazyLoad: true }))
          }}
        />
      </div>
    )
  }
}
