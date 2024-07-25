import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { Table, Switch, Modal, message, Input } from '@uyun/components'
import ErrorBoundary from '~/components/ErrorBoundary'
import CopyIcon from '~/components/CopyIcon'
import AppSelect from './AppSelect'
import AppListStore from '../stores/AppListStore'
import styles from './index.module.less'

const appListStore = new AppListStore()

@withRouter
@observer
class AppAccess extends Component {
  componentDidMount() {
    appListStore.query()
  }

  handleAppSelect = (app) => {
    this.props.history.replace({
      pathname: `/sysCon/appAccess/${app.appCode}`,
      state: app
    })
  }

  handleAvailable = async (checked, appCode) => {
    const url = `${API.changeAppAccessStatus}?appCode=${appCode}&status=${checked ? 1 : 0}`
    const res = await axios.get(url)
    if (res) {
      appListStore.query()
    }
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: i18n('app.delete.title', { name: record.appName }),
      content: i18n('app.delete.content'),
      onOk: () => {
        axios.get(`${API.deleteAppAccess}?appCode=${record.appCode}`).then((res) => {
          if (res) {
            message.success(i18n('del.sucess', '删除成功'))
            appListStore.query()
          }
        })
      }
    })
  }

  getColumns = () => {
    return [
      {
        title: i18n('app.name', '应用名称'),
        dataIndex: 'appName',
        render: (appName, record) => {
          if (!!record.isAvailable) {
            return <Link to={`/modellist/${record.appkey}`}>{appName}</Link>
          } else {
            return <a onClick={() => message.info('当前应用未启用')}>{appName}</a>
          }

          // <Link to={`/conf/model?appkey=${record.appkey}`}>{appName}</Link>
        }
      },
      {
        title: i18n('app.code', '应用Code'),
        dataIndex: 'appCode'
      },
      {
        title: 'app access key',
        dataIndex: 'appkey',
        render: (appkey) => (
          <div className={styles.appkey}>
            <span>{appkey}</span>
            <CopyIcon style={{ marginLeft: 8 }} value={appkey} />
          </div>
        )
      },
      {
        title: i18n('is.available', '是否启用'),
        dataIndex: 'isAvailable',
        render: (isAvailable, record) => (
          <Switch
            checked={!!isAvailable}
            onChange={(checked) => this.handleAvailable(checked, record.appCode)}
          />
        )
      },
      {
        title: i18n('operate', '操作'),
        render: (record) => (
          <a disabled={record.isCanDelete !== 1} onClick={() => this.handleDelete(record)}>
            {i18n('delete', '删除')}
          </a>
        )
      }
    ]
  }

  render() {
    const { data, loading, current, pageSize, total, onShowSizeChange, onPageChange, onSearch } =
      appListStore
    const pagination = {
      current,
      pageSize,
      total,
      onShowSizeChange,
      onChange: onPageChange
    }

    return (
      <>
        <div className={styles.header}>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <div className={styles.left}>
              <Input.Search enterButton placeholder="请输入关键字搜索" onSearch={onSearch} />
            </div>
            <div className={styles.right}>
              <AppSelect onOk={this.handleAppSelect} />
            </div>
          </ErrorBoundary>
        </div>
        <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
          <Table
            rowKey="appCode"
            columns={this.getColumns()}
            loading={loading}
            dataSource={toJS(data)}
            pagination={pagination}
          />
        </ErrorBoundary>
      </>
    )
  }
}
export default AppAccess
