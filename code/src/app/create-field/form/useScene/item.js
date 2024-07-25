import React, { Component } from 'react'
import { Input, Checkbox, Tooltip } from '@uyun/components'
export default class UseSceneItem extends Component {
  constructor(props) {
    super(props)
    const { value } = props
    const { params } = props.item
    const visible = _.filter(params, item => {
      if (value[item.value].value) {
        return item.value
      }
    }).map(item => item.value)
    this.state = {
      visible
    }
  }

  handleChange = (value, key, type) => {
    const { visible } = this.state
    const initialValue = this.props.value
    if (type === 'checked') {
      initialValue[key].type = value
      // initialValue[key].value = undefined
      // 当取消选择的时候，再次选中还应该是图标的状态
      if (!value) {
        this.setState({
          visible: _.filter(visible, item => item !== key)
        })
      }
    } else {
      initialValue[key].value = value
    }
    this.props.onChange(initialValue)
  }

  handleClick = value => {
    const { visible } = this.state
    if (_.includes(visible, value)) {
      this.setState({
        visible: _.filter(visible, item => item !== value)
      })
    } else {
      this.setState({ visible: [...visible, value] })
    }
  }

  render() {
    const { item, value, getFieldValue } = this.props
    const { visible } = this.state
    return (
      <ul className="create-field-resource-usescene">
        {_.map(item.params, param => {
          // 单选的时候没有批量编辑
          if (param.value === 'batchEdit' && getFieldValue('isSingle') === '0') {
            return null
          }
          // 单选的时候没有导入导出
          if (param.value === 'importOrExport' && getFieldValue('isSingle') === '0') {
            return null
          }
          return (
            <li className="create-field-resource-usescene-item" key={param.value}>
              <Checkbox
                disabled={param.disabled}
                checked={value[param.value].type}
                onChange={e => {
                  this.handleChange(e.target.checked, param.value, 'checked')
                }}
              >
                {param.label}
              </Checkbox>
              {!_.includes(visible, param.value) && value[param.value].type && (
                <Tooltip title="自定义名称">
                  <i
                    className="icon-bianji iconfont"
                    onClick={() => {
                      this.handleClick(param.value)
                    }}
                  />
                </Tooltip>
              )}
              {_.includes(visible, param.value) && value[param.value].type && (
                <Input
                  style={{ width: '200px', padding: '0' }}
                  value={value[param.value].value}
                  prefix={
                    <Tooltip title="自定义名称">
                      <i className="icon-bianji iconfont" />
                    </Tooltip>
                  }
                  onChange={e => {
                    this.handleChange(e.target.value, param.value, 'input')
                  }}
                  onBlur={e => {
                    if (value[param.value].value) {
                      return false
                    }
                    this.handleClick(param.value)
                  }}
                />
              )}
            </li>
          )
        })}
      </ul>
    )
  }
}
