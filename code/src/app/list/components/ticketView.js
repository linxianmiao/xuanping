import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { CloseOutlined, EditOutlined } from '@uyun/icons'
import { Input, Popover, Icon } from '@uyun/components'
import { autorun } from 'mobx'
import '../styles/ticketView.less'

@inject('listStore', 'globalStore')
@observer
class TicketView extends Component {
  state = {
    editId: '',
    editName: '',
    visible: false
  }

  componentDidMount() {
    this.disposer = autorun(() => {
      const { filterType } = this.props.listStore
      this.props.listStore.getViewList({
        viewCode: filterType === 'all' ? 'all_ticket' : filterType
      })
    }, {})
  }

  componentWillUnmount() {
    this.disposer()
  }

  _renderContent = (list) => {
    const { editId, editName } = this.state
    const { saveQueryView } = this.props.globalStore.ticketListOperation
    const { filterType } = this.props.listStore
    return (
      <ul className="ticket-filter-view-list">
        {_.map(list, (item) => {
          return item.id === editId ? (
            <li className="clearfix" key={item.id}>
              <span data-length={`${10 - editName.length}`} className="input-wrap">
                <Input
                  value={editName}
                  onChange={(e) => {
                    if (e.target.value.length <= 10) {
                      this.setState({ editName: e.target.value })
                    }
                  }}
                />
              </span>
              <span>
                <i
                  style={{ marginRight: 5 }}
                  className="iconfont icon-dui"
                  onClick={async (e) => {
                    e.stopPropagation()
                    const { editId: viewId, editName: name } = this.state

                    await this.props.listStore.updateViewName({
                      viewId,
                      name,
                      viewCode: filterType === 'all' ? 'all_ticket' : filterType
                    })
                    this.setState({
                      editId: '',
                      editName: ''
                    })
                  }}
                />
                <i
                  className="iconfont icon-cha"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.setState({
                      editId: '',
                      editName: ''
                    })
                  }}
                />
              </span>
            </li>
          ) : (
            <li
              className="clearfix"
              key={item.id}
              onClick={async () => {
                this.props.handleChangeViewId(item.id, item.name)
                await this.props.listStore.getQueryView({
                  id: item.id,
                  viewCode: filterType === 'all' ? 'all_ticket' : filterType
                })
                this.onVisibleChange(false)
              }}
            >
              <span title={item.name}>{item.name}</span>
              {
                // 如果没有视图的保存权限那个修改删除也应该没有
                saveQueryView && (
                  <span className="showIcon">
                    <EditOutlined
                      style={{ marginRight: 5 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        this.setState({
                          editId: item.id,
                          editName: item.name
                        })
                      }}
                    />
                    <CloseOutlined
                      onClick={(e) => {
                        e.stopPropagation()
                        this.props.listStore.deleteView(item.id)
                      }}
                    />
                  </span>
                )
              }
            </li>
          )
        })}
      </ul>
    )
  }

  onVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render() {
    const { viewName } = this.props
    const { viewList, filterType } = this.props.listStore
    const { menuList } = this.props.globalStore
    const { visible } = this.state
    const list = viewList
    return (
      <Popover
        trigger="click"
        placement="bottom"
        visible={visible}
        overlayClassName="ticket-filter-popover-view-list"
        content={this._renderContent(list)}
        getPopupContainer={(el) => el}
        onVisibleChange={this.onVisibleChange}
      >
        <div className="ticket-filter-view-list-search-input">
          <Input
            value={viewName}
            placeholder={i18n('please.select.query.view', '请选择查询视图')}
          />
          {viewName && (
            <i
              className="icon-guanbi1 iconfont"
              onClick={(e) => {
                e.stopPropagation()
                this.props.handleChangeViewId(undefined, undefined)
                this.props.listStore.getQueryView(
                  { id: undefined, viewCode: filterType === 'all' ? 'all_ticket' : filterType },
                  menuList.ticketMenuList || []
                )
              }}
            />
          )}
        </div>
      </Popover>
    )
  }
}

export default TicketView
