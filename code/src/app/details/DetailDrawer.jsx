import React from 'react'
import { Route } from 'react-router-dom'
import { Drawer } from '@uyun/components'
import Detail from './index'
import TicketStore from '~/ticket-list/stores/ticketStore'

/**
 * 工单详情侧滑框
 * @param {RouteProps} detailRoute 路由信息，用于查询工单详情，该对象中必须包含 location.search match.params.id
 */
const DetailDrawer = ({ visible = false, title = '', detailRoute = null, onClose = () => {} }) => {
  return (
    <Drawer
      visible={visible}
      title={title}
      //   bodyStyle={{ overflow: 'hidden' }}
      outerClose={false}
      destroyOnClose
      onClose={onClose}
    >
      <Route
        render={(routeProps) => {
          if (!detailRoute) {
            return null
          }
          const { location, match } = detailRoute
          routeProps.location = location
          routeProps.match = match
          // 给Detail传一个新的ticketStore，不污染外部的ticketStore
          return (
            <Detail
              {...routeProps}
              inContainer
              ticketStore={new TicketStore()}
              afterSubmitAction={onClose}
            />
          )
        }}
      />
    </Drawer>
  )
}

export default DetailDrawer
