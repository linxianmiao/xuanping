import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import Switch from './switch'
import Person from './person/index'
import Default from './default/index'
import PageHeader from '~/components/pageHeader'
import './style/index.less'

@inject('globalStore')
@withRouter
@observer
class Overview extends Component {
  constructor (props) {
    super(props)
    const { type } = props.match.params
    this.state = {
      viewIndex: type === 'default' ? '2' : '1'
    }
  }

  componentDidMount() {
    this.props.globalStore.getTicketPriority()
  }

  handleChange = value => {
    if (value === '1') {
      this.props.history.replace('/ticket/pandect/person')
    } else {
      this.props.history.replace('/ticket/pandect/default')
    }
  }

  componentWillReceiveProps (nextProps) {
    const type = nextProps.match.params.type
    this.setState({ viewIndex: type === 'default' ? '2' : '1' })
  }

  render () {
    const { viewIndex } = this.state
    const { globalOverview } = this.props.globalStore.configAuthor
    return (
      <div className="overview">
        <PageHeader />
        { globalOverview && <Switch onChange={this.handleChange} viewIndex={viewIndex} /> }
        { ((globalOverview && viewIndex === '1') || (typeof globalOverview === 'boolean' && !globalOverview)) && <Person /> }
        { (globalOverview && viewIndex === '2') && <Default globalStore={this.props.globalStore} /> }
      </div>
    )
  }
}

export default Overview
