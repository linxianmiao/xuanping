import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { getFieldList } from '../../configuration'
import { Modal, Table, Select, Input, Tabs, TreeSelect } from '@uyun/components'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'
import PropTypes from 'prop-types'
const Option = Select.Option
const TabPane = Tabs.TabPane
const FILTER = {
  wd: '',
  type: '',
  layoutId: '',
  pageNo: 1,
  pageSize: 20,
  scope: '2'
}
@inject('formSetGridStore')
@observer
export default class Load extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

  constructor(props) {
    super(props)
    const { fieldList } = props.formSetGridStore
    this.state = {
      visible: false,
      selectedRowKeys: _.map(fieldList, (field) => field.code),
      filter: FILTER,
      disabledCode: [],
      dataSource: [],
      loadMore: false
    }
  }

  handleChangeVisible = async (visible) => {
    const { fieldList, gridList, currentGrid } = this.props.formSetGridStore

    this.setState({ visible })

    if (visible) {
      const dataSource = await this.props.formSetGridStore.listFieldWithPage(FILTER)
      const selectedRowKeys = _.map(fieldList, (field) => field.code)
      let disabledCode = gridList.reduce((list, grid) => {
        return [...list, ..._.map(grid.fieldList, (field) => field.code)]
      }, [])
      disabledCode = [...disabledCode, ..._.map(currentGrid.fieldList, (field) => field.code)]

      this.setState({
        dataSource: dataSource.list,
        selectedRowKeys,
        disabledCode,
        loadMore: dataSource.total > dataSource.list.length ? false : 'finished'
      })
    } else {
      this.setState({
        dataSource: [],
        filter: FILTER
      })
    }
  }

  handleWdChange = (value) => {
    const filter = { ...this.state.filter, wd: value }

    this.setState({ filter })
  }

  handleChangeFilter = async (value, type) => {
    // 这个判断，为了解决滚动到底后改变筛选条件，滚动条不是在最上面的问题
    if (type !== 'pageNo') {
      this.setState({ dataSource: [] })
    }
    const filter = _.assign(
      {},
      this.state.filter,
      type === 'pageNo' ? { [type]: value } : { [type]: value, pageNo: 1 }
    )
    if (type === 'scope') {
      filter.businessUnitIds = undefined
    }
    this.setState({ filter })
    const fieldData = await this.props.formSetGridStore.listFieldWithPage(filter)
    this.setState({
      dataSource:
        type === 'pageNo' ? [...this.state.dataSource, ...fieldData.list] : fieldData.list,
      loadMore: filter.pageSize * filter.pageNo > (fieldData.total || 0) ? 'finished' : false
    })
  }

  handleOk = async () => {
    const { selectedRowKeys } = this.state
    await this.props.formSetGridStore.saveModelFields({
      fieldCodes: selectedRowKeys,
      modelId: this.context.modelId
    })
    this.handleChangeVisible(false)
  }

  handleChangeSelectedRowKeys = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys })
  }

  handleLoadMore = () => {
    const { filter } = this.state
    this.setState({
      loadMore: true
    })
    this.handleChangeFilter(filter.pageNo + 1, 'pageNo')
  }

  render() {
    const { visible, selectedRowKeys, filter, disabledCode, dataSource, loadMore } = this.state
    const { wd, type, layoutId, scope, businessUnitIds } = filter
    const columns = [
      {
        title: i18n('conf.model.field.name', '字段名称'),
        dataIndex: 'name',
        width: '25%',
        key: 'name'
      },
      {
        title: i18n('conf.model.field.code', '编码'),
        dataIndex: 'code',
        width: '25%',
        key: 'code'
      },
      {
        title: i18n('conf.model.field.typeDesc', '字段类型'),
        dataIndex: 'typeDesc',
        width: '25%',
        key: 'typeDesc'
      }
    ]

    columns.push({
      title: i18n('conf.model.field.layoutId', '分组'),
      dataIndex: 'layoutInfoVo',
      width: '25%',
      key: 'layoutInfoVo',
      render: (layout) => (layout ? layout.name : '')
    })

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.handleChangeSelectedRowKeys(selectedRowKeys, selectedRows)
      },
      getCheckboxProps: (record) => ({
        disabled: disabledCode.includes(record.code) // 已经引用的字段不能移除
      })
    }
    return (
      <React.Fragment>
        <Modal
          title={i18n('conf.model.load.field', '载入字段')}
          okText={i18n('conf.model.load', '载入')}
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleChangeVisible(false)
          }}
          width={600}
          className="load-field-modal"
        >
          <div className="load-field-wrap">
            <div className="clearfix" style={{ marginBottom: 18 }}>
              <Tabs
                activeKey={scope}
                onChange={(value) => {
                  this.handleChangeFilter(value, 'scope')
                }}
              >
                <TabPane key="2" tab={i18n('entend_field', '扩展字段')} />
                <TabPane key="1" tab={i18n('builtin_field', '内置字段')} />
              </Tabs>
              <Input.Search
                allowClear
                enterButton
                value={wd}
                style={{ width: 200 }}
                placeholder={i18n('globe.keywords', '请输入关键字')}
                onChange={(e) => this.handleWdChange(e.target.value)}
                onSearch={(value) => this.handleChangeFilter(value, 'wd')}
                onClear={() => this.handleChangeFilter(undefined, 'wd')}
              />
              <Select
                allowClear
                value={type || undefined}
                placeholder={`${i18n('globe.select', '请选择')}${i18n(
                  'field_header_type',
                  '字段类型'
                )}`}
                style={{ width: 154, marginLeft: 20 }}
                onChange={(value) => {
                  this.handleChangeFilter(value, 'type')
                }}
              >
                {_.map(getFieldList(), (item) => {
                  return (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  )
                })}
              </Select>
              <FieldGroupLazySelect
                style={{ width: 154, marginLeft: 20 }}
                value={layoutId || undefined}
                onChange={(value) => this.handleChangeFilter(value, 'layoutId')}
              />
            </div>
            <Table
              loadMore={loadMore}
              onLoadMore={this.handleLoadMore}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              rowKey={(record) => record.code}
              scroll={{ y: 350 }}
              wrapClassName="load-field-modal"
            />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
