import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { message } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'

@inject('modelListStore')
@observer
class LazyTags extends Component {
  getList = async (query, callback) => {
    const res = await this.props.modelListStore.queryTags(_.assign({}, query, { type: 'model' }))
    const list = _.map(res, item => ({ name: item.name, id: item.name }))
    callback(list)
  }

  onChange = (value) => {
    if (value && value.length > 5) {
      message.warning(i18n('model-add-tags-warn-tip1', '最多添加{number}个标签'), { number: 5 })
      return false
    }
    this.props.onChange(value)
  }

  render () {
    const { value } = this.props
    return (
      <LazySelect
        mode="tags"
        value={value}
        labelInValue={false}
        onChange={this.onChange}
        getList={this.getList}
        placeholder={i18n('pls_select_tags', '请输入标签')}
      />
    )
  }
}

export default LazyTags