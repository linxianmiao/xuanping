import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FlowChart from './flow/index'
import { Providers } from '@uyun/everest-injectable'

import {
  ScaleModule,
  AlignmentModule,
  CaptureHistoryModule,
  Themes,
  RightClickMenuModule
} from '@uyun/everest-show'

const { ScaleService } = ScaleModule

const { AlignmentService } = AlignmentModule

const { CaptureHistoryService } = CaptureHistoryModule
const { ContextMenuService } = RightClickMenuModule
const {
  THEME_CONFIG,
  switchTheme
  // BASE_URL
} = Themes

const FlowModule = Providers.create([
  ScaleService,
  AlignmentService,
  CaptureHistoryService,
  ContextMenuService,
  { provide: THEME_CONFIG, useFactory: switchTheme }
])

class Flow extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <FlowModule>
        <FlowChart {...this.props} modelId={this.context.modelId} />
      </FlowModule>
    )
  }
}

export default Flow
