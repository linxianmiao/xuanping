import React, { Component } from 'react'

class SelectedList extends Component {
    handleDelItem = item => {
      this.props.handleDelItem(item)
    }

    render () {
      const { selectedData } = this.props
      return (
        <ul className="item-list">
          {selectedData.map((item, index) => {
            return (
              <li key={index} className="selected_item">
                <div className="selected_name">
                  <span className="name">{item.name ? item.name : item.userName
                    ? item.userName : item.realname ? item.realname : item.groupName ? item.groupName : null}</span>
                  <i className="iconfont icon-cha" onClick={this.handleDelItem.bind(this, item)} />
                </div>
              </li>
            )
          })
          }
        </ul>
      )
    }
}

export default SelectedList
