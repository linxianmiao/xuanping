import React, { Component } from 'react'
import { observer } from 'mobx-react'
import Condition from '../../../../condition/index'
import { Select } from '@uyun/components'
import RelatedParam from './relatedParam'
import PropTypes from 'prop-types'

// import '../style/panelContent.less'

@observer
class PanelContent extends Component {
    static contextTypes = {
      modelId: PropTypes.string
    }

    setTriggerData = (triggerIndex, value) => {
      const { triggerData } = this.props
      triggerData.params = value
      this.props.setTriggerData(this.props.Index, value, 'params')
    }

    handleContitionChange = value => {
      this.props.setTriggerData(this.props.Index, value[0], 'triggerConditions')
    }

    handleIncidentChange = value => {
      this.props.setTriggerData(this.props.Index, value, 'double')
    }

    render () {
      const { triggerData } = this.props
      return (<div className="panel-content">
        <p>{i18n('trigger_condition', '触发条件')}</p>
        <Condition modelId={this.context.modelId} defaultData={[triggerData.triggerConditions]} onChange={this.handleContitionChange} filter />
        <p>{i18n('relation_arrange', '关联编排')}</p>
        <Select />
        <p>{i18n('params_mapping', '参数映射')}</p>
        <RelatedParam />
      </div>)
    }
}

export default PanelContent
