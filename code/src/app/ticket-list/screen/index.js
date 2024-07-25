import React, { Component } from 'react'
import { observer } from 'mobx-react'
import SwitchCardOrTable from './switch'
import AdvancedScreen from './advancedScreen'
import MoreScreenList from './moreScreenList'
import './style/index.less'

@observer
class ScreenIndex extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showScreen: true,
      searchData: {}
    }
  }

  // 控制更多筛选的显示与隐藏
    handleScreen = () => {
      this.setState({
        showScreen: !this.state.showScreen
      })
    }

    // 改变查询条件
    handleScreenData = obj => {
      this.setState({
        searchData: _.assign({}, this.state.searchData, obj)
      })
    }

    // 进行查询
    handleInquire = () => {
      this.props.ticketListStore.switchSceenData(this.state.searchData)
    }

    // 重置
    handleReset = () => {
      this.setState({ searchData: {} })
    }

    render () {
      return (
        <div>
          <div className="screen-wrap clearfix">
            <AdvancedScreen
              searchData={this.state.searchData}
              showScreen={this.state.showScreen}
              handleScreen={this.handleScreen}
              handleScreenData={this.handleScreenData}
            />
            <SwitchCardOrTable
              ticketListStore={this.props.ticketListStore} />
          </div>
          <MoreScreenList
            isShow={this.state.showScreen ? 'show' : 'hide'}
            handleScreenData={this.handleScreenData}
            searchData={this.state.searchData}
            handleInquire={this.handleInquire}
            handleReset={this.handleReset} />
        </div>
      )
    }
}

export default ScreenIndex
