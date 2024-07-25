import React, { Component } from 'react'
import * as mobx from 'mobx'
import { observer } from 'mobx-react'
import Card from './card'

function handleScroll (callback, height, showLoadMore, e) {
  let scrollTop = 0 // 滚动高度
  let scrollHeight = 0 // 内容高度 包括不可见区域
  let offsetHeight = 0 // 内容高度 可见区域

  scrollTop = e.srcElement.scrollTop
  scrollHeight = e.srcElement.scrollHeight
  offsetHeight = e.srcElement.offsetHeight
  if (scrollHeight - (scrollTop + offsetHeight) < height && showLoadMore) {
    callback()
  }
}

@observer
class CardList extends Component {
    // 改变页码
    handleChange = () => {
      if (!this.props.ticketListStore.loading) {
        const { screenData } = mobx.toJS(this.props.ticketListStore)
        const page = screenData.current + 1
        this.props.ticketListStore.switchSceenData({ current: page })
      }
    }

    componentDidMount () {
      document.getElementById('ticket-list').addEventListener('scroll', e => {
        handleScroll(this.handleChange, 200, this.props.ticketListStore.showLoadMore, e)
      })
    }

    render () {
      const { ticketList } = mobx.toJS(this.props.ticketListStore)
      return (
        <div className="ticket-list-cardList clearfix">
          {
            ticketList.map(data => {
              return (
                <Card
                  key={data.ticketId + data.tacheId + data.caseId}
                  ticket={data}
                  moreOpeartion={this.props.moreOpeartion}
                />
              )
            })
          }
        </div>
      )
    }
}

export default CardList
