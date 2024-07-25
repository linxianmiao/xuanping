import React, { Component } from 'react'
import { Stage, Layer } from 'react-konva'
import { Injectable, Inject } from '@uyun/everest-injectable'
// import textdata from './textdata'
import { Button } from '@uyun/components'

import {
  ScaleModule,
  FlowChartContainerModule,
  NodeShapeModule,
  GraphSelectModule,
  FlowLineModule,
  Themes
} from '@uyun/everest-show' // @uyun/everest-show

const { Scale, ScaleService } = ScaleModule

const { Container } = FlowChartContainerModule

const { NodeRect, NodeRhomb, NodeCircle, RECT, RHOMB, CIRCLE } = NodeShapeModule

const { FlowLine } = FlowLineModule

const { SelectGraphs, SelectGraphsService } = GraphSelectModule
const { THEME_CONFIG, switchTheme } = Themes
@Injectable()
class FlowChart extends Component {
  static providers = [
    ScaleService,
    SelectGraphsService,
    { provide: THEME_CONFIG, useFactory: switchTheme }
  ]

  state = {
    display: false,
    top: 0,
    left: 0,
    node: ''
  }

  @Inject(ScaleService) scaleService

  onMouseEnter(node) {
    const { x, y } = this.stage.getStage().getPointerPosition()
    this.setState({
      display: true,
      top: y + 10,
      left: x + 30,
      node: node.toJS()
    })
  }

  onMouseLeave(node) {
    this.setState({
      display: false
    })
  }

  nodeRender = ({ active, node }) => {
    switch (node.get('shape')) {
      case RECT:
        return (
          <NodeRect
            {...node.toJS()}
            onMouseLeave={() => this.onMouseLeave(node)}
            onMouseMove={() => this.onMouseEnter(node)}
            key={node.get('id')}
            active={active}
          />
        )
      case RHOMB:
        return (
          <NodeRhomb
            {...node.toJS()}
            onMouseLeave={() => this.onMouseLeave(node)}
            onMouseMove={() => this.onMouseEnter(node)}
            key={node.get('id')}
            active={active}
          />
        )
      case CIRCLE:
        return (
          <NodeCircle
            onMouseLeave={() => this.onMouseLeave(node)}
            onMouseMove={() => this.onMouseEnter(node)}
            {...node.toJS()}
            key={node.get('id')}
            active={active}
          />
        )
      default:
        break
    }
  }

  linkRender = (linkData) => {
    const { id } = linkData
    return <FlowLine edit={false} {...linkData} key={id} />
  }

  onClick = () => {}

  render() {
    const { left, top, display, node, visible } = this.state
    return (
      <div style={{ height: this.props.height || 500 }}>
        <div style={{ display: visible ? 'block' : 'none' }}>
          <Button className="process-button" onClick={this.autoZoom}>
            {i18n('autoZoom', '自动居中')}
          </Button>
          <Stage
            draggable
            width={this.props.width || 750}
            height={this.props.height || 500}
            ref={(stage) => {
              this.stage = stage
            }}
          >
            <Layer>
              <Scale wheel>
                <SelectGraphs
                  shapes={this.props.nodes}
                  padding={{ left: 20, right: 40, top: 20, bottom: 40 }}
                >
                  <Container
                    id="hdap-flow-chart"
                    links={this.props.links}
                    nodes={this.props.nodes}
                    edit={false}
                    nodeRender={this.nodeRender}
                    linkRender={this.linkRender}
                    closeHotKey={['boxSelect']}
                    onClick={this.onClick}
                  />
                </SelectGraphs>
              </Scale>
            </Layer>
          </Stage>
          {node && display && (
            <div
              className="chart-tip-wrap"
              style={{
                position: 'absolute',
                top: top,
                left: left,
                display: 'block'
                // zIndex: 10000
              }}
              dangerouslySetInnerHTML={{ __html: node.tooltipText1 }}
            />
          )}
        </div>
      </div>
    )
  }

  autoZoom = () => {
    this.scaleService.autoZoom()
  }

  componentDidMount() {
    setTimeout(() => {
      this.autoZoom()
      this.setState({
        visible: true
      })
    }, 100)
  }
}

export default FlowChart
