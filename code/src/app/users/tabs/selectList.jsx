import React, { Component } from 'react'
import { message, Checkbox } from '@uyun/components'

export default class SelectList extends Component {
  // 点击每行列表
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
        axios.post(API.USER_IN_TASK, ressignData).then(data => {
          if (data) {
            message.warning('该用户在本环节有未处理任务')
          } else {
            this.props.changeDataList(item)
          }
        })
      } else {
        this.props.changeDataList(item)
      }
    }

    handleEnterItem = item => {
    // 当只能选择用户组时，禁止向下查找组内用户
      if (this.props.type === 'userGroup') {
        return
      }
      if (item.selected) {
        return false
      }
      this.props.handleEnterItem(item)
    }

    render () {
      const { dataList } = this.props
      const { status1, status2, status3 } = this.props.status
      // 如果 人员 不能选 就 删除掉
      if (status3 === 1) {
        dataList.map((item, index) => {
          if (item.userName || item.realname) {
            delete dataList[index]
          }
        })
      }
      // log("dataList", dataList)
      return (
        <ul className="item-list">
          {!_.isEmpty(dataList) && dataList.map((item, index) => {
            return (
              <li key={index} className={
                item.userId && !item.selected
                  ? 'item_li'
                  : item.userId && item.selected
                    ? 'item_li selected'
                    : 'item_li bumen_item_li'
              }
              >
                {/* 部门 和 组 显示 选择框 */}
                {
                  (item.id && status1 !== 1) || (item.groupId && status2 !== 1)
                    ?
                  // 只有 部门和 组 才有 选择框
                    <Checkbox
                        disabled={
                        !!(item.selected && item.id) // 部门 如果 选中 或 警用 的条件下 不能选择
                    ||
                    !!(item.selected && item.groupId) // 组 如果 选中 或 警用 的条件下 不能选择
                    ||
                    item.opt === 1 // 单选 时 也不能选择
                      }
                        className="bumenCheck"
                        checked={!!item.selected}
                        onClick={this.handleItem.bind(this, item)}
                    />
                    : null
                }
                {/* 部门 和 组 点击可以下钻， 人员 点击 直接选中 */}
                {
                  item.userId
                    ? <div
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
                      <i className="uyicon uyicon-check" />
                    </div>
                    : <div
                      className={
                        item.selected
                          ? 'item_bumen_name disabled'
                          : 'item_bumen_name'
                      }
                      onClick={this.handleEnterItem.bind(this, item)}
                    >
                      <span className="name">
                        {
                          item.name
                            ? item.name
                            : item.groupName
                        }
                      </span>
                    </div>
                }
              </li>
            )
          })
          }
        </ul>
      )
    }
}
