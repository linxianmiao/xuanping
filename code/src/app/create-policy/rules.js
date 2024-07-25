import React, { Component } from 'react'
import { Row, Col } from '@uyun/components'
import TriggerRules from '../components/triggerRules'
import { observer } from 'mobx-react'

@observer
class Rules extends Component {
    handleContitionChange = (value) => {
      this.props.onChange(value[0])
    }

    render () {
      const { modelId, value } = this.props
      return (
        <Row>
          <Col offset={2} span={18} style={{ maxWidth: 800 }}>
            <TriggerRules
              modelId={modelId}
              value={value}
              onChange={this.handleContitionChange} />
          </Col>
        </Row>
      )
    }
}

export default Rules
