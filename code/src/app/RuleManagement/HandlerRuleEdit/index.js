import React, { Component, Fragment } from 'react'
import { Button, message } from '@uyun/components'
import { Provider, inject, observer } from 'mobx-react'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import Spin from '~/components/spin'
import matrixStore from '~/system/stores/matrixStore'
import getURLParam from '~/utils/getUrl'
import Form from './Form'

@inject('handleRuleStore')
@observer
export default class RuleEdit extends Component {
  constructor(props) {
    super(props)
    this.ruleForm = React.createRef()
    this.state = {
      loading: 'load'
    }
  }

  get id() {
    return this.props.match.params.id
  }

  async componentDidMount() {
    const { scenesList, currentRule } = this.props.handleRuleStore
    if (_.isEmpty(scenesList)) {
      this.props.handleRuleStore.getRuleScenes()
    }
    if (this.id && _.isEmpty(currentRule)) {
      await this.props.handleRuleStore.getRule(this.id)
    }
    this.setState({ loading: '' })
  }

  componentWillUnmount() {
    this.props.handleRuleStore.setData({
      currentRule: null
    })
  }

  handleSave = async () => {
    const data = await this.ruleForm.current.validate()
    const res = await this.props.handleRuleStore.saveRule(
      _.assign({}, data, {
        type: 'HANDLER_RULE',
        id: this.id && getURLParam('action') === 'edit' ? this.id : undefined
      })
    )
    if (+res === 200) {
      message.success('保存成功')
      this.props.history.replace('/conf/handleRule')
    }
  }

  render() {
    const action = getURLParam('action')
    const { loading } = this.state
    return (
      <Provider matrixStore={matrixStore}>
        <Fragment>
          <PageHeader />
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            {loading === 'load' ? (
              <Spin />
            ) : (
              <Form wrappedComponentRef={this.ruleForm} disabledCode={action === 'edit'} />
            )}
            <Button className="u4-col-offset-3" onClick={this.handleSave} type="primary">
              {i18n('globe.save', '保存')}
            </Button>
          </ErrorBoundary>
        </Fragment>
      </Provider>
    )
  }
}
