import React, { Component } from 'react'
import classnames from 'classnames'
import UserPicker from '~/components/userPicker'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'

class UserGroupWrap extends Component {
  // list 存在两种值 [string]   |   [{id: '' , name:'' , type: 1}]
  // [string] 为脚本设置值的时候存在的一刹那，具体可看 handleChangeList 注释
  state = {
    list: []
  }

  componentDidMount() {
    this.handleChangeList(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.value, nextProps.value)) {
      this.handleChangeList(nextProps)
    }
  }

  // 父组件value变化的时候重新 setState list，保证list和value数据保持一致
  // 如果是组件选择新的人员的话，list已经是最新的了，所以不用重新setState
  // 第一次进入的时候，如果设置有初始值，后端放在 formUserAndDepartFieldValues 字段里，从该字段获取最新信息，不用发送请求
  // 如果是脚本设置值的时候在 formUserAndDepartFieldValues 里找不到，则直接把 value 【string】格式 设置为list
  handleChangeList(props) {
    const { value, formUserAndDepartFieldValues = [] } = props
    const prevIds = _.compact(_.map(this.state.list, (item) => (item ? item.id : undefined)))

    // 判定当前的list是否和最新的value保持一致，一致的话不用重新setState
    if (_.xor(prevIds, value).length === 0) {
      return false
    }

    const list = _.map(value, (id) =>
      formUserAndDepartFieldValues.find((item) => item.id === id)
    ).filter(Boolean)
    // const list = _.filter(formUserAndDepartFieldValues, item => _.includes(value, item.id))
    const ids = _.compact(_.map(list, (item) => (item ? item.id : undefined)))

    // 判断经过处理之后的list是否和value保持一致，一致则设置list 为  [{id: '' , name:'' , type: 1}]
    // 不一致的话需将 value直接设置为list，组件会获取详情信息
    if (_.xor(ids, value).length === 0) {
      this.setState({ list })
    } else {
      this.setState({ list: value })
    }
  }

  onChange = (value) => {
    this.setState({ list: value }, () => {
      this.props.onChange(_.map(value, (item) => item.id))
    })
  }

  render() {
    const { value, onChange, formUserAndDepartFieldValues, ...rest } = this.props
    const { list } = this.state
    return (
      <UserPicker
        {...rest}
        value={list}
        onChange={this.onChange}
        mode={this.props.mode}
        showTypes={this.props.showTypes}
        modalTitle={'用户组选择'}
      />
    )
  }
}

export default class UserGroup extends Component {
  render() {
    const {
      field,
      fieldMinCol,
      getFieldDecorator,
      disabled,
      initialValue,
      popupContainerId,
      forms,
      secrecy,
      formLayoutType
    } = this.props
    let InitialValue = initialValue

    if (window.location.href.indexOf('database') !== -1) {
      if (!_.isEmpty(InitialValue) && !Array.isArray(InitialValue)) {
        InitialValue = JSON.parse(InitialValue)
      }
    }

    const { formUserAndDepartFieldValues } = forms || {}
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: _.compact(InitialValue) || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <UserGroupWrap
              id={field.code}
              selectionType={field.isSingle === '0' ? 'radio' : 'checkbox'}
              popupContainerId={popupContainerId}
              disabled={disabled}
              isRequired={field.isRequired}
              formUserAndDepartFieldValues={formUserAndDepartFieldValues}
              tabs={[0]}
              showTypes={['groups']}
              mode={field.userAndGroupMode === 'default' ? 'select' : ''}
            />
          )
        )}
      </FormItem>
    )
  }
}
