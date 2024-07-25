import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Tag, Dropdown, Menu } from '@uyun/components'

@inject('searchStore')
@observer
class Header extends Component {
  state = {
    queryContent: undefined,
    visible: false
  }

  componentDidMount() {
    // 查询历史搜索关键字
    this.props.searchStore.queryHistoryKeywords()
  }

  handleInputChange = (value) => {
    const { conditions, setConditions } = this.props.searchStore
    setConditions({ ...conditions, queryContent: value, pageNum: 1, pageSize: 15 })

    this.setState({ visible: false })
  }

  renderHistoryKeywords = () => {
    const { historyKeywords } = this.props.searchStore

    return (
      <Menu>
        {historyKeywords.map((item, index) => (
          <Tag
            key={index + ''}
            onClick={() => {
              this.setState({ queryContent: item })
              this.handleInputChange(item)
            }}
          >
            {item}
          </Tag>
        ))}
      </Menu>
    )
  }

  render() {
    const { queryContent, visible } = this.state

    return (
      <div className="search-drawer-header">
        <div>
          <Dropdown
            overlay={this.renderHistoryKeywords()}
            overlayClassName="search-history-dropdown"
            trigger={['click']}
            visible={visible}
            onVisibleChange={(visible) => this.setState({ visible })}
          >
            <Input.Search
              placeholder={i18n('globe.keywords', '请输入关键字')}
              allowClear
              enterButton
              value={queryContent}
              onChange={(e) => this.setState({ queryContent: e.target.value, visible: false })}
              onSearch={(value) => this.handleInputChange(value)}
              onClear={() => {
                this.setState({ queryContent: undefined })
                this.handleInputChange()
              }}
            />
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default Header
