import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Drawer, message } from '@uyun/components'
import axios from 'axios'

import Condition from './condition'
import TableList from './table'
import { flatTicketList } from './logic'

import styles from './index.module.less'

const instance = axios.create()

const DEFAULT_PAGE_SIZE = 20
const DETAIL_MODE_DRAWER = 'drawer'
const FILTER_TYPE_TODO = 'todo'
const MYPARTIN = 'myPartIn'
const FILTER_TYPE_TODOGROUP = 'todoGroup'
const CURRENTGROUP = 'currentGroup'
const CURRENTUSER = 'currentUser'
const CREATE_TIME = 'creatorTime'
const DESCEND = 'descend'
const STATUS = ['1', '2', '10']
const ALL_TICKET_API = '/itsm/api/v2/ticket/getAllTicket'
const ALL_TICKET_COUNT_API = '/itsm/api/v2/ticket/getAllTicket/count'
const INVOLVED_TICKET_API = '/itsm/api/v2/ticket/getTicketList'
const initPagination = {
  current: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  pageSizeOptions: ['10', '15', '20', '50', '100'],
  showQuickJumper: true,
  showSizeChanger: true
}
const initQuery = {
  pageSize: DEFAULT_PAGE_SIZE,
  pageNum: 1,
  filterType: FILTER_TYPE_TODO,
  orderBy: CREATE_TIME,
  sortRule: DESCEND
}

const setDefaultQuery = ({ filterType, pageSize }) => {
  const query = { ...initQuery, filterType, pageSize }
  // 组内待办
  if (filterType === FILTER_TYPE_TODOGROUP) {
    query.filterType = FILTER_TYPE_TODO
    // 查找当前组
    query.executionGroup = [CURRENTGROUP]
    query.status = STATUS
  }
  // 个人待办
  if (filterType === FILTER_TYPE_TODO) {
    query.executor = [CURRENTUSER]
    query.status = STATUS
  }
  return query
}

const getRequestConfig = (type, data, appkey) => {
  if (type === MYPARTIN) {
    return {
      url: `${INVOLVED_TICKET_API}?appkey=${appkey}`,
      method: 'get',
      params: data
    }
  } else {
    return {
      data,
      url: `${ALL_TICKET_API}?appkey=${appkey}`,
      method: 'post'
    }
  }
}

function TicketList(props) {
  const { filterType, pageSize, appkey } = props
  const [dataSource, setDataSource] = useState([])
  const [query, setQuery] = useState(setDefaultQuery({ filterType, pageSize }))
  const [pagination, setpagination] = useState(initPagination)
  const [loading, setLoading] = useState(false)
  const refDrawer = useRef(null)
  const mountedRef = useRef(false)
  const getList = () => {
    if (!/^[A-Za-z0-9]{32}$/.exec(appkey)) {
      return false
    }
    setLoading(true)
    instance
      .request(getRequestConfig(filterType, query, appkey))
      .then((res) => {
        if (res && res.status === 200) {
          if (filterType === MYPARTIN) {
            setpagination({
              ...pagination,
              pageSize: query.pageSize,
              current: query.pageNum,
              total: res.data.data.count
            })
          } else {
            instance
              .request({
                data: query,
                url: `${ALL_TICKET_COUNT_API}?appkey=${appkey}`,
                method: 'post'
              })
              .then((count) => {
                setpagination({
                  ...pagination,
                  pageSize: query.pageSize,
                  current: query.pageNum,
                  total: (!isNaN(count.data.data) && count.data.data) || 0
                })
              })
          }
          setLoading(false)
          setDataSource(flatTicketList([].concat(res.data.data.list || [])))
        }
      })
      .catch((error) => {
        if (error.response) {
          const { status } = error.response
          if (status === 401) {
            message.error('当前应用无权限访问，请联系管理员检查AppKey配置')
          } else {
            message.error('系统错误')
          }
        }
        setLoading(false)
      })
  }

  const itsmPostMessage = (res, refDrawer) => {
    if (res.data && res.data.createTicket === 'success') {
      if (refDrawer && refDrawer.current) {
        refDrawer.current.close()
        getList()
      }
    }
  }

  useEffect(() => {
    return () => window.removeEventListener('message', (res) => itsmPostMessage(res))
  }, [])

  useEffect(() => {
    getList()
  }, [])

  useEffect(() => {
    if (mountedRef.current) {
      getList()
    }
    if (!mountedRef.current) {
      mountedRef.current = true
    }
    window.addEventListener('message', (res) => itsmPostMessage(res, refDrawer))
  }, [query, appkey])

  const onChangeTable = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const { columnKey, order } = sorter
    setQuery({
      ...query,
      pageSize,
      pageNum: current,
      orderBy: columnKey || CREATE_TIME,
      sortRule: order || DESCEND
    })
  }

  const handleTitle = ({ ticketId, ticketName }) => {
    const { openDetailMode, appkey } = props
    const src = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=lowcode&hideHeader=1&hideHead=1&hideMenu=1&appkey=${appkey}`
    if (openDetailMode === DETAIL_MODE_DRAWER) {
      refDrawer.current = Drawer.open({
        title: ticketName,
        content: (
          <iframe
            src={src}
            id="iframeId"
            width="100%"
            height="100%"
            allowFullScreen="allowfullscreen"
            scrolling="yes"
            frameBorder={0}
          />
        )
      })
    } else {
      window.open(src, '_blank')
    }
  }
  return (
    <div className={styles.ticketList}>
      <Condition query={query} onChange={(query) => setQuery(query)} />
      <TableList
        dataSource={dataSource}
        onChange={onChangeTable}
        pagination={pagination}
        loading={loading}
        handleTitle={handleTitle}
      />
    </div>
  )
}

TicketList.propTypes = {
  appkey: PropTypes.string,
  filterType: PropTypes.string,
  pageSize: PropTypes.number,
  openDetailMode: PropTypes.string
}

TicketList.defaultProps = {
  appkey: '',
  filterType: FILTER_TYPE_TODO,
  pageSize: DEFAULT_PAGE_SIZE,
  openDetailMode: DETAIL_MODE_DRAWER
}

export default TicketList
