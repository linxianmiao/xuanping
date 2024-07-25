import React from 'react'
import { DownloadOutlined, UploadOutlined } from '@uyun/icons'
import { Input, Tree, Tooltip } from '@uyun/components'
import TicketListImport from './import'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
const { TreeNode } = Tree
@inject('directoryStore')
@observer
class OrgWrap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      exportVisible: false, // 导出
      importVisible: false // 导入
    }
  }

  onChange = (e) => {
    this.props.directoryStore.setOrgKw(e.target.value)
  }

  // 导入取消
  handleImportCancle = (callback) => {
    this.setState({ importVisible: false }, () => {
      callback && callback()
    })
  }

  // 导出的状态
  handleExportCancle = (exportVisible) => {
    let iframe = document.getElementById('ticketListDownLoadIframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'ticketListDownLoadIframe')
      iframe.setAttribute('width', '0')
      iframe.setAttribute('height', '0')
      document.body.appendChild(iframe)
    }
    iframe.setAttribute('src', API.exportDirectory)
  }

  onLoadData = (treeNode) =>
    new Promise((resolve) => {
      if (treeNode.props.dataRef.children) {
        resolve()
        return
      }
      setTimeout(async () => {
        this.props.directoryStore.getDepartList(treeNode.props.eventKey)
        resolve()
      }, 300)
    })

  onSelect = (selectedKeys, e) => {
    const data = {
      name: e.node.props.title,
      departId: selectedKeys[0] === 'null' ? undefined : selectedKeys[0]
    }
    this.props.directoryStore.setCurrentOrg(data)
  }

  render() {
    const { importVisible, exportVisible } = this.state
    const { departList, currentOrg } = toJS(this.props.directoryStore)
    const loop = (data) =>
      data.map((item) => {
        if (item.children && item.children.length) {
          return (
            <TreeNode key={item.departId} title={item.name} dataRef={item}>
              {loop(item.children)}
            </TreeNode>
          )
        }
        return (
          <TreeNode key={item.departId} title={item.name} dataRef={item} isLeaf={!item.isLeaf} />
        )
      })
    return (
      <div className="system_org_wrap">
        <div className="system_org_title">
          {i18n('organizational_structure', '组织结构')}
          <Tooltip placement="top" title={i18n('organizational_upload_dir', '导入变更目录')}>
            <DownloadOutlined
              onClick={() => {
                this.setState({ importVisible: true })
              }}
            />
          </Tooltip>
          <Tooltip placement="top" title={i18n('organizational_download_dir', '导出变更目录')}>
            <UploadOutlined
              onClick={() => {
                this.handleExportCancle('form')
              }}
            />
          </Tooltip>
        </div>
        <div className="system_org_content">
          <Input.Search
            className="system_org_search"
            onChange={this.onChange}
            placeholder={i18n('input_keyword', '请输入关键字')}
          />
          <Tree
            className="draggable-tree"
            loadData={this.onLoadData}
            selectedKeys={[currentOrg.departId]}
            // draggable
            // onDragEnter={this.onDragEnter}
            // onDrop={this.onDrop}
            onSelect={this.onSelect}
          >
            {loop(departList)}
          </Tree>
        </div>
        {importVisible ? (
          <TicketListImport visible={importVisible} handleImportCancle={this.handleImportCancle} />
        ) : null}
      </div>
    )
  }
}
export default OrgWrap
