import React, { Component } from 'react'
import { Row, Col } from '@uyun/components'
import TriggerRules from '~/components/triggerRules'

class Rules extends Component {
    onChange = (value) => {
      this.props.onChange(value)
    }

    render () {
      const { value } = this.props
      return (
        <Row>
          <Col style={{ maxWidth: 800 }}>
            <TriggerRules
              value={value}
              triggerType="trigger"
              onChange={this.onChange} />
          </Col>
        </Row>
      )
    }
}

export default Rules
