import React from 'react'
import { inject, observer } from 'mobx-react'
import { Table, Divider, Pagination, Switch, message, Modal } from '@uyun/components'
const confirm = Modal.confirm
@inject('directoryStore')
@observer
class SearchTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.columns = [{
      title: i18n('name', '名称'),
      dataIndex: 'name',
      key: 'name'
    }, {
      title: i18n('dir_path', '路径'),
      dataIndex: 'superiorGroupPath',
      key: 'superiorGroupPath'
    }, {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return <Switch checked={text === 1} size="small" onChange={(checked) => { this.changeChecked(record, checked) }} />
      }
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => {
        return <div>
          <span onClick={() => this.props.editItem(record)}>{i18n('edit', '编辑')}</span>
          <Divider type="vertical" />
          <span onClick={() => { this.deleteItem(record) }}>{i18n('delete', '删除')}</span>
        </div>
      }
    }]
  }

  deleteItem = (item) => {
    const type = item.type === 'GROUP' ? i18n('classify', '分类') : i18n('directory', '目录')
    confirm({
      title: `${i18n('queryer.delete.tips', '你确定要删除')}${type}${i18n('queryer.delete.tips1', '吗？')}`,
      content: i18n('queryer.delete.content', '删除后，数据将无法恢复'),
      onOk: () => {
        this.props.directoryStore.deleteDirectory(item.id).then(res => {
          if (res === '200') {
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

  changeChecked = (item, checked) => {
    const status = checked ? 1 : 0
    const id = item.id
    this.props.directoryStore.directoryChangeStatus({ id: id, status })
  }

  render() {
    const { searchItemList, pageSize, pageNum } = this.props.directoryStore
    return (
      <div className="table_wrap">
        <Table dataSource={searchItemList.list} columns={this.columns} pagination={false} />
        <Pagination onChange={this.onChange} total={searchItemList.total} onShowSizeChange={this.onShowSizeChange} pageSize={pageSize} pageNum={pageNum} style={{ marginTop: '10px' }} />
      </div>
    )
  }
}
export default SearchTable