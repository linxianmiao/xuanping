import React, { Component } from 'react'
import { Checkbox } from '@uyun/components'

export default class Actions extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  constructor(props) {
    super(props)

    this.state = {
      indeterminate: false,
      /**
       * allSelectItem = {} 全选
       * actionItems = [] 动作项
       */
      ...this.getValueStateFromProps(props.value)
    }
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props

    if (value.length !== prevProps.value.length) {
      this.setState(this.getValueStateFromProps(value))
    }
  }

  // 后端返回的数据包括动作项和'全选'项
  // 这里将两者区分开，方便操作
  getValueStateFromProps = (value = []) => {
    const allSelectItem = value.find(item => item.actionCode === 'allSelect') || {}
    const actionItems = value.filter(item => item.actionCode !== 'allSelect')
    const { indeterminate } = this.getAllCheckStatus(actionItems)

    return {
      allSelectItem,
      actionItems,
      indeterminate
    }
  }
  
  getAllCheckStatus = (value = []) => {
    const checkedCount = value.reduce((count, cur) => count + (cur.flag ? 1 : 0), 0)

    return {
      indeterminate: checkedCount > 0 && checkedCount < value.length,
      checkedAll: checkedCount === value.length
    }
  }

  handleCheck = (e, actionCode) => {
    const checked = e.target.checked
    const { allSelectItem, actionItems } = this.state
    const nextActionItems = actionItems.slice()
    const item = nextActionItems.find(it => it.actionCode === actionCode)

    item.flag = checked ? 1 : 0

    const { checkedAll, indeterminate } = this.getAllCheckStatus(nextActionItems)
    const nextAllSelectItem = { ...allSelectItem, flag: checkedAll ? 1 : 0 }
    
    this.setState({
      allSelectItem: nextAllSelectItem,
      actionItems: nextActionItems,
      indeterminate
    })
    this.props.onChange(nextActionItems.concat(nextAllSelectItem))
  }

  handleCheckAll = e => {
    const checked = e.target.checked
    const { allSelectItem, actionItems } = this.state
    const nextAllSelectItem = { ...allSelectItem, flag: checked ? 1 : 0 }
    const nextActionItems = actionItems.slice()

    nextActionItems.forEach(item => item.flag = checked ? 1 : 0)

    this.setState({
      allSelectItem: nextAllSelectItem,
      actionItems: nextActionItems,
      indeterminate: false
    })
    this.props.onChange(nextActionItems.concat(nextAllSelectItem))
  }

  render() {
    const { indeterminate, allSelectItem, actionItems } = this.state

    return (
      <div>
        <Checkbox
          indeterminate={indeterminate}
          checked={!!allSelectItem.flag}
          onChange={this.handleCheckAll}
        >
          {allSelectItem.actionName}
        </Checkbox>
        {
          actionItems.map(item => {
            return (
              <div key={item.actionCode}>
                <Checkbox
                  checked={!!item.flag}
                  onChange={e => this.handleCheck(e, item.actionCode)}
                >
                  {item.actionName}
                </Checkbox>
              </div>
            )
          })
        }
      </div>
    )
  }
}
