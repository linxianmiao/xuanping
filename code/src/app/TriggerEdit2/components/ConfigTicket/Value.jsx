import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Input, Select, Cascader, TreeSelect } from '@uyun/components'
import ItsmUser from '~/components/triggerValueList/users'
import SimpEditor from '~/components/SimpEditor'
import SingleUser from '~/trigger/component/keyValue/singleUser'
import styles from './index.module.less'

const TextArea = Input.TextArea
const Option = Select.Option

@inject('triggerIndexStore')
@observer
class Value extends Component {
  static defaultProps = {
    field: {},
    value: undefined,
    onChange: () => {}
  }

  state = {
    inputType: 'password'
  }

  handleInputTypeChange = () => {
    this.setState(prveState => ({
      inputType: prveState.inputType === 'password' ? 'text' : 'password'
    }))
  }

  renderItem = () => {
    const { field, value, onChange, triggerIndexStore } = this.props
    const { inputType } = this.state
    const { id, code, type, isRequired, isSingle, params, cascade, treeVos, formatDate } = field
    const disabled = isRequired === 2

    switch (type) {
      case 'singleRowText':
      case 'flowNo':
        return (
          <Input
            disabled={disabled}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        )
      case 'multiRowText':
        return (
          <TextArea
            autosize={{ minRows: 2 }}
            disabled={disabled}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        )
      case 'securityCode':
        return (
          <div>
            <Input
              disabled={disabled}
              value={value}
              type={inputType}
              onChange={e => onChange(e.target.value)}
            />
            {
              inputType === 'password'
                ? <i onClick={this.handleInputTypeChange} className="icon-yinjianhui iconfont" />
                : <i onClick={this.handleInputTypeChange} className="icon-biyan iconfont" />
            }
          </div>
        )
      case 'listSel':
      case 'singleSel':
      case 'multiSel':
      case 'business':
        const mode = type === 'multiSel' || (type === 'listSel' && isSingle === '1')
          ? 'multiple'
          : ''
        return (
          <Select
            style={{ width: '100%' }}
            showSearch
            mode={mode}
            optionFilterProp="children"
            disabled={disabled}
            value={value || undefined}
            onChange={onChange}
          >
            {
              _.map(params, (param, i) => {
                return (
                  <Option key={id + i} value={'' + param.value}>
                    { param.label }
                  </Option>
                )
              })
            }
          </Select>
        )
      case 'cascader':
        return (
          <Cascader
            disabled={disabled}
            changeOnSelect
            placeholder={''}
            options={cascade}
            value={value}
            className="rule-cond-select"
            onChange={onChange}
          />
        )
      case 'treeSel':
        return (
          <TreeSelect
            placeholder={''}
            disabled={disabled}
            treeData={treeVos}
            allowClear
            multiple
            treeCheckable
            treeDefaultExpandAll
            dropdownMatchSelectWidth={false}
            className="rule-cond-select"
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            value={value}
            onChange={onChange}
          />
        )
      case 'int':
      case 'double':
        return (
          <Input
            disabled={disabled}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        )
      // case 'dateTimeInterval':
      //   return (
      //     <RangePicker
      //       disabled={disabled}
      //       showTime={formatDate ? false : true}
      //       format={formatDate ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"}
      //       value={value ? new Date(value) : new Date()}
      //       onChange={value => {
      //         console.log(value)
      //         onChange(value)
      //       }}
      //     />
      //   )
      case 'dateTime':
        return (
          <Select
            disabled={disabled}
            value={value || undefined}
            onChange={onChange}
          >
            <Option key={'${ticket.currentTime}'}>当前系统时间</Option>
          </Select>
        )
        // return (
        //   <DatePicker
        //     style={{ width: '100%' }}
        //     disabled={disabled}
        //     value={value === '' ? moment() : moment(value)}
        //     showTime={!formatDate}
        //     format={formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
        //     onChange={value => {
        //       const v = moment(value || new Date()).format(formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm')
        //       onChange(v)
        //     }}
        //   />
        // )
      case 'user':
        return (
          <ItsmUser
            type="user"
            disabled={disabled}
            value={value}
            handleChange={onChange}
          />
        )
      case 'singleUser':
        const { fieldUsers, variableUsers } = triggerIndexStore
        return (
          <SingleUser
            value={value}
            store={triggerIndexStore}
            onChangeCondition={onChange}
            fieldUsers={toJS(fieldUsers)}
            variableUsers={toJS(variableUsers)}
          />
        )
      case 'department':
        return (
          <ItsmUser
            type="department"
            disabled={disabled}
            value={value}
            onChangeCondition={onChange}
          />
        )
      case 'richText':
        return (
          <SimpEditor
            disabled={disabled}
            value={value}
            code={code}
            onChange={onChange}
          />
        )
      default:
        return (
          <Input
            disabled={disabled}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        )
    }
  }

  render() {
    return (
      <div className={styles.valueWrap}>
        {this.renderItem()}
      </div>
    )
  }
}

export default Value
