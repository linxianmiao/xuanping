import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { BasicInfo, Field, FlowList, ParamSetting, FieldList } from '../component'

import { Footer } from './index'

import './style/tabPane.less'
import FlowStore from '../store/flowStore'

@inject('basicInfoStore', 'leaveStore', 'paramStore', 'selectGroupsStore', 'formSetGridStore')
@observer
@Injectable({ cooperate: 'mobx' })
class TabPane extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)
    this.state = {
      modelData: {},
      res: []
    }
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  async componentDidMount() {
    if (this.context.modelId) {
      this.props.formSetGridStore.setData('private', 'type')
      this.props.formSetGridStore.getGridList(this.context.modelId)
      this.props.paramStore.queryParamList({
        model_id: this.context.modelId,
        page_size: 10,
        page_num: 1
      })
      axios.get(API.querySceneTypes).then((res) => {
        this.setState({
          res
        })
      })
    }
  }

  getTabPaneData = (type, callback) => {
    this[type].props.form.validateFields((errors, values) => {
      if (errors) return false
      if (type === 'basicinfo' && values.modelStageScopeVo) {
        values.modelStageScopeVo = {
          dictionaryCode: values.modelStageScopeVo.value,
          dictionaryName: values.modelStageScopeVo.label
        }
      }
      const { key: code, label: name } = _.get(values, 'modelTypeVo')
      values.childModel = values.childModel ? 1 : 0
      values.layoutId = values.layoutVos.key

      callback(
        _.assign(
          {
            modelTypeVo: { code, name }
          },
          _.omit(values, ['modelIcon', 'layoutVos', 'modelTypeVo']),
          values.modelIcon
        )
      )
    })
  }

  render() {
    const { visibleKey, changeVisbleKey } = this.props
    const { modelData } = this.state
    return (
      <div>
        <div className="tab-pane-wrap">
          <div className="tab-pane" style={{ display: visibleKey === '1' ? 'block' : 'none' }}>
            {visibleKey === '1' && (
              <BasicInfo
                modelData={modelData}
                wrappedComponentRef={(inst) => {
                  this.basicinfo = inst
                }}
                leaveStore={this.props.leaveStore}
              />
            )}
          </div>
          <div className="tab-pane" style={{ display: visibleKey === '5' ? 'block' : 'none' }}>
            {visibleKey === '5' && <FieldList modelId={this.context.modelId} />}
          </div>
          <div className="tab-pane" style={{ display: visibleKey === '2' ? 'block' : 'none' }}>
            {visibleKey === '2' && <Field />}
          </div>
          <div className="tab-pane" style={{ display: visibleKey === '3' ? 'block' : 'none' }}>
            {visibleKey === '3' && (
              <FlowList
                res={this.state.res}
                modelId={this.context.modelId}
                changeVisbleKey={changeVisbleKey}
              />
            )}
          </div>
          <div className="tab-pane" style={{ display: visibleKey === '4' ? 'block' : 'none' }}>
            {visibleKey === '4' && <ParamSetting modelId={this.context.modelId} />}
          </div>
        </div>
        {visibleKey !== '2' && (
          <Footer visibleKey={visibleKey} getTabPaneData={this.getTabPaneData} />
        )}
      </div>
    )
  }
}
export default TabPane
