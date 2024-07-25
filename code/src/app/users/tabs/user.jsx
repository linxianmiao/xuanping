import React, { Component } from 'react'
import { Button, Input } from '@uyun/components'
import UserList from './userList'
import SelectedList from './selectedList'

export default class User extends Component {
  // 选中当前项
    changeDataList = item => {
      this.props.changeDataList(item, 'user')
    }

    // 删除当前项
    handleDelItem = item => {
      this.props.handleDelItem(item, 'user')
    }

    // 全部添加
    handleAddAll = () => {
      this.props.handleAddAll('user')
    }

    // 全部移除
    handleRemoveAll = () => {
      this.props.handleRemoveAll('user')
    }

    // 搜索
    handleSearch = e => {
      this.props.handleSearch(e.target.value, 'user')
    }

    // 关闭搜索
    handleClearX = () => {
      this.props.handleClearX('user')
    }

    // 点击排序
    onHandleUp = () => {
      this.props.onHandleUp()
    }

    onHandleDown = () => {
      this.props.onHandleDown()
    }

    render () {
      const { filterUser, selectedData, clearX } = this.props
      return (
        <div>
          <div className="transfer-list" ref={inst => { this.transferList = inst }}>
            <div className="user-search">
              <i className="iconfont icon-sousuo" /> {clearX
                ? <i className="uyicon uyicon-cross-circle" onClick={this.handleClearX} />
                : null}
              <Input placeholder={i18n('input_keyword', '请输入关键字')} value={this.props.search} onChange={this.handleSearch} type="text" />
            </div>
            <div style={{
              position: 'relative'
            }}>
              <UserList
                dataList={filterUser}
                changeDataList={this.changeDataList}
                status={this.props.status}
                onHandleDown={this.onHandleDown}
                onHandleUp={this.onHandleUp}
                orderType={this.props.orderType}
                ressignAndCountersign={this.props.ressignAndCountersign || 0}
              />
            </div>
          </div>
          <div className="transfer-list">
            <SelectedList selectedData={selectedData} handleDelItem={this.handleDelItem} />
          </div>
          <div className="all-list">
            <Button type="primary" onClick={this.handleAddAll} disabled={this.props.opt === 1}>
              {i18n('user_group_add_all', '全部添加')}
            </Button>
            <Button type="primary" onClick={this.handleRemoveAll}>
              {i18n('user_group_remove_all', '全部移除')}
            </Button>
          </div>
        </div>
      )
    }
}
