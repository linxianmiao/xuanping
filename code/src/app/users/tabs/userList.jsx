import React, { Component } from 'react'
import { message } from '@uyun/components'

export default class UserList extends Component {
    handleItem = item => {
      const { status1, status2, status3 } = this.props.status
      if (item.opt === 1 ||
      (item.id && status1 === 1) ||
    (item.groupId && status2 === 1) ||
    (item.userId && status3 === 1) ||
    item.disabled === 1) {
        return false
      }
      if (item.selected) {
        return false
      }
      if (this.props.ressignAndCountersign === 1) {
        const parameter = {}
        const ressignData = this.state.ressignData
        parameter.ticketId = ressignData.ticketId
        parameter.tacheType = ressignData.tacheType
        parameter.tacheId = ressignData.tacheId
        parameter.userId = item.userId
        // 会签改派时校验用户是否有处理中的任务
        axios.get(API.user_in_task, ressignData).then(data => {
          if (data) {
            message.warning(i18n('has_unprocessed_tasks', '该用户在本环节有未处理任务'))
          } else {
            this.props.changeDataList(item)
          }
        })
      } else {
        this.props.changeDataList(item)
      }
    }

    // 点击 待办数 的 排序
    onHandleDown = () => {
      this.props.onHandleDown()
    }

    onHandleUp = () => {
      this.props.onHandleUp()
    }

    render () {
      const { dataList, orderType } = this.props
      const { status3 } = this.props.status
      return (
        <div>
          <div className="item-title">
            <span className="item-title-left">{i18n('assignee', '处理人')}</span>
            <span className="item-title-right">{i18n('pending_tick', '待办工单')}</span>
            <i className={orderType === 1 ? 'uyicon uyicon-caret-up up' : 'uyicon uyicon-caret-up'} title="↑" onClick={this.onHandleUp} />
            <i className={orderType === 0 ? 'uyicon uyicon-caret-down down' : 'uyicon uyicon-caret-down'} title="↓" onClick={this.onHandleDown} />
          </div>
          <ul className="item-list user-item-list">
            {!_.isEmpty(dataList) && dataList.map((item, index) => {
              return (
                <li key={index} className={
                  item.userId && item.selected
                    ? 'item_li selected'
                    : 'item_li'
                }
                >
                  <div
                    className={
                      item.selected // 人员选中了 不能再选
                      ||
                      item.opt === 1 // 单选是 不能再选
                      ||
                      (item.userId && status3 === 1) // 人员警用 不能再选
                      ||
                      item.disabled === 1 // 非指定人员 不能选
                        ? 'item_name disabled'
                        : 'item_name'
                    }
                    onClick={this.handleItem.bind(this, item)}
                  >
                    <span className="name">
                      {
                        item.userName
                          ? item.userName
                          : item.realname
                      }
                    </span>
                    <span className="num">
                      {item.ticketNum}
                    </span>
                    <i className="uyicon uyicon-check" />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )
    }
}
