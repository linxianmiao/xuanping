import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Button, message, Popconfirm, Drawer, Form, Col, Empty } from '@uyun/components'
// import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import { renderField } from '~/ticket/forms/utils/renderField'
import FilterList from './filterList'
import ImportButton from './ImportButton'
import '../style/index.less'

const { ColumnButton } = Table

@Form.create()
@inject('dataBaseStore', 'tableListStore')
@observer
class InitializedTable extends Component {
  state = {
    wd: '',
    page: {
      pageNo: 1,
      pageSize: 10
    },
    open: false,
    pages: {
      pageNo: 1,
      pageSize: 10
    },
    searchList: [],
    columns: [], //展示的列表，初始只展示关键属性 搜索栏也是展示关键属性搜索
    allColumns: [], //全部的列表属性  新增数据页需要依赖这个数据
    customizeSelect: [], //定制列选中的数据
    customizeAll: [], //定制列全部数据
    loading: false,
    listLoading: false,
    editRecord: {},
    currentType: '',
    dataSetItemId: '',
    tableWidth: 1000,
    conditions: {}, //动态的查询条件
    isShow: false
  }
  getColumn = () => {
    const { columns } = this.state
    const column = _.map(columns, (item) => {
      return {
        title: item.name,
        dataIndex: item.code,
        key: item.code,
        width: 160
      }
    })
    if (!_.isEmpty(column)) {
      column.push({
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 100,
        render: (text, record) => (
          <Button.Group type="link">
            <a onClick={() => this.handleEdit(record)}>{i18n('edit', '编辑')}</a>
            <Popconfirm
              title={i18n('conf.model.del.card', '确定要删除吗？')}
              onConfirm={() => this.handleDelete(record.dataSetItemId)}
            >
              {' '}
              <a>{i18n('delete', '删除')}</a>
            </Popconfirm>
          </Button.Group>
        )
      })
    }
    return column
  }

  handleEdit = async (record) => {
    let res = await this.props.dataBaseStore.getDataSetItem({ dataSetItemId: record.dataSetItemId })
    if (res) {
      this.setState({ editRecord: res?.itemData, dataSetItemId: res?.dataSetItemId }, () => {
        this.handleChangeVisible(true, 'edit')
      })
    }
  }

  handleDelete = async (id) => {
    let res = await this.props.dataBaseStore.deleteDataSetItem(id)
    if (res === 1) {
      this.getList()
      message.success('删除成功')
    } else {
      message.error('删除失败')
    }
  }
  componentDidMount() {
    this.getFieldsList()
    this.getList()
  }

  componentDidUpdate(prevProps) {
    const { current } = this.props
    if (current !== prevProps.current && (current === 'maintenance' || current === 2)) {
      this.getFieldsList()
    }
  }

  getFieldsList = async () => {
    const { dataSetId } = this.props
    const { pages } = this.state
    let res = await this.props.dataBaseStore.listDataFieldWithPages(
      _.assign({}, pages, { wd: '', dataSetId: dataSetId })
    )

    let columns = _.filter(res, (item) => item.isShowColumn === 1) || []
    let customizeSelect = _.map(columns, (v) => v.code)
    let customizeAll = _.map(res, (v) => {
      return {
        label: v.name,
        value: v.code
      }
    })

    this.setState({
      searchList: columns, //这里需要改回来
      allColumns: res || [],
      columns: columns,
      customizeSelect,
      customizeAll,
      tableWidth: columns
        .map((item) => item.width)
        .filter((item) => !isNaN(item))
        .reduce((sum, item) => +sum + +item, 0)
    })
  }

  getList = async () => {
    const { page, conditions } = this.state
    const { dataSetId } = this.props
    let params = _.assign({}, page, { dataSetId, conditions: conditions })
    this.setState({ listLoading: true })
    await this.props.dataBaseStore.queryDataSetItem(params)
    this.setState({ listLoading: false })
  }
  onSearch = (value) => {
    this.setState({ wd: value }, () => {
      this.getList()
    })
  }
  handleChangeVisible = (open, type) => {
    this.setState({ open, currentType: type }, () => {
      if (type !== 'edit') {
        this.setState({ editRecord: {}, dataSetItemId: '' })
      }
    })
  }

  handleSubmit = () => {
    const { dataSetId } = this.props
    const { currentType, dataSetItemId } = this.state
    this.props.form.validateFields(async (error, values) => {
      if (error) return
      if (!this.props.tableListStore.validate()) return
      let params = {
        dataSetId: dataSetId,
        itemData: values
      }
      if (currentType === 'edit') params.dataSetItemId = dataSetItemId

      this.setState({ loading: true })
      const res =
        currentType === 'edit'
          ? await this.props.dataBaseStore.updateDataSetItem(params)
          : await this.props.dataBaseStore.saveDataSetItem(params)
      this.setState({ loading: false })
      if (res === 1) {
        message.success('保存成功')
        this.handleChangeVisible(false, 'close')
        this.getList()
      } else {
        message.error('保存失败')
      }
    })
  }

  //查询条件
  handleChange = (data) => {
    const { conditions, page } = this.state
    this.setState(
      { conditions: _.assign({}, conditions, data), page: _.assign({}, page, { pageNo: 1 }) },
      () => {
        this.getList()
      }
    )
  }

