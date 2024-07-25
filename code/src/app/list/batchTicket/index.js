import React from 'react'
import { Provider, observer } from 'mobx-react'
import { Modal } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import BatchHeader from './batchHeader'
import TicketTable from '../ticketTable'
import TicketPagination from '../components/ticketPagination'
import listStore from '../stores/listStore'
import ErrorBoundary from '~/components/ErrorBoundary'

import './index.less'

if (process.env.NODE_ENV !== 'production') {
  window.listStore = listStore
}

function compareObjByKeys(keys, obj1, obj2) {
  return keys.some((key) => obj1[key] !== obj2[key])
}

@observer
class BatchTicket extends React.Component {
  componentDidMount() {
    const filterType = this.props.match.params.type
    listStore.setProps({ filterType })
    listStore.initBatchData()
    listStore.getBatchHandleTicketList()
  }

  handleRowSelectionChange = (selectedRowKeys, onePageRows) => {
    const getUniqTicketKey = (ticket) => ticket.ticketId + ticket.tacheId + ticket.caseId
    const rows = [...listStore.selectedRows, ...onePageRows]
    const finalSelectedRows = selectedRowKeys.map((key) =>
      rows.find((row) => getUniqTicketKey(row) === key)
    )
    const setRows = () => {
      listStore.setProps({ selectedRowKeys, selectedRows: finalSelectedRows })
    }

    const getButtons = () => {
      // selectedRowKeys 是 ticketId + tacheId + caseId, 不能直接用
      const ticketIdList = selectedRowKeys.map((key) => key.slice(0, 32))
      const tacheIds = selectedRowKeys.map((key) => key.slice(32, 64)) // 环节id
      listStore.getHandleButtons(ticketIdList, tacheIds.length ? tacheIds[0] : '')
    }

    const tip = () => {
      Modal.warning({
        title: i18n('batch-handle-same-type-title', '请筛选相同工单批量处理'),
        content: i18n('batch-handle-same-type-content', '请筛选相同类型、阶段、状态和处理人的工单')
      })
    }

    const tip1 = () => {
      Modal.confirm({
        title: i18n('is.default.checked.ticket'),
        onOk() {
          const { ticketList } = listStore
          const list = _.reduce(
            ticketList,
            (curr, pre) => {
              if (
                !compareObjByKeys(['processId', 'tacheId', 'status'], finalSelectedRows[0], pre)
              ) {
                curr.push(pre)
              }
              return curr
            },
            []
          )
          const keys = _.map(list, (item) => getUniqTicketKey(item))
          listStore.setProps({ selectedRowKeys: keys, selectedRows: list })
        },
        onCancel() {}
      })
    }

    const len = selectedRowKeys.length
    if (len > 1) {
      let isDiff = false
      for (let i = 1; i < len; i++) {
        isDiff = compareObjByKeys(
          ['processId', 'tacheId', 'status'],
          finalSelectedRows[0],
          finalSelectedRows[i]
        )
        if (isDiff) {
          tip()
          break
        }
      }
      if (!isDiff) {
        setRows()
        getButtons()
      }
    } else {
      setRows()
      if (len === 1) {
        tip1()
        getButtons()
      }
    }
  }

  render() {
    const { count, selectedRows } = listStore
    const showBatchBtn = selectedRows.length > 0
    // 正在处理的工单Id列表，用来在表格上显示正在处理的圆圈
    const handlingTicketIdList = selectedRows.map((row) => row.ticketId)
    const paramsType = this.props.match.params.type
    const breadcrumbObj = {
      batchGroupTodo: { name: '组内待办', path: '/ticket/groupTodo' },
      batchMyTodo: { name: '个人待办', path: '/ticket/myToDo' },
      batchTodoGroup: { name: '我的待办', path: '/ticket/todoGroup' }
    }
    return (
      <Provider listStore={listStore}>
        <div className="batch-ticket">
          <PageHeader
            customizeBreadcrumb={[
              breadcrumbObj[paramsType],
              { name: i18n('batch-process', '批量处理') }
            ]}
          />
          <ContentLayout>
            <ErrorBoundary desc={i18n('loadFail')}>
              <BatchHeader
                showBatchBtn={showBatchBtn}
                filterType={this.props.match.params.type}
                selectedRows={selectedRows}
              />
              <TicketTable
                onRowSelectionChange={this.handleRowSelectionChange}
                getList={listStore.getBatchHandleTicketList}
                handlingTicketIdList={handlingTicketIdList}
              />
              {Boolean(count) && (
                <TicketPagination
                  pageSizeOptions={['10', '20', '50']}
                  getList={listStore.getBatchHandleTicketList}
                />
              )}
            </ErrorBoundary>
          </ContentLayout>
        </div>
      </Provider>
    )
  }
}

export default BatchTicket
