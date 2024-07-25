import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { List } from '@uyun/components'
import { DeploymentUnitOutlined } from '@uyun/icons'

@inject('globalStore', 'modelListStore')
@observer
class ModelList extends Component {
  static defaultProps = {
    processCodes: []
  }
  state = {
    modelList: []
  }

  componentDidMount() {
    const { processCodes } = this.props
    window.LOWCODE_APP_KEY = this.props.appKey || this.props.appkey
    this.props.modelListStore.getModelList({ pageSize: 100 }).then((res) => {
      this.setState({
        modelList: res
          ? res.list.filter((item) =>
              Array.isArray(processCodes) && processCodes.length > 0
                ? processCodes.includes(item.processCode)
                : item
            )
          : []
      })
    })
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  render() {
    return (
      <div className="npm-create-ticket-model-list">
        <List
          grid={{
            gutter: 20,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 2,
            xxl: 2
          }}
          dataSource={this.state.modelList}
          renderItem={(item) => (
            <List.Item onClick={() => this.props.handleClickModel(item.processId)}>
              <div className="list-card">
                <div className="list-card-avatar">
                  {item.iconName ? (
                    <span className="list-card-avatar-icon">
                      <i className={`iconfont icon-${item.iconName}`} />
                    </span>
                  ) : (
                    <span className="list-card-avatar-icon">
                      <DeploymentUnitOutlined />
                    </span>
                  )}
                </div>
                <div className="list-card-content">
                  <div className="list-card-title" title={item.processName}>
                    {item.processName}
                  </div>
                  <div className="list-card-description" title={item.description || ''}>
                    {item.description || '暂无描述'}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    )
  }
}

export default ModelList
