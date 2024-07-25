import React from 'react'
import ButtonWrap from './buttonWrap'
import TableWrap from './tableWrap'
import { Provider } from 'mobx-react'
import NodeStore from './nodeStore'
import { autorun, toJS } from 'mobx'

import './index.less'
const nodeStore = new NodeStore()
class Directory extends React.Component {
  state={
    visible: false,
    editData: {}
  }

  handleSearch = (value) => {
    nodeStore.setKw(value, 'value')
  }

  componentDidMount() {
    this.disposer = autorun(() => {
      const { kw, pageNum, pageSize } = nodeStore
      const data = {
        kw,
        pageNum,
        pageSize
      }
      nodeStore.getNodeList(data)
    })
  }

  editNode = (record) => {
    this.setState({
      visible: true,
      editData: record
    })
  }

  changeVisible = () => {
    this.setState({
      visible: true,
      editData: {}
    })
  }

  onCancel =() => {
    this.setState({
      visible: false
    })
  }

  render() {
    const { visible, editData } = this.state
    return (
      <Provider nodeStore={nodeStore}>
        <div>
          <ButtonWrap
            handleSearch={this.handleSearch}
            editData={editData}
            visible={visible}
            changeVisible={this.changeVisible}
            onCancel={this.onCancel}
          />
          <TableWrap editNode={this.editNode} />
        </div>
      </Provider>
    )
  }
}
export default Directory