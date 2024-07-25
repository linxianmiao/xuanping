import React, { Component } from 'react'
import { Card } from '@uyun/components'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import ScenesList from './ScenesList'
import RuleTable from './RuleTable'
import RuleSearch from './RuleSearch'
import RuleModel from './RuleModel'
import styles from './index.module.less'
@inject('handleRuleStore')
@observer
export default class RuleManagement extends Component {
  state = {
    dataSource: []
  }

  // 获取规则场景列表
  getRuleScenes = _.debounce(this.props.handleRuleStore.getRuleScenes, 300, { leading: true, trailing: false })

  // 获取规则列表
  getRulesWithPage = _.debounce(this.props.handleRuleStore.getRulesWithPage, 300, { leading: true, trailing: false })

  componentDidMount() {
    this.getRuleScenes()
    this.disposer = autorun(() => {
      const { ruleQuery } = this.props.handleRuleStore
      this.getRulesWithPage()
    })
  }

  componentWillUnmount() {
    this.disposer()
  }

  handleChangeModel = async (query) => {
    const res = await this.props.handleRuleStore.listRuleModelInfos(query)
    this.setState({ dataSource: res })
  }

  getCardTitle = () => {
    const { ruleQuery, scenesList } = this.props.handleRuleStore
    const { sceneId } = ruleQuery
    switch (sceneId) {
      case 'all':return '全部规则'
      case '0' : return '未分类规则'
      default: return _.chain(scenesList)
        .find(item => item.id === sceneId)
        .get('name')
        .value()
    }
  }

  render() {
    const { dataSource } = this.state
    return (
      <div className={styles.handleList}>
        <header className={styles.handlesHeader}>
          根据条件或矩阵定义特定业务的审批关系，通过关联流程设计中的人员规则，动态赋值给流程审批节点的处理人
          <a target="_blank" href={API.exportTemplate}>下载模板</a>
        </header>
        <section className={styles.handlesSection}>
          <ScenesList getRuleScenes={this.getRuleScenes} />
          <Card
            type="inner"
            title={this.getCardTitle()}
            className={styles.rulesWrap}
          >
            <RuleSearch
              handleChangeModel={this.handleChangeModel} />
            <RuleTable
              handleChangeModel={this.handleChangeModel} />
          </Card>
        </section>
        <RuleModel
          dataSource={dataSource}
          handleChangeModel={this.handleChangeModel} />
      </div>
    )
  }
}