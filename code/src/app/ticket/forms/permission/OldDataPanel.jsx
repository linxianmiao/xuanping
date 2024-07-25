import React, { useMemo } from 'react'
import moment from 'moment'
import { Table } from '@uyun/components'

/**
 * 兼容老数据
 * 加入和退出的用户组
 */
const OldDataPanel = ({
  groups = []
}) => {
  const columns = useMemo(() => [{
    title: i18n('user_group'),
    dataIndex: 'relatedGroups',
    render: relatedGroups => relatedGroups ? relatedGroups[0].name : ''
  }, {
    title: i18n('permission-application-type', '申请类型'),
    dataIndex: 'type',
    render: value => (
      <p>{value === 4 ? i18n('apply-for-exit', '申请退出') : i18n('apply-to-join', '申请加入')}</p>
    )
  }, {
    title: i18n('job-status'),
    dataIndex: 'status',
    render: (value, record) => {
      let title = i18n('permission-to-submit', '待提交')
      if (value === 1) {
        title = i18n('permission-to-approval', '待审批')
      } else if (value === 2) {
        title = i18n('permission-effective', '已生效')
      } else if (value === 3) {
        title = i18n('permission-dismissed', '已驳回')
      }
      return <p>{title}</p>
    }
  }, {
    title: i18n('permission-applicant', '申请人'),
    dataIndex: 'creator'
  }, {
    title: i18n('permission-application-time', '申请时间'),
    dataIndex: 'createTime',
    render: text => text ? moment(text).utc(moment(text).zone()).format('YYYY/MM/DD HH:mm') : '--'
  }], [])

  return (
    <Table
      rowKey="rowId"
      columns={columns}
      dataSource={groups}
    />
  )
}

export default OldDataPanel
