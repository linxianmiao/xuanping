import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import classnames from 'classnames'
import { observer, inject } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons'
import { Button, Table, Switch, Modal, notification, message, Divider } from '@uyun/components'
import ErrorBoundary from '~/components/ErrorBoundary'
import matrixStore from '../stores/matrixStore'
import ImportExcel from '../../components/importExcel'
import styles from './index.module.less'
@inject('globalStore')
@withRouter
@observer
class Index extends Component {
  state = {
    loading: false
  }

  componentDidMount() {
    this.getList()
  }

  getList = () => {
    this.setState({ loading: true })
    matrixStore.getMatrixList()
    this.setState({ loading: false })
  }

  handleExportMatrix = (e, id) => {
    e.preventDefault()
    let iframe = document.getElementById('ticketListDownLoadIframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'ticketListDownLoadIframe')
      iframe.setAttribute('width', '0')
      iframe.setAttribute('height', '0')
      document.body.appendChild(iframe)
    }
    iframe.setAttribute('src', API.exportMatrixRow(id))
  }

  handleChangeStatus = async (checked, record) => {
    const status = checked ? 1 : 0
    const res = await matrixStore.changeStatus(record.id, status)
    if (res === '200') {
      this.getList()
    } else if (res instanceof Array) {
      notification.warning({
        message: i18n('system-matrix-list-status-tip', '操作失败,有模型引用'),
        description: (
          <div>
            {_.map(res, (item) => (
              <a
                onClick={() => {
                  this.linkToModel(item.modelId)
                }}
                style={{ display: 'block' }}
                key={item.modelId}
              >
                {item.modelName}
              </a>
            ))}
          </div>
        )
      })
    }
  }

  handleDelete = (e, record) => {
    e.stopPropagation()
    if (record.status === 1) return false
    Modal.confirm({
      title: i18n('system-matrix-list-delete-tip', '您确认要删除该矩阵'),
      onOk: async () => {
        const res = await matrixStore.deleteMatrix(record.id)
        if (res === '200') {
          message.success(i18n('del.sucess', '删除成功'))
          this.getList()
        } else if (res instanceof Array) {
          notification.warning({
            message: i18n('system-matrix-list-status-tip', '操作失败,有模型引用'),
            description: (
              <div>
                {_.map(res, (item) => (
                  <a
                    onClick={() => {
                      this.linkToModel(item.modelId)
                    }}
                    style={{ display: 'block' }}
                    key={item.modelId}
                  >
                    {item.modelName}
                  </a>
                ))}
              </div>
            )
          })
        }
      }
    })
  }

  linkToModel = (id) => {
    this.props.history.push(`/conf/model/advanced/${id}`)
  }

  handleCopy = (e, record) => {
    e.preventDefault()
    e.stopPropagation()
    this.props.history.push(`/sysCon/matrixTemplate/copy/${record.id}`)
  }

  getcolumns = () => {
    const { matrixModify, matrixDelete } = this.props.globalStore.configAuthor
    const columns = [
      {
        title: i18n('conf.model.field.card.name', '名称'),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Link to={`/sysCon/matrixTemplate/detail/${record.id}`}>{text}</Link>
        )
      },
      {
        title: i18n('conf.model.field.code', '编码'),
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: i18n('conf.model.field.card.desc', '描述'),
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: i18n('ticket.list.creatPerson', '创建人'),
        dataIndex: 'creator',
        key: 'creator'
      },
      {
        title: i18n('ticket.create.resState', '状态'),
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          if (matrixModify) {
            return (
              <Switch
                checked={text === 1}
                onChange={(e) => {
                  this.handleChangeStatus(e, record)
                }}
              />
            )
          }
          return text === 1 ? i18n('enable', '开启') : i18n('disable', '停用')
        }
      },
      {
        title: i18n('globe.opera', '操作'),
        key: 'opera',
        render: (record) => {
          return (
            <span className={styles.systemMatrixListOperation}>
              <a style={{ marginRight: 5 }} onClick={(e) => this.handleExportMatrix(e, record.id)}>
                {i18n('export', '导出')}
              </a>
              <Divider type="vertical" />
              <a
                onClick={(e) => {
                  this.handleCopy(e, record)
                }}
                style={{ marginRight: 5 }}
              >
                {i18n('copy', '复制')}
              </a>
              {matrixDelete && (
                <>
                  <Divider type="vertical" />
                  <a
                    onClick={(e) => {
                      this.handleDelete(e, record)
                    }}
                    className={classnames({ disabled: record.status === 1 })}
                  >
                    {i18n('delete', '删除')}
                  </a>
                </>
              )}
            </span>
          )
        }
      }
    ]
    return columns
  }

  render() {
    const { matrixList, queryDate, total } = matrixStore
    const { loading } = this.state
    const { pageSize, pageNo: current } = queryDate
    const pagination = {
      total,
      current,
      pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50'],
      onChange: (pageNo, pageSize) => {
        matrixStore.setData(_.assign({}, queryDate, { pageNo, pageSize }), 'queryDate')
        this.getList()
      },
      onShowSizeChange: (pageNo, pageSize) => {
        matrixStore.setData(_.assign({}, queryDate, { pageNo, pageSize }), 'queryDate')
        this.getList()
      }
    }
    const { matrixInsert } = this.props.globalStore.configAuthor
    return (
      <div>
        <header className={styles.systemMatrixListHeader}>
          <div>
            <p>
              {i18n(
                'system-matrix-list-table-tip1',
                '协同矩阵利用二维矩阵的结构信息生成特定业务的审批关系，适合组织结构复杂业务复杂的流程审批场景。'
              )}
            </p>
            <p>
              {i18n(
                'system-matrix-list-table-tip2',
                '结合流程设计里的人员规则，动态赋值给流程审批节点的处理人。'
              )}
            </p>
          </div>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <div>
              <ImportExcel
                title={i18n('import-matrix', '导入矩阵')}
                templateSrc={API.downloadMatrixTemplate}
                importSrc={API.uploadMatrix}
                getList={this.getList}
                matrixStore={matrixStore}
              >
                <Button type="primary" style={{ marginRight: 10 }}>
                  {i18n('import', '导入')}
                </Button>
              </ImportExcel>

              {matrixInsert && (
                <Button
                  onClick={() => {
                    this.props.history.push('/sysCon/matrixTemplate/create')
                  }}
                  icon={<PlusOutlined />}
                  type="primary"
                >
                  {i18n('system-create-matrix-template', '新建矩阵')}
                </Button>
              )}
            </div>
          </ErrorBoundary>
        </header>
        <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
          <Table
            rowKey={(record) => record.id}
            loading={loading}
            columns={this.getcolumns()}
            dataSource={matrixList}
            pagination={pagination}
          />
        </ErrorBoundary>
      </div>
    )
  }
}

export default Index
