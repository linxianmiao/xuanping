import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input, Spin } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import Item from './item'

@inject('formSetGridStore')
@observer
class List extends Component {
  static contextTypes = {
    scene: PropTypes.string // 当前的场景，如果是子表单，字段要分页加载
  }

  state = {
    value: '',
    pageNo: 1,
    loading: false,
    fieldList: []
  }

  pageNo = 1
  pageSize = 50
  hasMore = true

  componentDidMount() {
    if (this.context.scene === 'formManagement') {
      this.queryFieldList(this.pageNo)

      const wrap = document.getElementById('formset-field-wrap')

      wrap.addEventListener('scroll', this.handleWrapScroll)
    }
  }

  componentWillMount() {
    if (this.context.scene === 'formManagement') {
      const wrap = document.getElementById('formset-field-wrap')

      if (wrap) {
        wrap.removeEventListener('scroll', this.handleWrapScroll)
      }
    }
    this.pageNo = 1
    this.hasMore = true
  }

  handleWrapScroll = (e) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (isBottom && !this.state.loading && this.hasMore) {
      this.pageNo = this.pageNo + 1
      this.queryFieldList(this.pageNo)
    }
  }

  queryFieldList = async (pageNo) => {
    const { value, fieldList } = this.state
    const params = {
      wd: value,
      pageNo,
      pageSize: this.pageSize,
      scope: 0
    }

    this.setState({ loading: true })

    const res = (await axios.get(API.list_field_With_page, { params })) || []
    const list = pageNo === 1 ? res.list : [...fieldList, ...res.list]

    this.setState({ loading: false, fieldList: list })
    this.hasMore = list.length < res.total
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value })
  }

  render() {
    const { currentGrid, type } = this.props.formSetGridStore
    const { value, loading } = this.state
    const { scene } = this.context
    const isInFormManagement = scene === 'formManagement'
    const fieldList = isInFormManagement
      ? this.state.fieldList
      : this.props.formSetGridStore.fieldList
    const { formLayoutType } = currentGrid
    return (
      <div className="itsm-form-set-formLayoutVos-drag-field">
        <Input.Search
          value={value}
          enterButton
          placeholder={i18n('globe.keywords', '请输入关键字')}
          onChange={this.handleChange}
          onSearch={() => {
            if (isInFormManagement) {
              this.pageNo = 1
              this.queryFieldList(this.pageNo)
            }
          }}
        />
        <Spin spinning={loading}>
          <ul className="field-list">
            {_.map(fieldList, (item) => {
              const { code, name } = item
              let canDrag = !_.some(currentGrid.fieldList, (field) => field.code === code)
              if (type === 'template') {
                canDrag = canDrag ? code !== 'title' : canDrag
              }
              const isShow = value && !isInFormManagement ? name.indexOf(value) !== -1 : true
              return isShow ? (
                <Item
                  key={item.code}
                  item={item}
                  canDrag={canDrag}
                  formLayoutType={formLayoutType}
                />
              ) : null
            })}
          </ul>
        </Spin>
      </div>
    )
  }
}
export default List
