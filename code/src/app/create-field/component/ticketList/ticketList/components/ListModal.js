import React, { Component, Fragment } from 'react'
import { observer } from 'mobx-react'
import { Button, Modal, Table, Input } from '@uyun/components'

const Search = Input.Search
@observer
class AddModal extends Component {
  componentDidMount () {
    this.props.ticketListStore.getAllTicketListData()
  }

  changePager = (pageNum, pageSize) => {
    this.props.ticketListStore.changeSearchParams({ pageNum, pageSize })
  }

  onOk = () => {
    const {
      toggleListModalVisible
    } = this.props.ticketListStore
    toggleListModalVisible()
  }

  afterClose = () => {

  }

  stateChange = (value) => {

  }

  renderOperate=(text, record, index) => {
    const {
      selectedList,
      addItem,
      removeItem
    } = this.props.ticketListStore
    const commonTicket = selectedList.find(item => item.ticketId === record.ticketId)
    if (commonTicket) {
      return <a onClick={() => { removeItem(record); this.forceUpdate() }}>移除</a>
    } else {
      return <a onClick={() => { addItem(record); this.forceUpdate() }}>关联</a>
    }
  }

  render () {
    const {
      listModalVisible,
      toggleListModalVisible,
      allTicketListData,
      allTicketListLoading,
      searchParams,
      total,
      changeSearchParams,
      kwSearch
    } = this.props.ticketListStore
    const columns = [
      {
        title: '关联单号',
        dataIndex: 'ticketNum',
        key: 'ticketNum'
      },
      {
        title: '工单标题',
        dataIndex: 'ticketName',
        key: 'ticketName'
      },
      {
        title: '关联描述',
        dataIndex: 'ticketDesc',
        key: 'ticketDesc'
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: 100,
        render: this.renderOperate
      }
    ]
    const pagination = {
      defaultCurrent: 1,
      current: searchParams.pageNum,
      total: total,
      pageSize: searchParams.pageSize,
      showTotal: (total, range) => `共${total}条`,
      onChange: this.changePager,
      onShowSizeChange: this.changePager,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50']
    }
    return <Modal
      width={800}
      destroyOnClose
      afterClose={this.afterClose}
      title="依赖的关联工单"
      visible={listModalVisible}
      onCancel={toggleListModalVisible}
      footer={<Button type={'primary'} onClick={this.onOk}>确定</Button>}
    >
      <div style={{ marginBottom: 8 }}>
        <Search
          style={{ width: 300 }}
          placeholder={'请输入关键字'}
          onChange={e => {
            changeSearchParams({ wd: e.target.value })
          }}
          onSearch={kwSearch}
          enterButton="搜索"
        />
      </div>
      <Table
        rowKey={'ticketId'}
        columns={columns}
        pagination={pagination}
        loading={allTicketListLoading}
        bordered
        childrenColumnName={'zxcxvsdf'}
        dataSource={allTicketListData}
      />
    </Modal>
  }
}

export default AddModal
