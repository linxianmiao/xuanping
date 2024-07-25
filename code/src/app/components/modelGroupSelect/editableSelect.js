/**
 * 模型分组 可编辑的选择组件
 */
import React, { Component } from 'react'
import { message } from '@uyun/components'
import Select from '~/components/editableSelect'

class ModelGroupEditableSelect extends Component {
  static defaultProps = {
    clearOnClose: false,
    style: undefined,
    value: undefined,
    onChange: () => {}
  }

  state = {
    data: [],
    editKey: undefined,
    loading: false,
    moreLoading: false,
    hasMore: false
  }

  conditions = {
    pageNo: 1,
    pageSize: 15,
    source: 'model_management'
  }

  total = 0

  query = conditions => {
    this.setState({ moreLoading: true })
    axios.get(API.query_layouts, { params: conditions }).then(res => {
      this.conditions.pageNo = res.pageNum
      this.total = res.total

      const data = (res.pageNum > 1 ? this.state.data : []).concat(res.list || [])
      const hasMore = data.length < res.total
      this.setState({
        data,
        moreLoading: false,
        hasMore
      })
    })
  }

  handleVisibleChange = visible => {
    const { clearOnClose } = this.props
    const { data } = this.state

    if (visible && (data.length === 0 || clearOnClose)) {
      if (clearOnClose) {
        this.conditions.pageNo = 1
        this.setState({ data: [] })
      }

      this.query(this.conditions)
    }
    if (!visible) {
      this.setState({ editKey: undefined })
    }
  }

  handleLoadMore = () => {
    this.conditions.pageNo = this.conditions.pageNo + 1
    this.query(this.conditions)
  }

  handleEdit = async item => {
    this.setState({ loading: true })

    const url = item.id ? API.update_model_layouts : API.save_model_layouts
    axios.post(url, item).then(id => {
      this.setState({ loading: false })
      if (id) {
        message.success(i18n('save_success'))
        this.setState({ editKey: undefined })
        this.conditions.pageNo = 1
        this.query(this.conditions)

        // 当修改项就是当前选中项时
        const { value } = this.props
        if (value && value.id === item.id) {
          this.props.onChange(item)
        }
      }
    })
  }

  handleDelete = item => {
    this.setState({ loading: true })
    axios.post(`${API.delete_model_layout}/${item.id}`).then(res => {
      if (res === '200') {
        message.success(i18n('delete_success'))
        this.setState({ editKey: undefined, loading: false })
        this.conditions.pageNo = 1
        this.query(this.conditions)

        // 如果删除的项就是当前选中的项
        const { value, onChange } = this.props
        if (value && value.id === item.id) {
          onChange(undefined)
        }
      }
    })
  }

  render() {
    const { style, value, onChange } = this.props
    const { data, editKey, loading, moreLoading, hasMore } = this.state
    return (
      <Select
        style={style}
        placeholder={i18n('pls_select_model_group')}
        data={data}
        value={value}
        editKey={editKey}
        loading={loading}
        moreLoading={moreLoading}
        hasMore={hasMore}
        loadMore={this.handleLoadMore}
        canDelete={item => !item.modelTotal || item.modelTotal === 0}
        cannotDeleteTitle={i18n('related.group.cannot.delete')}
        onVisibleChange={this.handleVisibleChange}
        onEditKeyChange={key => this.setState({ editKey: key })}
        onSelect={onChange}
        onAdd={this.handleEdit}
        onEdit={this.handleEdit}
        onDelete={this.handleDelete}
      />
    )
  }
}
export default ModelGroupEditableSelect