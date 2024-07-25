import React, { Component } from 'react'
import ProcessSetField from 'pages/config/model/process/processSetField.jsx'
import ProcessSetStage from 'pages/config/model/process/processSetStage.jsx'
import AutoMation from './automation'

class processSet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      active: {},
      err: 0,
      stageNameList: [],
      visible: false,
      autoList: [], // 编排列表
      access: '0' // 是否装了automation
    }
    this.activeStage = this.activeStage.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  componentDidMount () {
    const { tacheList } = this.props
    let stageNameList = [] // 当前已拥有的环节名称
    stageNameList = _.map(tacheList, tache => {
      if (tache.type) {
        return _.map(tache.parallelismActivityVos, parall => parall.name)
      } else {
        return tache.name
      }
    })

    axios.get(API.get_auto_list).then(res => {
      this.setState({
        autoList: res.autoList,
        access: res.access
      })
    })

    this.setState({
      active: {
        item: _.cloneDeep(tacheList[0]),
        data: undefined,
        type: 'flow'
      },
      stageNameList
    })
    this.processSetStage.activeStage(_.cloneDeep(tacheList[0]), undefined, 'flow')
  }

  // 当前激活的环节，控制右边的状态处于哪一个环节
  activeStage (item, data, type) {
    this.setState({
      visible: false
    })
    setTimeout(() => {
      this.setState({
        active: { item, data, type },
        visible: true
      })
    }, 0)
  }

  // 右边部分是够不符合
  handleError (err) {
    this.setState({
      err
    })
  }

  render () {
    const { tacheList } = this.props
    const { active, visible, err, stageNameList, autoList, access } = this.state
    return (
      <div className="model-form-section process-set">
        <h3>
          <strong>流程设定</strong>
        </h3>

        <div className="process-set-wrap" id="process-set-wrap" style={{ position: 'relative' }}>
          <ProcessSetStage
            ref={node => this.processSetStage = node}
            falt={err}
            tacheList={tacheList}
            activeStage={this.activeStage}
            stageNameList={stageNameList}
            access={access}
          />
          {
            visible
              ? active.type === 'autoM'
                ? <AutoMation
                  tacheList={tacheList}
                  active={active}
                  autoList={autoList}
                />
                : <ProcessSetField
                  tacheList={tacheList}
                  active={active}
                  handleError={this.handleError}
                />
              : null
          }
        </div>
      </div>
    )
  }
}

export default processSet
