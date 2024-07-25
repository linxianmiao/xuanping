import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import { Table, Row, Col, Progress, Form, Drawer } from '@uyun/components'
import Header from './Header'
import Status from '../components/Status'
import useTable from '~/hooks/useTable'
import { getSlaOverdueInfo, getSlaStatusName } from '~/logic/olaAndSla'
import { renderUnit } from '~/sla-list/common'
import { msToTimeAll, msToTime } from '~/ticket-list/others/component/common/util'
import moment from 'moment'
import styles from '../index.module.less'
const FormItem = Form.Item
const getList = async (params) => {
  const res = await axios.post(API.querySlaRecordList, params)
  return res
}

const SlaStatistics = ({ configAuthor }) => {
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [strategyEventCache, setStrategyEventCache] = useState({})
  const [logDetail, setLogDetail] = useState({ visible: false, errMes: '' })

  const { tableProps, paginationProps, filterProps } = useTable(getList, {
    totalKey: 'total',
    dataKey: 'list',
    currentKey: 'pageNum',
    pageSizeKey: 'pageSize',
    needFiltersCache: true,
    filterCacheName: 'SLA_STATISTICS_FILTERS'
  })

  const handleExpanded = (expanded, record) => {
    if (expanded && !record.strategyEvents) {
      const params = {
        id: record.id
      }
      axios.get(API.queryStrategyEventsByTicketId, { params }).then((res) => {
        setStrategyEventCache({
          ...strategyEventCache,
          [record.id]: Array.isArray(res) ? res : []
        })
      })
    }
  }

  const renderActionTypeName = (type) => {
    switch (type) {
      case 'SMS':
        return i18n('config.trigger.tip44', '短信')
      case 'SYS':
        return i18n('config.trigger.tip45', '站内信')
      case 'MAIL':
        return i18n('config.trigger.tip46', '邮件')
      case 'WECHAT':
        return i18n('config.trigger.tip47', '微信')
      case 'RESTFUL':
        return i18n('config.trigger.tip48', '调用RESTFUL接口')
      case 'TICKET':
        return i18n('config.trigger.tip49', '设置工单')
      case 'CHATOPS':
        return i18n('config.trigger.tip50', '发送ChatOps消息')
      case 'CREATETICKET':
        return i18n('config.trigger.tip51', '创建工单')
      case 'OTHERS':
        return i18n('config.trigger.tip52', '其他')
      default:
        return null
    }
  }

  const renderExpanded = (record) => {
    const { strategyEvents = [] } = record
    return strategyEvents.map((item, index) => {
      const { actualActionTime, color, actionTypes = [] } = item.strategyEventVO
      return (
        <Row key={index}>
          <Col span={4}>{moment(actualActionTime).format('YYYY-MM-DD HH:mm')}</Col>
          <Col span={20}>
            {actionTypes.map((type, idx) => {
              return (
                <div key={idx + ''} style={{ lineHeight: '32px' }}>
                  {type === 1 ? (
                    <>
                      <span style={{ paddingRight: 10 }}>
                        {i18n('sla_record_tip10', '标记工单颜色')}：
                      </span>
                      <Progress
                        style={{ width: 100 }}
                        percent={100}
                        showInfo={false}
                        strokeColor={color}
                      />
                    </>
                  ) : null}
                </div>
              )
            })}
            {item.triggerRecordVoList.map((item) => {
              const { actionType, executeStatus, userList, logDetail } = item
              return (
                <div className={styles.expandedRow}>
                  <Form layout="inline">
                    <FormItem label={renderActionTypeName(actionType)}>
                      <span
                        className={classnames('trigger-expanded-row-name', {
                          success: executeStatus === '1',
                          falure: executeStatus !== '1'
                        })}
                      >
                        {executeStatus === '1'
                          ? i18n('config.trigger.tip56', '执行成功')
                          : i18n('config.trigger.tip57', '执行失败')}
                      </span>
                      {actionType === 'RESTFUL' ? (
                        <a
                          style={{ marginLeft: 5 }}
                          href="javascript:;"
                          onClick={() => {
                            setLogDetail({ visible: true, errMes: logDetail })
                          }}
                        >
                          {i18n('config.trigger.tip58', '查看详情')}
                        </a>
                      ) : null}
                    </FormItem>
                    {userList && (
                      <FormItem label={i18n('config.trigger.tip59', '处理人')}>{userList}</FormItem>
                    )}
                  </Form>
                </div>
              )
            })}
          </Col>
        </Row>
      )
    })
  }

  const columns = [
    {
      title: i18n('ticket.list.ticketName', '工单标题'),
      dataIndex: 'title',
      // width: '10%',
      render: (title, record) => (
        <Link
          to={{
            pathname: `/ticket/detail/${record.ticketId}`,
            state: {
              fromHase: '/conf/sla/slaStatistics',
              fromName: i18n('layout.sla_manage', 'SLA管理')
            }
          }}
        >
          {title}
        </Link>
      )
    },
    {
      title: '工单号',
      dataIndex: 'flowNo'
    },
    {
      title: i18n('sla_ticket_type', '工单类型'),
      dataIndex: 'modelName'
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      render: getSlaStatusName
    },
    {
      title: '是否逾期',
      dataIndex: 'overdueStatus',
      render: (status) => <Status {...getSlaOverdueInfo(status)} />
    },
    {
      title: 'SLA策略',
      dataIndex: 'slaName'
    },
    {
      title: '约定时间',
      dataIndex: 'actualAgreedTime',
      render: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm') : '')
    },
    {
      title: i18n('start.time', '开始时间'),
      dataIndex: 'actualStartTime',
      render: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm') : '')
    },
    {
      title: i18n('end.time', '结束时间'),
      dataIndex: 'actualEndTime',
      render: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm') : '')
    },
    {
      title: i18n('ticket.sla.actualTime', '约定时长'),
      dataIndex: 'actualTime',
      render: (text, record) => {
        let txt = ''
        if (record.actualTimeUnit === 'DAYS') {
          txt = `${text}${renderUnit(record.actualTimeUnit)}`
        } else {
          txt = msToTimeAll(text)
        }
        return txt
      }
    },
    {
      title: i18n('ticket.sla.consumeTime', '实际耗时'),
      dataIndex: 'consumeTime',
      render: (text, record) => {
        let txt = ''
        if (record.actualTimeUnit === 'DAYS') {
          txt = `${text}${renderUnit(record.actualTimeUnit)}`
        } else {
          txt = msToTime(text)
        }
        return txt
      }
    }
  ]

  const data = tableProps.dataSource.map((item) => {
    if (strategyEventCache[item.id]) {
      item.strategyEvents = strategyEventCache[item.id]
    }
    return item
  })

  const onDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await axios.get(API.deleteSlaRecord, {
        params: { ids: selectedRowKeys.join(',') }
      })
      if (res) {
        filterProps.onSubmit()
        setSelectedRowKeys([])
      }
      setDeleteLoading(false)
    } catch (error) {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Header
        {...filterProps}
        configAuthor={configAuthor}
        selectedRowKeys={selectedRowKeys}
        deleteLoading={deleteLoading}
        onDelete={onDelete}
        list={tableProps.dataSource}
      />
      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        columns={columns}
        {...tableProps}
        dataSource={data}
        pagination={paginationProps}
        expandedRowRender={renderExpanded}
        onExpand={handleExpanded}
      />
      <Drawer
        title={i18n('config.trigger.tip61', '日志')}
        visible={logDetail.visible}
        onClose={() => setLogDetail({ visible: false, errMes: '' })}
      >
        {logDetail.errMes}
      </Drawer>
    </>
  )
}

export default SlaStatistics
