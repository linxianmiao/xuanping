import React, { Component } from 'react'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import Custom from './Custom'
import Outside from './Outside'
import Dictionary from './Dictionary'
import { getInitialValue } from './logic'
import classnames from 'classnames'

class ListSel extends Component {
  _render = () => {
    const { getFieldValue, field, type } = this.props
    const { code, params, tabStatus } = field
    const value = getFieldValue(code)

    if (tabStatus === '0' && (type === 'preview' || type === 'dataBase') && params && !value) {
      const finalValue = _.find(field.params, (d) => d.select)?.label
      return finalValue
    }

    if (!value || _.isEmpty(value)) {
      return '--'
    }

    // 判断下拉字段数据格式，为了兼容老数据
    if (Array.isArray(value)) {
      if (typeof value[0] === 'string') {
        return _.chain(params)
          .filter((item) => _.includes(value, `${item.value}`))
          .sortBy((item) => value.indexOf(`${item.value}`))
          .map((item) => item.label)
          .toString()
          .value()
      } else {
        return value.map((item) => item.label).join(',')
      }
    } else {
      if (typeof value === 'string') {
        const param = params.find((item) => `${item.value}` === value)
        return param ? param.label : ''
      } else {
        return value.label
      }
    }
  }

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

  renderReadOnly() {
    const { secrecy, type, disabled } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (type !== 'config' && disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      type,
      initialValue,
      fieldMinCol,
      containerId,
      formLayoutType
    } = this.props
    const { tabStatus } = field
    const selectProps = { disabled, field, containerId, type }
    let InitialValue = getInitialValue(initialValue, field)
    let finalValue = _.cloneDeep(InitialValue)
    if (tabStatus === '0' && type === 'dataBase') {
      //数据表 下拉设置了默认值
      let option = field.params
      if (field.isSingle === '0' && option && !InitialValue) {
        finalValue = _.find(option, (d) => d.select)?.value
      } else if (field.isSingle === '1' && option && !InitialValue) {
        finalValue = _.chain(option)
          .filter((d) => d.select)
          .map((d) => d.value)
          .value()
      }
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: finalValue,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(this.renderControl(tabStatus, selectProps))}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default ListSel
