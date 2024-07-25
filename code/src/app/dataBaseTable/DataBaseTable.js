import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { Table, Button, Input, message, Popconfirm } from '@uyun/components'
import moment from 'moment'
import { linkToData } from '~/components/LowcodeLink'

const { Search } = Input

@inject('dataBaseStore')
@withRouter
@observer
class DataBaseTable extends Component {
  state = {
    wd: '',
    page: {
      pageNo: 1,
      pageSize: 10
    },
    loading: false
  }
  getColumn = () => {
    const columns = [
      {
        title: '数据表名称',
        dataIndex: 'dataSetName',
        key: 'dataSetName',
        width: 283,
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                //这里需要跳转编辑页面
                linkToData({
                  url: window.LOWCODE_APP_KEY
                    ? `/datatable/edit/${record?.dataSetId}/${window.LOWCODE_APP_KEY}`
                    : `/conf/database/edit/${record?.dataSetId}`,
                  pageKey: 'database_edit',
                  history: this.props.history
                })
              }}
            >
              {text}
            </a>
          )
        }
      },
      {
        title: '编码',
        dataIndex: 'dataSetCode',
        key: 'dataSetCode',
        width: 140
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 160,
        render: (text) => {
          return moment(text).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '描述',
        dataIndex: 'dataSetDesc',
        key: 'dataSetDesc',
        width: 520
      },
      {
        title: '操作',
        key: 'operation',
        width: 80,
        render: (text, record) => {
          return (
            <Popconfirm
              title={i18n('conf.model.del.card', '确定要删除吗？')}
              onConfirm={() => this.handleDelete(record.dataSetId)}
            >
              <a>删除</a>
            </Popconfirm>
          )
        }
      }
    ]
    return columns
  }

  handleDelete = async (id) => {
    let res = await this.props.dataBaseStore.deleteDataSet(id)
    if (res === 1) {
      this.getList()
      message.success('删除成功')
    } else {
      message.error('删除失败')
    }
  }
  componentDidMount() {
    this.getList()
    window.LOWCODE_APP_KEY = this.props.appkey
  }

  componentDidUpdate(prevProps) {
    if (prevProps.appkey !== this.props.appkey) {
      this.getList()
    }
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  getList = async () => {
    const { page, wd } = this.state
    this.setState({ loading: true })
    await this.props.dataBaseStore.queryDataSetList(_.assign({}, page, { wd }))
    this.setState({ loading: false })
  }
  onSearch = (value) => {
    this.setState({ wd: value }, () => {
      this.getList()
    })
  }
  render() {
    const { dataBaseInfo } = this.props.dataBaseStore
    const { total, pageNum, pageSize, list } = dataBaseInfo
    const { loading } = this.state
    return (
      <div className="dataBase">
        <div className="dataBase-search">
          <Search
            allowClear
            style={{ width: 220 }}
            placeholder="输入服务的关键字进行搜索"
            onSearch={this.onSearch}
          />
          <Button
            type="primary"
            onClick={() => {
              linkToData({
                url: window.LOWCODE_APP_KEY
                  ? `/datatable/create/${window.LOWCODE_APP_KEY}`
                  : '/conf/database/create',
                pageKey: 'database_create',
                history: this.props.history
              })
            }}
          >
            新建数据表
          </Button>
        </div>
        <Table
          dataSource={list || []}
          loading={loading}
          columns={this.getColumn()}
          pagination={{
            total,
            current: pageNum,
            pageSize,
            onChange: (pageNum, pageSize) => {
              this.setState({ page: { pageNo: pageNum, pageSize } }, () => {
                this.getList()
              })
            }
          }}
        />
      </div>
    )
  }
}

export default DataBaseTable
