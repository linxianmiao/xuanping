import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Checkbox, Radio } from '@uyun/components'
import Search from './search'
import LazyLoad from './lazyLoad'
@observer
class UserSelect extends Component {
  // 关键字 查找
    handleSearch = (value, type) => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], pageNo: 1, [type]: value })
    }

    // 改变人员得选中
    onChagneList = e => {
      if (e.target.checked) {
        this.props.setSelects(this.props.tab, [...this.props.selects, e.target.value])
      } else {
        this.props.setSelects(this.props.tab, _.filter(this.props.selects, select => select.id !== e.target.value.id))
      }
    }

    onChagneRadio = e => {
      if (e.target.checked) {
        this.props.setSelects(this.props.tab, [e.target.value])
      } else {
        this.props.setSelects(this.props.tab, [])
      }
    }

    // 滚动加载
    handleLazyLoad = type => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], pageNo: ++query[tab].pageNo }, type)
    }

    // 升序降序       orderType=== 1 升序   orderType=== 0 降序
    handleOrderType = orderType => {
      const id = document.getElementById('lazy-load-ul')
      id.scrollTop = 0
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], pageNo: 1, orderType }, 'replace')
    }

    render () {
      const { lists, selects, tab, query, isLoad, selectsType, groupSelectUserList, departSelectUsertList } = this.props
      const { kw, groupId, departId } = query[tab]
      const selectType = selectsType[tab]
      return (
        <div className="new-users-modal-section-wrap clearfix">
          <Search
            kw={kw}
            tab={tab}
            handleSearch={this.handleSearch}
            groupSelectUserList={groupSelectUserList}
            departSelectUsertList={departSelectUsertList}
            groupId={groupId}
            departId={departId} />
          <div className="user-lists-warp">
            <LazyLoad
              bottom={100}
              isLoad={isLoad}
              len={lists.length}
              handleLazyLoad={this.handleLazyLoad}
              className="user-lists-inner clearfix">
              {_.map(lists, item => {
                return (
                  <li className={classnames('user-item-wrap', {
                    'user-select-list': tab === '1'
                  })} key={item.id}>
                    {selectType === 'radio' ? <Radio
                      checked={!!_.find(selects, select => select.id === item.id)}
                      onChange={this.onChagneRadio} value={item}>
                      {item.name}
                      { (tab === '1' && (item.userDepartment || item.mail)) &&
                      <p>{`${item.userDepartment || ''} ${item.userDepartment ? '/' : ''}${item.mail || i18n('new.user.mail', '未登记邮箱')}`}</p>}
                    </Radio> : <Checkbox
                      checked={!!_.find(selects, select => select.id === item.id)}
                      onChange={this.onChagneList} value={item}>
                      <div>
                        {item.name}
                        { (tab === '1' && (item.userDepartment || item.mail)) &&
                        <p>{`${item.userDepartment || ''} ${item.userDepartment ? '/' : ''}${item.mail || i18n('new.user.mail', '未登记邮箱')}`}</p>}
                      </div>
                    </Checkbox>}
                  </li>
                )
              })}
            </LazyLoad>
          </div>
        </div>
      )
    }
}
UserSelect.propTypes = {
  lists: PropTypes.array.isRequired,
  selects: PropTypes.array.isRequired,
  tab: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  setSelects: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired
}
export default UserSelect
