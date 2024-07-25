import React from 'react'
import { Modal, Table } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const columns = [{
  title: i18n('conf.model.field.card.name', '名称'),
  dataIndex: 'name'
}, {
  title: i18n('ticket.create.type', '类型'),
  dataIndex: 'type',
  render: text => {
    return <span>{text === 'GROUP' ? '分类' : '目录'}</span>
  }
}]
@inject('directoryStore')
@observer
class RepeatModal extends React.Component {
    state = {
      selectedRows: []
    }

    forcedImport = () => {
      const data = {
        fileId: this.props.data.fileId,
        repeatList: this.state.selectedRows
      }
      this.props.directoryStore.forcedImport(data).then(resp => {
        this.props.importSuccess()
      })
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
      this.setState({ selectedRows })
    }

    render() {
      const { repeatvisible, data } = this.props
      const rowSelection = {
        onChange: this.onSelectChange
      }
      return (
        <Modal
          title={i18n('ticket-list-import-dir', '导入目录')}
          visible={repeatvisible}
          onOk={this.forcedImport}
          onCancel={this.props.hideModal}
          okText={i18n('config.trigger.import', '导入')}
          className="repeat_modal_wrap"
        >
          <div>
            <div className="repeat_modal_content_tip">
              <i className="iconfont icon-tishi" />
              <span>{`${data.repeatList.length || 0}${i18n('ticket-list-import-dir-infoTips', '条信息已存在，请确认是否导入')}`}</span>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={data.repeatList} pagination={false} />
          </div>
        </Modal>
      )
    }
}
export default RepeatModal