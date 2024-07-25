import React, { Component } from 'react'
import { Input, Checkbox, Select, TreeSelect } from '@uyun/components'
const Option = Select.Option
const TreeNode = TreeSelect.TreeNode
class Search extends Component {
  state = {
    value: undefined
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.kw !== nextProps.kw) {
      this.setState({
        value: nextProps.kw
      })
    }
  }

  _renderDepart = (item) => {
    return _.map(item, (ite) => {
      return (
        <TreeNode value={ite.id} title={ite.name} key={ite.id}>
          {!_.isEmpty(ite.childrens) && this._renderDepart(ite.childrens)}
        </TreeNode>
      )
    })
  }

  render() {
    const { isUseVariable, tab, isShowUserVariable, groupSelectUserList, groupId } = this.props
    const { value } = this.state
    return (
      <div className="user-search-warp clearfix">
        {tab === '1' && (
          <Select
            style={{ width: '168px', margin: '0 10px' }}
            allowClear
            showSearch
            value={groupId}
            optionFilterProp="children"
            placeholder={i18n('globe.selectUserGroup', '请选择用户组')}
            notFoundContent={i18n('globe.notFound', '无法找到')}
            onChange={(e) => {
              this.props.handleSearch(e, 'groupId')
            }}
          >
            {_.map(groupSelectUserList, (item) => (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        )}
        <Input.Search
          value={value}
          allowClear
          enterButton
          onChange={(e) => {
            this.setState({ value: e.target.value })
          }}
          onSearch={(value) => {
            this.props.handleSearch(value, 'kw')
          }}
          onClear={(e) => {
            this.props.handleSearch(e.target.value, 'kw')
          }}
          style={{ width: '285px', height: '32px' }}
          placeholder={i18n('globe.keywords', '请输入关键字')}
        />
        {isShowUserVariable && tab === '5' && (
          <div className="variable-select-wrap">
            <Checkbox checked={isUseVariable} onChange={this.props.onChange}>
              {i18n('variable-tip', '当变量有值时，仅选择变量值作为处理人')}
            </Checkbox>
          </div>
        )}
      </div>
    )
  }
}

export default Search
