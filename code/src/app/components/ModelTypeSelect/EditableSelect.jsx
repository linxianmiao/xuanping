import React from 'react'
import { message } from '@uyun/components'
import Select from '~/components/editableSelect'

class ModelTypeEditableSelect extends React.Component {
  state = {
    data: [],
    editKey: undefined,
    loading: false,
    moreLoading: false,
    hasMore: false
  }

  conditions = {
    page_num: 1,
    page_size: 15
  }

  total = 0

  query = conditions => {
    this.setState({ moreLoading: true })
    axios.get(API.queryDictionaryData('model_type'), { params: conditions }).then(res => {
      this.conditions.pageNum = res.pageNum
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
    if (visible && this.state.data.length === 0) {
      this.query(this.conditions)
    }
    if (!visible) {
      this.setState({ editKey: undefined })
    }
  }

  handleLoadMore = () => {
    this.conditions.pageNum = this.conditions.pageNum + 1
    this.query(this.conditions)
  }

  handleEdit = item => {
    this.setState({ loading: true })

    const url = item.id ? API.updateModelType : API.createModelType
    axios.post(url, item).then(id => {
      this.setState({ loading: false })
      if (id) {
        message.success(i18n('save_success'))
        this.setState({ editKey: undefined })
        this.conditions.pageNum = 1
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
    axios.post(`${API.deleteModelType}/${item.id}`).then(res => {
      if (res === '200') {
        message.success(i18n('delete_success'))
        this.setState({ editKey: undefined, loading: false })
        this.conditions.pageNum = 1
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
        placeholder={i18n('pls_select_modelType')}
        style={style}
        data={data}
        value={value}
        editKey={editKey}
        loading={loading}
        moreLoading={moreLoading}
        hasMore={hasMore}
        loadMore={this.handleLoadMore}
        canDelete={item => !item.modelTotal || item.modelTotal === 0}
        cannotDeleteTitle={i18n('related.type.cannot.delete')}
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

export default ModelTypeEditableSelect
