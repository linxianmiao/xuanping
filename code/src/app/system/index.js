import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Tabs } from '@uyun/components'
import Global from './global/index'
import MatrixList from './matrix-list'
import Queryer from './queryer'
import Directory from './directory'
import Nodename from './nodename'
import Dictionary from './dictionary'
import Verification from './verification'
import RemoteSettings from './remoteSettings'
import AppAccess from './AppAccess/List'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import './style/index.less'
const TabPane = Tabs.TabPane

@inject('globalStore')
@observer
class Index extends Component {
  state = {
    active: this.props.match.params.type,
    globalVerification: true,
    remoteSetting: true
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      active: nextProps.match.params.type
    })
  }

  changeMenu = (key) => {
    this.props.history.push(`/sysCon/${key}`)
  }

  componentDidMount() {
    const {
      globalConfigModify,
      matrixModify,
      queryerPermission,
      changeDirectoryPermission,
      nodeManagementPermission,
      dictionaryView,
      appAccessPermission
    } = this.props.globalStore.configAuthor
    const { globalVerification, remoteSetting } = this.state
    if (!globalConfigModify) {
      if (matrixModify) {
        this.props.history.push('/sysCon/matrix')
      } else if (queryerPermission) {
        this.props.history.push('/sysCon/queryer')
      } else if (changeDirectoryPermission) {
        this.props.history.push('/sysCon/directory')
      } else if (nodeManagementPermission) {
        this.props.history.push('/sysCon/nodename')
      } else if (dictionaryView) {
        this.props.history.push('/sysCon/dictionary')
      } else if (appAccessPermission) {
        this.props.history.push('/sysCon/appAccess')
      }
      if (globalVerification) {
        this.props.history.push('/sysCon/verification')
      }
      if (remoteSetting) {
        this.props.history.push('/sysCon/remoteSettings')
      }
    }
  }

  render() {
    // 全局配置和协同矩阵的查看权限使用编辑权限来判断
    const {
      globalConfigModify,
      matrixModify,
      queryerPermission,
      changeDirectoryPermission,
      nodeManagementPermission,
      dictionaryView,
      appAccessPermission
    } = this.props.globalStore.configAuthor
    const { active, globalVerification, remoteSetting } = this.state
    const menus = [
      { name: i18n('global_config', '全局配置'), key: 'global', isShow: globalConfigModify },
      { name: i18n('global_matrix', '协同矩阵'), key: 'matrix', isShow: matrixModify },
      { name: i18n('global_queryer', '查询器'), key: 'queryer', isShow: queryerPermission },
      {
        name: i18n('global_directory', '变更目录'),
        key: 'directory',
        isShow: changeDirectoryPermission
      },
      {
        name: i18n('node_name_management', '节点名称管理'),
        key: 'nodename',
        isShow: nodeManagementPermission
      },
      {
        name: i18n('global_dictionary_manage', '字典管理'),
        key: 'dictionary',
        isShow: dictionaryView
      },
      {
        name: i18n('global_verification', '全局验证'),
        key: 'verification',
        isShow: globalVerification
      },
      { name: i18n('app.access', '应用接入'), key: 'appAccess', isShow: appAccessPermission },
      {
        name: i18n('remote_settings', '远程对接设置'),
        key: 'remoteSettings',
        isShow: remoteSetting
      }
    ]
    return (
      <div className="system-config">
        <PageHeader />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <div className="system-config-header">
              <Tabs activeKey={active} onChange={this.changeMenu}>
                {_.map(menus, (item, i) => {
                  if (item.isShow) {
                    return <TabPane tab={item.name} key={item.key} />
                  }
                  return null
                })}
              </Tabs>
            </div>
          </ErrorBoundary>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <div className="system-config-body">
              {active === 'global' && <Global />}
              {active === 'matrix' && <MatrixList />}
              {active === 'queryer' && <Queryer />}
              {active === 'directory' && <Directory />}
              {active === 'nodename' && <Nodename />}
              {active === 'dictionary' && <Dictionary />}
              {active === 'verification' && <Verification />}
              {active === 'appAccess' && <AppAccess />}
              {active === 'remoteSettings' && <RemoteSettings />}
            </div>
          </ErrorBoundary>
        </ContentLayout>
      </div>
    )
  }
}

export default Index
