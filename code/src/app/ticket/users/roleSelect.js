import React, { Component } from 'react'
import { Checkbox, Input } from '@uyun/components'
import LazyLoad from './lazyLoad'
class RoleSelect extends Component {
    // 改变人员得选中
    onChagneList = e => {
      if (e.target.checked) {
        this.props.setSelects(this.props.tab, [...this.props.selects, e.target.value])
      } else {
        this.props.setSelects(this.props.tab, _.filter(this.props.selects, select => select.id !== e.target.value.id))
      }
    }

    // 关键字 查找
    handleSearch = value => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], kw: value }, 'replace')
    }

    // 滚动加载
    handleLazyLoad = type => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], pageNo: ++query[tab].pageNo }, type)
    }

    render () {
      const { lists, selects, query, tab, count } = this.props
      const { kw } = query[tab]
      return (
        <div className="new-users-modal-section-wrap clearfix">
          <div className="user-search-warp clearfix">
            <Input
              value={kw}
              onChange={this.handleSearch}
              style={{ width: '160px' }}
              size="small"
              placeholder={i18n('globe.keywords', '请输入关键字')}
              prefix={<i className="iconfont icon-sousuo" />} />
          </div>
          <div className="user-lists-warp">
            <LazyLoad
              bottom={100}
              count={count}
              len={lists.length}
              classname="user-lists-inner clearfix"
              handleLazyLoad={this.handleLazyLoad}>
              {_.map(lists, item => {
                return (
                  <li className="user-item-wrap" key={item.id}>
                    <Checkbox
                      checked={!!_.find(selects, select => select.id === item.id)}
                      onChange={this.onChagneList} value={item}>{item.name}</Checkbox>
                  </li>
                )
              })}
            </LazyLoad>
          </div>
        </div>
      )
    }
}
export default RoleSelect
