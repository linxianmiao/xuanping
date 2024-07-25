import React, { Component } from 'react'
import { Form } from '@uyun/components'
import Custom from './Custom'
import Outside from './Outside'
import Dictionary from './Dictionary'

const FormItem = Form.Item

export default class ItsmSelect extends Component {
  renderControl = (tabStatus, props) => {
    switch (tabStatus) {
      case '0':
        return <Custom {...props} />
      case '1':
        return <Outside {...props} />
      case '2':
        return <Dictionary {...props} />
      default:
        return null
    }
  }

  render() {
    let {
      formItemLayout,
      item,
      getFieldDecorator,
      defaultValue,
      size = 'default',
      filterType,
      getPopupContainer,
      disabled,
      label,
      noLabel = false,
      handleChange = () => {}
    } = this.props

    if (item.code === 'overdue') {
      if (_.isString(defaultValue)) {
        defaultValue = [Number(defaultValue)]
      } else if (_.isArray(defaultValue)) {
        defaultValue = _.map(defaultValue, (item) => Number(item))
      }
    }

    const finalDisabled =
      disabled ||
      (item.code === 'status' && (filterType === 'myToDo' || filterType === 'groupTodo'))

    const selectProps = {
      disabled: finalDisabled,
      size,
      getPopupContainer,
      field: item,
      handleChange,
      noLabel,
      code: item.code
    }

    return (
      <FormItem label={noLabel ? '' : label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || []
        })(this.renderControl(item.tabStatus, selectProps))}
      </FormItem>
    )
  }
}
