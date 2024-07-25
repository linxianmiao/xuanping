import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Input, Popover } from '@uyun/components'
import { inject } from '@uyun/core'
import './TicketView.less'
// 查询视图组件
@observer
class TicketView extends Component {
  @inject('i18n') i18n
  @inject('listStore') listStore

  state = {
    editId: '',
    editName: '',
    visible: false
  }

  componentDidMount() {
    this.listStore.getViewList()
  }

  renderContent = list => {
    const { editId, editName } = this.state
    return (
      <ul className="ticket-filter-view-list">
        {_.map(list, item => {
          return (
            item.id === editId
              ? <li className="clearfix" key={item.id}>
                <span data-length={`${10 - editName.length}`} className="input-wrap">
                  <Input
                    value={editName}
                    onChange={e => {
                      if (e.target.value.length <= 10) {
                        this.setState({ editName: e.target.value })
                      }
                    }} />
                </span>
                <span>
                  <i style={{ marginRight: 5 }} className="iconfont icon-dui" onClick={async e => {
                    e.stopPropagation()
                    const { editId: id, editName: name } = this.state
                    await this.listStore.updateViewName({ id, name })
                    this.setState({
                      editId: '',
                      editName: ''
                    })
                  }} />
                  <i className="iconfont icon-cha" onClick={e => {
                    e.stopPropagation()
                    this.setState({
                      editId: '',
                      editName: ''
                    })
                  }} />
                </span>
              </li>
              : <li className="clearfix" key={item.id} onClick={async () => {
                this.props.handleChangeViewId(item.id, item.name)
                this.onVisibleChange(false)
              }}>
                <span title={item.name}>{item.name}</span>
                <span>
                  <i style={{ marginRight: 5 }} className="iconfont icon-yijianfankui" onClick={e => {
                    e.stopPropagation()
                    this.setState({
                      editId: item.id,
                      editName: item.name
                    })
                  }} />
                  <i className="iconfont icon-shanchu" onClick={e => {
                    e.stopPropagation()
                    this.listStore.deleteView(item.id)
                  }} />
                </span>
              </li>
          )
        })}
      </ul>
    )
  }

  onVisibleChange = visible => {
    this.setState({ visible })
  }

  render() {
    const { viewName } = this.props
    const { viewList } = this.listStore
    const { visible } = this.state
    return (
      <Popover
        trigger="click"
        placement="bottom"
        visible={visible}
        overlayClassName="ticket-filter-popover-view-list"
        content={this.renderContent(viewList)}
        getPopupContainer={el => el}
        onVisibleChange={this.onVisibleChange}>
        <div className="ticket-filter-view-list-search-input">
          <Input
            value={viewName}
            placeholder={this.i18n('ticket-filter-view-tip', '请选择查询器')} />
          {
            viewName && <i className="icon-guanbi1 iconfont" onClick={e => {
              e.stopPropagation()
              this.props.handleChangeViewId(undefined, undefined)
            }} />
          }
        </div>
      </Popover>
    )
  }
}

export default TicketView