  componentWillUnmount() {
    this.setState({
      editRecord: {},
      loading: false,
      listLoading: false,
      dataSetItemId: ''
    })
  }

  onClickMore = () => {
    this.setState({ isShow: !this.state.isShow })
  }
  handleSuccess = () => {
    const { page } = this.state
    this.setState({ page: _.assign({}, page, { pageNo: 1 }) }, () => {
      this.getList()
    })
  }

  render() {
    const { listInfo } = this.props.dataBaseStore
    const { total, pageNum, pageSize, list } = listInfo
    const {
      open,
      customizeSelect,
      customizeAll,
      allColumns,
      loading,
      listLoading,
      editRecord,
      currentType,
      searchList,
      isShow,
      page
    } = this.state
    const { dataSetId } = this.props
    const formDom = []
    let cols = 0

    if (!_.isEmpty(allColumns)) {
      allColumns.forEach((field, index) => {
        let list = _.assign({}, field, field.params, {
          fieldLabelLayout: 'vertical',
          fieldLayout: { col: 24 },
          fieldDesc: field.descr
        })
        if (['user', 'userGroup', 'department'].includes(list.type)) {
          if (list?.defaultValue) {
            list.defaultValue = JSON.parse(list.defaultValue)
          }
        }
        if (list.type === 'listSel') {
          list.params = JSON.parse(list.params)
          if (list.tabStatus === '1') {
            //外部数据源
            list.formData = JSON.parse(list.formData)
            list.headers = JSON.parse(list.headers)
            list.raw = JSON.parse(list.raw)
          }
        }
        // 关键属性 新增时要求必填
        if (Number(list.isKeyAttribute) === 1) {
          list.isRequired = 1
        }
        const dilver = {
          // forms,
          field: list,
          // ticketId,
          initialValue: currentType === 'edit' ? editRecord[list.code] : list.defaultValue,
          // disabled: list.isRequired === 2,
          form: this.props.form,
          ..._.pick(this.props.form, [
            'getFieldDecorator',
            'setFieldsValue',
            'getFieldValue',
            'getFieldsError',
            'getFieldError'
          ]),
          type: 'dataBase'
        }
        const col = 24
        cols = cols + col
        if (cols > 24) {
          formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
          cols = 0 + col
        }
        formDom.push(
          <Col span={col} key={field.id || `${field.type}${index}`}>
            {renderField(field, dilver)}
          </Col>
        )
      })
    }

    return (
      <div>
        <div className="dataBase-search">
          <div className="database-filter-list">
            <FilterList
              searchList={searchList.slice(0, 3)}
              handleChange={this.handleChange}
              showIcon={searchList.length > 3}
              onClickMore={this.onClickMore}
              isShow={isShow}
            />
          </div>
          <div className="dataBase-btn">
            <ImportButton
              dataSetId={dataSetId}
              onSuccess={this.handleSuccess}
              dataBaseStore={this.props.dataBaseStore}
            />
            <Button
              onClick={() => {
                window.open(`${API.exportDataSheetItem}?dataSetId=${dataSetId}`)
              }}
            >
              导出
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.setState({ open: true })
              }}
            >
              新增数据
            </Button>
            <ColumnButton
              value={customizeSelect}
              checkboxGroups={[
                {
                  key: 'data',
                  options: customizeAll || []
                }
              ]}
              onChange={(value) => {
                this.setState({ customizeSelect: value }, () => {
                  const column = _.filter(allColumns, (item) => value.includes(item.code))
                  this.setState({
                    columns: column,
                    tableWidth: column
                      .map((item) => item.width)
                      .filter((item) => !isNaN(item))
                      .reduce((sum, item) => +sum + +item, 0)
                  })
                })
              }}
            />
          </div>
        </div>
        {isShow ? (
          <FilterList
            searchList={searchList.slice(3, searchList.length)}
            handleChange={this.handleChange}
            className="database-filter-list-item"
          />
        ) : null}
        {!_.isEmpty(this.getColumn()) ? (
          <Table
            loading={listLoading}
            dataSource={list}
            columns={this.getColumn()}
            scroll={{ x: this.state.tableWidth }}
            pagination={{
              total,
              current: pageNum,
              pageSize,
              onChange: (pageNum, pageSize) => {
                this.setState(
                  { page: { pageNo: pageSize !== page.pageSize ? 1 : pageNum, pageSize } },
                  () => {
                    this.getList()
                  }
                )
              }
            }}
          />
        ) : (
          <Empty type="table" />
        )}
        <Drawer
          title={!_.isEmpty(editRecord) ? '编辑数据' : '新增数据'}
          onClose={() => this.handleChangeVisible(false, 'new')}
          open={open}
          destroyOnClose
          zIndex={999}
          size={'small'}
          outerClose={false}
          footer={
            <div className="drawer-btn">
              <Button type="primary" onClick={this.handleSubmit} loading={loading}>
                确定
              </Button>
              <Button onClick={() => this.handleChangeVisible(false, 'close')}>取消</Button>
            </div>
          }
        >
          <Form layout="vertical" className="database-fields">
            {' '}
            <div className="clearfix">{formDom}</div>
          </Form>
        </Drawer>
      </div>
    )
  }
}

export default InitializedTable
