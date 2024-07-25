import React, { Component } from 'react'
import { Input, Breadcrumb, Button } from '@uyun/components'
import SelectList from './selectList'
import SelectedList from './selectedList'

export default class Organization extends Component {
  // 选中当前项
    changeDataList = item => {
      this.props.changeDataList(item, 'org')
    }

    // 删除当前项
    handleDelItem = item => {
      this.props.handleDelItem(item, 'org')
    }

    // 点击下一级
    handleEnterItem = item => {
      this.props.handleEnterItem(item, 'org')
    }

    // 点击面包屑
    handleCrumb = (id, index) => {
      if (index === this.props.crumbOrg.length - 1) {
        return false
      }
      this.props.handleCrumb(id, index, 'org')
    }

    // 全部添加
    handleAddAll = () => {
      this.props.handleAddAll('org')
    }

    // 全部移除
    handleRemoveAll = () => {
      this.props.handleRemoveAll('org')
    }

    // 搜索
    handleSearch = e => {
      this.props.handleSearch(e.target.value, 'org')
    }

    // 关闭搜索
    handleClearX = () => {
      this.props.handleClearX('org')
    }

    render () {
    // const clearX = true;
      const { orgData, selectedData, crumbOrg, clearX } = this.props
      return (
        <div>
          <div className="transfer-list">
            <div className="user-search">
              <i className="iconfont icon-sousuo" /> {clearX
                ? <i className="uyicon uyicon-cross-circle" onClick={this.handleClearX} />
                : null}
              <Input placeholder={i18n('input_keyword', '请输入关键字')} value={this.props.search} onChange={this.handleSearch} type="text" />
            </div>
            <div style={{
              position: 'relative'
            }}>
              {!_.isEmpty(crumbOrg) ? <div className="group-crumb">
                <Breadcrumb>
                  {crumbOrg.map((item, index) => {
                    return (
                      <Breadcrumb.Item key={index} onClick={this.handleCrumb.bind(this, item.id, index)}>{item.name}</Breadcrumb.Item>
                    )
                  })}
                </Breadcrumb>
              </div> : null}
              <SelectList dataList={orgData} changeDataList={this.changeDataList} handleEnterItem={this.handleEnterItem} status={this.props.status} ressignAndCountersign={this.props.ressignAndCountersign || 0} />
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
