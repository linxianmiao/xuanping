import React from 'react'
import { Table, Divider, Modal, message, Pagination } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const confirm = Modal.confirm

@inject('nodeStore')
@observer
class TableWrap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [{
        title: i18n('node_name', '节点名称'),
        dataIndex: 'name',
        key: 'name'
      }, {
        title: i18n('field_code', '编码'),
        dataIndex: 'code',
        key: 'code'
      }, {
        title: i18n('listSel.input_tips3', '描述'),
        dataIndex: 'description',
        key: 'description'
      }, {
        title: '操作',
        dataIndex: 'a',
        key: 'a',
        width: '120px',
        render: (text, record) => {
          return (
            <div>
              <a onClick={() => { this.props.editNode(record) }}>{i18n('edit', '编辑')}</a>
              <Divider type="vertical" />
              <a onClick={() => { this.deleteNodeName(record) }}>{i18n('delete', '删除')}</a>
            </div>
          )
        }
      }]
    }
  }

  deleteNodeName = (record) => {
    confirm({
      title: `${i18n('nodename.delete.tips', '确定删除该节点吗？')}`,
      content: i18n('nodename.delete.content', '节点一旦被删除后，将无法恢复'),
      // okType: 'danger',
      onOk: () => {
        this.props.nodeStore.deleteNodeName(record.id).then(resp => {
          if (resp === '200') {
            message.success(i18n('delete_success', '删除成功'))
          }
        })
      },
      onCancel() {
      }
    })
  }

  onChange = (pageNum, pageSize) => {
    this.props.nodeStore.changePage(pageNum, pageSize)
  }

  onShowSizeChange= (current, size) => {
    this.props.nodeStore.changePage(current, size)
  }

  render() {
    const { columns } = this.state
    const { nodeList, pageNum, pageSize, total } = this.props.nodeStore
    return (
      <div>
        <Table dataSource={nodeList} columns={columns} pagination={false} />
        <Pagination onChange={this.onChange} total={total} onShowSizeChange={this.onShowSizeChange} pageSize={pageSize} pageNum={pageNum} style={{ marginTop: '10px' }} />
      </div>
    )
  }
}
export default TableWrap