import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Button, Alert } from '@uyun/components'
import { Link } from 'react-router-dom'
import RuleImport from './RuleImport'
import styles from './index.module.less'

@inject('handleRuleStore')
@observer
export default class RuleTable extends Component {
  onChange = (value) => {
    const { ruleQuery } = this.props.handleRuleStore
    this.props.handleRuleStore.setDate({
      ruleQuery: _.assign({}, _.omit(ruleQuery, ['kw']), { kw: value })
    })
  }

  onSearch = (e) => {
    const value = typeof e === 'string' ? e : e.target.value
    this.onChange(value)
  }

  createAlertDOM = (sceneId) => {
    const { scenesList } = this.props.handleRuleStore
    const scene = _.find(scenesList, (item) => item.id === sceneId)
    const { description, modelIds } = scene || {}
    if (_.isEmpty(description) && _.isEmpty(modelIds)) {
      return null
    }
    return (
      <Alert
        message={
          <span>
            {description}（已关联模型
            {_.isEmpty(modelIds) ? 0 : <a>modelIds.lenght</a>}
            条）
          </span>
        }
      />
    )
  }

  render() {
    const { ruleQuery, rules } = this.props.handleRuleStore
    const { kw, sceneId } = ruleQuery
    return (
      <div className={styles.ruleSearch}>
        {this.createAlertDOM(sceneId)}
        <article className={styles.ruleSearchArticle}>
          <div>
            <Input.Search
              allowClear
              value={kw}
              enterButton
              style={{ width: 256 }}
              onChange={this.onChange}
              onSearch={this.onSearch}
              onClear={this.onSearch}
              placeholder={i18n('globe.keywords', '请输入关键字')}
            />
          </div>
          <div>
            <RuleImport />
            <Button type="primary">
              <Link to="/conf/handleRule/create">新建规则</Link>
            </Button>
          </div>
        </article>
      </div>
    )
  }
}
