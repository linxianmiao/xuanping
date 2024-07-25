import React, { Component, Fragment, Suspense } from 'react'
import { inject, observer } from 'mobx-react'
import DOMPurify from 'dompurify'
import { withRouter } from 'react-router-dom'
import { DownOutlined } from '@uyun/icons'
import { List, Spin, Empty, Dropdown, Menu } from '@uyun/components'

const { sanitize } = DOMPurify
const sortNames = {
  _score: i18n('sort.by.match', '按匹配度排序'),
  createTime: i18n('sort.by.time', '按时间排序')
}

@inject('searchStore')
@withRouter
@observer
class Content extends Component {
  handlePaginationChange = (pageNum, pageSize) => {
    const { conditions, setConditions } = this.props.searchStore

    setConditions({ ...conditions, pageNum, pageSize })
  }

  handleSortKeyChange = (key) => {
    const { conditions, setConditions } = this.props.searchStore

    setConditions({ ...conditions, sort: key })
  }

  renderMenu = () => {
    return (
      <Menu onClick={({ key }) => this.handleSortKeyChange(key)}>
        <Menu.Item key="_score">{sortNames._score}</Menu.Item>
        <Menu.Item key="createTime">{sortNames.createTime}</Menu.Item>
      </Menu>
    )
  }

  handleClick = (id) => {
    this.props.onClose()
    this.props.history.push(`/ticket/detail/${id}`)
  }

  render() {
   
    const { data, total, conditions, loading, isSearched } = this.props.searchStore

    const pagination = {
      current: conditions.pageNum,
      pageSize: conditions.pageSize,
      showTotal: true,
      total,
      size: 'small',
      onChange: this.handlePaginationChange
    }

    const hasData = data && data.length > 0

    return (
      <Fragment>
        {hasData ? (
          <div className="search-drawer-mid">
            <span className="search-total-tip">
              {i18n('find.result.number', '为你找到相关结果 {total} 个', { total })}
            </span>
            <Dropdown trigger={['click']} overlay={this.renderMenu()}>
              <a>
                {sortNames[conditions.sort]}
                <DownOutlined />
              </a>
            </Dropdown>
          </div>
        ) : (
          <div style={{ height: 50 }} />
        )}
        <Spin spinning={loading}>
          {hasData ? (
            <List
              itemLayout="vertical"
              dataSource={data}
              pagination={total && total > 0 ? pagination : false}
              renderItem={(item, index) => {
                return (
                  <Suspense fallback={<Empty type="loading" />}>
                    <List.Item key={index + ''} onClick={() => this.handleClick(item.id)}>
                      <List.Item.Meta
                        title={item.title}
                        description={
                          <div dangerouslySetInnerHTML={{ __html: sanitize(item.content) }} />
                        }
                      />
                      {`${item.createTime}/${item.creator}`}
                    </List.Item>
                  </Suspense>
                )
              }}
            />
          ) : isSearched ? (
            <Empty type="search" />
          ) : null}
        </Spin>
      </Fragment>
    )
  }
}

export default Content
