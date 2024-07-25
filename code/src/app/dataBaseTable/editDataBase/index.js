import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import CreateDataBase from '../createDataBase'
import '../style/index.less'

@inject('dataBaseStore')
@observer
class EditDataBase extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.match.params.appkey
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  render() {
    return (
      <div className="databaseWrapper">
        <CreateDataBase source="edit" {...this.props} dataSetId={this.props.match.params.id} />
      </div>
    )
  }
}

export default EditDataBase
